import {
  decisionFacts,
  findPerfumeByName,
  getPerfume,
  matchBrand,
  isPublicPerfume,
  publicLead,
  leaningShare,
  referenceLabel,
  sharedAccordNames,
  sweetness,
} from "@/lib/catalog";
import { budgetLabel, lowerBudget, smallestBudget } from "@/lib/budgets";
import { faNum, joinFa } from "@/lib/format";
import { findKnowledge } from "@/lib/knowledge";
import { findReference, normalizeAsk } from "@/lib/references";
import type { Leaning, Perfume, Profile, Season } from "@/lib/types";

export type AskContext = {
  perfume?: Perfume;
  pair?: [Perfume, Perfume];
};

export type Reply =
  | { kind: "learn"; title: string; body: string; href?: string; hrefLabel?: string }
  | { kind: "compare"; title: string; body: string; a: string; b: string }
  | { kind: "refine"; body: string }
  | { kind: "miss"; body: string };

export function respond(raw: string, profile: Profile | null, results: Perfume[], context: AskContext = {}) {
  const text = normalize(raw).trim();
  if (!text) {
    return { profile, reply: { kind: "miss", body: "یک سؤال یا یک اصلاح بنویس." } as Reply };
  }

  const lesson = findKnowledge(text);
  if (lesson) {
    return {
      profile,
      reply: {
        kind: "learn",
        title: lesson.title,
        body: lesson.summary,
        href: `/learn/${lesson.slug}`,
        hrefLabel: "ادامه در دانستنی‌ها",
      } as Reply,
    };
  }

  if (context.perfume && /شبیه این/.test(text)) {
    return { profile, reply: similarReply(context.perfume) };
  }

  if (context.perfume && /تابست/.test(text) && /خوبه|مناسب|میاد|می‌آد/.test(text)) {
    return { profile, reply: summerReply(context.perfume) };
  }

  if (/برای من بهتر/.test(text)) {
    const pair = context.pair ?? pairFrom(results);
    if (!pair) return needPair();
    return { profile, reply: fitReply(profile, pair[0], pair[1]) };
  }

  if (/شیرین.?تر/.test(text)) {
    const pair = context.pair ?? pairFrom(results);
    if (!pair) return needPair();
    return { profile, reply: sweetnessReply(pair[0], pair[1]) };
  }

  if (/سوم|چهارم/.test(text)) {
    return { profile, reply: compareReply(results, 2, 3) };
  }

  if (/مقایسه|کدوم|کدام|این دو/.test(text) && results.length >= 2) {
    return { profile, reply: compareReply(results, 0, 1) };
  }

  if (/ماندگارتر/.test(text)) {
    if (!profile) return needList();
    const next: Profile = { ...profile, shift: "lasting", note: "ماندگارتر چیده شد." };
    return {
      profile: next,
      reply: { kind: "refine", body: "فهرست را با عطرهایی چیدم که ماندگاری‌شان در داده بالاتر است." } as Reply,
    };
  }

  if (/خنک/.test(text)) {
    if (!profile) return needList();
    const next: Profile = { ...profile, shift: "fresh", season: "summer", note: "خنک‌تر چیده شد." };
    return { profile: next, reply: { kind: "refine", body: "فهرست را با عطرهای خنک‌تر چیدم." } as Reply };
  }

  if (/ارزان/.test(text)) {
    if (!profile) return needList();
    const cheaper = lowerBudget(profile.budget);
    if (!cheaper) {
      return { profile, reply: { kind: "miss", body: `کف بودجه همین ${budgetLabel(smallestBudget())} است.` } as Reply };
    }
    const next: Profile = { ...profile, budget: cheaper, note: "سقف بودجه کمتر شد." };
    return {
      profile: next,
      reply: { kind: "refine", body: `سقف بودجه شد تا ${faNum(cheaper)} میلیون.` } as Reply,
    };
  }

  if (/متفاوت/.test(text)) {
    if (!profile) return needList();
    const next: Profile = { ...profile, shift: "different", note: "با ترکیب متفاوت چیده شد." };
    return {
      profile: next,
      reply: { kind: "refine", body: "عطرهایی را آوردم که ترکیب شیرین قبلی را تکرار نمی‌کنند." } as Reply,
    };
  }

  const referenced = referenceIn(text);
  if (referenced && profile && !hasScene(text)) {
    const label = referenceLabel(referenced);
    const next: Profile = { ...profile, reference: referenced, note: label ? `نزدیک به ${label} چیده شد.` : null };
    return { profile: next, reply: { kind: "refine", body: next.note ?? "پیشنهادها را دوباره چیدم." } as Reply };
  }

  const namedReference = findReference(text);
  if (namedReference && !hasScene(text) && !findPerfume(text)) {
    return {
      profile,
      reply: {
        kind: "learn",
        title: namedReference.nameFa,
        body: namedReference.why,
        href: `/reference/${namedReference.id}`,
        hrefLabel: `شناخت ${namedReference.nameFa}`,
      } as Reply,
    };
  }

  const named = findPerfume(text);
  if (named && !hasScene(text)) {
    return {
      profile,
      reply: {
        kind: "learn",
        title: `${named.nameFa}، ${named.brand}`,
        body: named.why,
        href: `/perfume/${named.slug}`,
        hrefLabel: `دیدن ${named.nameFa} و مشابه‌ها`,
      } as Reply,
    };
  }

  const parsed = parseLine(text);
  if (parsed) {
    return { profile: parsed, reply: { kind: "refine", body: "پیشنهادها را با این توصیف از نو چیدم." } as Reply };
  }

  return {
    profile,
    reply: {
      kind: "miss",
      body: "این را در دانستنی‌ها نداریم. می‌توانی بگویی خنک‌تر، ارزان‌تر، ماندگارتر، یا نام یک عطر آشنا.",
    } as Reply,
  };
}

export function findPerfume(input: string) {
  return findPerfumeByName(normalize(input));
}

export function isPerfumeLookup(input: string) {
  const text = normalize(input);
  return findPerfumeByName(text) !== null && !hasScene(text);
}

export type AskIntent =
  | {
      type: "perfume";
      slug: string;
      similar: boolean;
      /** Scroll to Iran cheaper alternatives on the perfume page. */
      cheaper: boolean;
      occasion: string | null;
      season: Season | null;
    }
  | { type: "reference"; id: string; occasion: string | null; season: Season | null; budget: number | null }
  | { type: "brand"; slug: string }
  | { type: "learn"; slug: string }
  | { type: "results"; profile: Profile }
  | { type: "miss" };

export function interpretQuery(raw: string): AskIntent {
  const text = normalize(raw).trim();
  if (!text) return { type: "miss" };

  const perfume = findPerfume(text);
  const reference = findReference(text);
  const scene = hasScene(text);
  const similar = /شبیه|مثل/.test(text);
  const cheaper = /ارزان|جایگزین|دوپ/.test(text);
  const parsed = scene || reference ? parseLine(text) : null;
  const occasion = parsed?.occasions[0] ?? null;
  const season = parsed && parsed.season !== "all" ? parsed.season : null;

  if (reference && !perfume) {
    return { type: "reference", id: reference.id, occasion, season, budget: parsed?.budget ?? null };
  }
  if (perfume && (similar || cheaper || !scene)) {
    return {
      type: "perfume",
      slug: perfume.slug,
      similar: similar || cheaper,
      cheaper,
      occasion: scene ? occasion : null,
      season: scene ? season : null,
    };
  }
  if (perfume && scene) {
    return { type: "perfume", slug: perfume.slug, similar: false, cheaper: false, occasion, season };
  }
  if (!scene) {
    const lesson = findKnowledge(text);
    if (lesson) return { type: "learn", slug: lesson.slug };
    const brand = matchBrand(text);
    if (brand) return { type: "brand", slug: brand.slug };
  }
  if (parsed && scene) return { type: "results", profile: parsed };
  return { type: "miss" };
}

export function parseLine(input: string): Profile | null {
  const text = normalize(input);
  if (!hasScene(text) && !referenceIn(text)) return null;

  let season: Season = "all";
  if (/زمست|سرد/.test(text)) season = "winter";
  else if (/تابست|گرما/.test(text)) season = "summer";
  else if (/معتدل|بهار|پاییز/.test(text)) season = "mild";

  const occasions: string[] = [];
  if (mentionsNight(text)) occasions.push("night");
  if (/کار|اداری|دفتر/.test(text)) occasions.push("office");
  if (/قرار/.test(text)) occasions.push("date");
  if (/ورزش/.test(text)) occasions.push("sport");
  if (/روزمره|هر روز/.test(text)) occasions.push("daily");
  if (/هدیه/.test(text) && occasions.length === 0) occasions.push("date");

  let budget: number | null = null;
  const amount = text.match(/(?:تا|زیر|کمتر از)\s*(\d+)/);
  if (amount) {
    const value = Number(amount[1]);
    if (!Number.isFinite(value) || value <= 0) return null;
    budget = value;
  }

  let shift: Profile["shift"] = "none";
  if (/ماندگار/.test(text)) shift = "lasting";
  else if (/تازه|خنک/.test(text)) shift = "fresh";

  let note: string | null = null;
  if (/پاییز/.test(text)) note = "برای هوای پاییزی چیده شد.";
  else if (/هدیه/.test(text)) note = "برای هدیه چیده شد.";
  else if (shift === "lasting") note = "عطرهای ماندگارتر جلو آمده‌اند.";
  else if (shift === "fresh") note = "عطرهای تازه‌تر و خنک‌تر جلو آمده‌اند.";
  else if (amount) note = `سقف بودجه تا ${budget} میلیون تومان.`;

  return {
    occasions: occasions.slice(0, 2),
    season,
    budget,
    reference: referenceIn(text),
    shift,
    leaning: leaningIn(text),
    note,
  };
}

function referenceIn(text: string) {
  return findReference(text)?.id ?? null;
}

function leaningIn(text: string): Leaning | null {
  if (/شیرین|وانیل|گرم و/.test(text)) return "sweet";
  if (/تلخ|چوبی|دودی/.test(text)) return "woody";
  if (/مرکبات|لیمو|ترنج/.test(text)) return "citrus";
  if (/آبی|دریا/.test(text)) return "aquatic";
  return null;
}

function compareReply(results: Perfume[], leftIndex: number, rightIndex: number): Reply {
  const left = results[leftIndex];
  const right = results[rightIndex];
  if (!left) {
    return { kind: "miss", body: "اول یک فهرست پیشنهاد بگیر تا بتوانم به همان عطرها اشاره کنم." };
  }
  if (!right) {
    const other = results[leftIndex === 0 ? 1 : leftIndex - 1];
    return {
      kind: "compare",
      title: left.nameFa,
      body: other
        ? `در این فهرست ${ordinalHint(rightIndex)} نیست. ${ordinalHint(leftIndex)} ${left.nameFa} است و ${ordinalHint(results.indexOf(other))} ${other.nameFa}.`
        : `${ordinalHint(leftIndex)} ${left.nameFa} است.`,
      a: other?.slug ?? left.slug,
      b: left.slug,
    };
  }

  const leftSweet = sweetness(left);
  const rightSweet = sweetness(right);
  const sweeter = Math.abs(leftSweet - rightSweet) < 0.08 ? null : leftSweet > rightSweet ? left : right;
  const body = sweeter
    ? `${ordinalHint(leftIndex)} ${left.nameFa} است و ${ordinalHint(rightIndex)} ${right.nameFa}. ${sweeter.nameFa} شیرین‌تر حس می‌شود، چون نوت‌های شیرینش پررنگ‌ترند.`
    : `${ordinalHint(leftIndex)} ${left.nameFa} است و ${ordinalHint(rightIndex)} ${right.nameFa}. از روی نوت‌های ثبت‌شده، شیرینی‌شان نزدیک است.`;

  return { kind: "compare", title: `${left.nameFa} و ${right.nameFa}`, body, a: left.slug, b: right.slug };
}

function ordinalHint(index: number) {
  return ["اولی", "دومی", "سومی", "چهارمی", "پنجمی"][index] ?? "یکی";
}

function needList() {
  return {
    profile: null,
    reply: { kind: "miss", body: "اول یک فهرست پیشنهاد بگیر تا بتوانم همان را اصلاح کنم." } as Reply,
  };
}

function needPair() {
  return {
    profile: null,
    reply: { kind: "miss", body: "اول دو عطر را برای مقایسه انتخاب کن." } as Reply,
  };
}

function pairFrom(results: Perfume[]): [Perfume, Perfume] | null {
  if (results.length < 2) return null;
  return [results[0], results[1]];
}

function sweetnessReply(left: Perfume, right: Perfume): Reply {
  const gap = Math.abs(sweetness(left) - sweetness(right));
  const sweeter = sweetness(left) > sweetness(right) ? left : right;
  return {
    kind: "compare",
    title: `${left.nameFa} و ${right.nameFa}`,
    body:
      gap < 0.08
        ? `از روی نوت‌های ثبت‌شده، شیرینی ${left.nameFa} و ${right.nameFa} نزدیک است.`
        : `${sweeter.nameFa} شیرین‌تر حس می‌شود، چون نوت‌های شیرینش پررنگ‌ترند.`,
    a: left.slug,
    b: right.slug,
  };
}

function fitReply(profile: Profile | null, left: Perfume, right: Perfume): Reply {
  const title = `${left.nameFa} و ${right.nameFa}`;
  const link = { a: left.slug, b: right.slug };
  if (!profile) {
    const facts = decisionFacts(left, right);
    return {
      kind: "compare",
      title,
      body: facts.length
        ? facts.map((item) => `${item.name}: ${item.fact}.`).join(" ")
        : "از روی قیمت تأییدشده و ماندگاری، این دو به هم نزدیک‌اند.",
      ...link,
    };
  }

  const leftScore = fitScore(left, profile);
  const rightScore = fitScore(right, profile);
  if (leftScore === rightScore) {
    const leftPrice = publicLead(left)?.price;
    const rightPrice = publicLead(right)?.price;
    const priced = leftPrice != null && rightPrice != null && leftPrice !== rightPrice;
    const cheaper = priced && leftPrice <= rightPrice ? left : right;
    const dearer = cheaper.slug === left.slug ? right : left;
    return {
      kind: "compare",
      title,
      body: priced
        ? `هر دو به موقعیت می‌خورند. ${cheaper.nameFa} قیمت تأییدشده پایین‌تری از ${dearer.nameFa} دارد.`
        : "از روی موقعیت و فصل، این دو به هم نزدیک‌اند.",
      ...link,
    };
  }

  const pick = leftScore > rightScore ? left : right;
  const other = pick.slug === left.slug ? right : left;
  return {
    kind: "compare",
    title,
    body: `${pick.nameFa} به چیزی که گفتی نزدیک‌تر است. ${fitWhy(pick, other, profile)}`,
    ...link,
  };
}

function fitScore(perfume: Perfume, profile: Profile) {
  let score = 0;
  if (profile.season === "all" || perfume.seasons.includes("all") || perfume.seasons.includes(profile.season)) score += 2;
  score += profile.occasions.filter((occasion) => perfume.occasions.includes(occasion)).length * 2;
  if (profile.leaning && profile.leaning !== "any") score += leaningShare(perfume, profile.leaning) * 4;
  const price = publicLead(perfume)?.price;
  if (profile.budget != null && price != null && price <= profile.budget * 1_000_000) score += 1;
  return score;
}

function fitWhy(pick: Perfume, other: Perfume, profile: Profile) {
  if (
    profile.season !== "all" &&
    pick.seasons.includes(profile.season) &&
    !other.seasons.includes(profile.season) &&
    !other.seasons.includes("all")
  ) {
    return "فصلش با چیزی که گفتی یکی است.";
  }
  const pickOccasions = profile.occasions.filter((occasion) => pick.occasions.includes(occasion)).length;
  const otherOccasions = profile.occasions.filter((occasion) => other.occasions.includes(occasion)).length;
  if (pickOccasions > otherOccasions) return "به همان موقعیت نزدیک‌تر است.";
  if (
    profile.leaning &&
    profile.leaning !== "any" &&
    leaningShare(pick, profile.leaning) > leaningShare(other, profile.leaning)
  ) {
    return "به سلیقه‌ای که انتخاب کردی نزدیک‌تر است.";
  }
  if ((pick.longevity ?? 0) > (other.longevity ?? 0)) return "ماندگاری بیشتری در داده دارد.";
  const pickPrice = publicLead(pick)?.price;
  const otherPrice = publicLead(other)?.price;
  if (pickPrice != null && otherPrice != null && pickPrice < otherPrice) return "قیمت تأییدشده‌اش پایین‌تر است.";
  return "جزئیات را در مقایسه ببین.";
}

function similarReply(perfume: Perfume): Reply {
  const similars = perfume.similar.map((slug) => getPerfume(slug)).filter((item) => isPublicPerfume(item));
  if (similars.length === 0) return { kind: "miss", body: "برای این عطر مشابهی در نمونه نیست." };
  const body = similars
    .map((item) => {
      const shared = sharedAccordNames(perfume, item);
      return shared.length > 0 ? `${item.nameFa}، هر دو ${joinFa(shared)} دارند` : item.nameFa;
    })
    .join("؛ ");
  return {
    kind: "learn",
    title: `شبیه ${perfume.nameFa}`,
    body,
    href: `/perfume/${similars[0].slug}`,
    hrefLabel: `دیدن ${similars[0].nameFa}`,
  };
}

function summerReply(perfume: Perfume): Reply {
  const summer = perfume.seasons.includes("summer") || perfume.seasons.includes("all");
  const season = perfume.seasons
    .map((id) => (id === "summer" ? "تابستان" : id === "winter" ? "زمستان" : id === "mild" ? "هوای معتدل" : "همهٔ فصل‌ها"))
    .join(" و ");
  return {
    kind: "learn",
    title: perfume.nameFa,
    body: summer
      ? `${perfume.nameFa} برای تابستان هم در داده آمده.`
      : `${perfume.nameFa} برای ${season} آمده. برای تابستان در این داده نیست.`,
  };
}

function mentionsNight(text: string) {
  return /مهمانی|(?<![\u0600-\u06FF])شب(?![\u0600-\u06FF])/u.test(text);
}

function hasScene(text: string) {
  return (
    /زمست|تابست|گرما|سرد|معتدل|بهار|پاییز|کار|اداری|دفتر|قرار|ورزش|روزمره|هر روز|هدیه|ماندگار|تازه|خنک|تا\s*\d|زیر\s*\d|میلیون|شیرین|وانیل|تلخ|چوبی|دودی|مرکبات|لیمو|ترنج|آبی|دریا/.test(
      text,
    ) || mentionsNight(text)
  );
}

function normalize(input: string) {
  return normalizeAsk(input);
}
