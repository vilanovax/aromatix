import { referenceLabel, sweetness } from "@/lib/catalog";
import { faNum } from "@/lib/format";
import type { Perfume, Profile, Season } from "@/lib/types";

export type Reply =
  | { kind: "learn"; title: string; body: string; href?: string; hrefLabel?: string }
  | { kind: "compare"; title: string; body: string; a: string; b: string }
  | { kind: "refine"; body: string }
  | { kind: "miss"; body: string };

const STEPS = [12, 8, 5, 2];

export function respond(raw: string, profile: Profile | null, results: Perfume[]) {
  const text = normalize(raw).trim();
  if (!text) {
    return { profile, reply: { kind: "miss", body: "یک سؤال یا یک اصلاح بنویس." } as Reply };
  }

  if (/وتیور|vetiver/.test(text)) {
    return {
      profile,
      reply: {
        kind: "learn",
        title: "وتیور",
        body: "بوی خاک تمیز، ریشهٔ خشک و کمی دودی است. معمولاً در پایه می‌آید و بو را روی پوست نگه می‌دارد.",
        href: "/notes/vetiver",
        hrefLabel: "ادامهٔ وتیور",
      } as Reply,
    };
  }

  if (/غلظت|ادوپرفیوم|ادوتویلت|\bedp\b|\bedt\b/.test(text)) {
    return {
      profile,
      reply: {
        kind: "learn",
        title: "غلظت",
        body: "ادوپرفیوم معمولاً غلیظ‌تر از ادوتویلت است و با همان تعداد پاشیدن دیرتر محو می‌شود. این قاعده برای همهٔ عطرها قطعی نیست. ماندگاری را فقط وقتی در داده باشد نشان می‌دهیم.",
      } as Reply,
    };
  }

  if (/سوم|چهارم/.test(text)) {
    return { profile, reply: compareReply(results) };
  }

  if (/خنک/.test(text)) {
    if (!profile) return needList();
    const next: Profile = { ...profile, shift: "fresh", season: "summer", note: "خنک‌تر چیده شد." };
    return { profile: next, reply: { kind: "refine", body: "فهرست را با عطرهای خنک‌تر چیدم." } as Reply };
  }

  if (/ارزان/.test(text)) {
    if (!profile) return needList();
    const cheaper = STEPS.find((step) => step < profile.budget);
    if (!cheaper) {
      return { profile, reply: { kind: "miss", body: "کف بودجه همین تا ۲ میلیون است." } as Reply };
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

  const referenced = /ساواج/.test(text) ? "sauvage" : /اونتوس/.test(text) ? "aventus" : /آنجل/.test(text) ? "angels" : null;
  if (referenced && profile && !hasScene(text)) {
    const label = referenceLabel(referenced);
    const next: Profile = { ...profile, reference: referenced, note: label ? `نزدیک به ${label} چیده شد.` : null };
    return { profile: next, reply: { kind: "refine", body: next.note ?? "پیشنهادها را دوباره چیدم." } as Reply };
  }

  const parsed = parseLine(text);
  if (parsed) {
    return { profile: parsed, reply: { kind: "refine", body: "پیشنهادها را با این توصیف از نو چیدم." } as Reply };
  }

  return {
    profile,
    reply: {
      kind: "miss",
      body: "این را در دانشنامهٔ آروما نداریم. می‌توانی بگویی خنک‌تر، ارزان‌تر، یا نام یک عطر آشنا.",
    } as Reply,
  };
}

export function parseLine(input: string): Profile | null {
  const text = normalize(input);
  if (!hasScene(text) && !/ساواج|اونتوس|آنجل/.test(text)) return null;

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

  let budget = 8;
  const amount = text.match(/(?:تا|زیر|کمتر از)\s*(\d+)/);
  if (amount) {
    const value = Number(amount[1]);
    if (!Number.isFinite(value) || value <= 0) return null;
    budget = value;
  }

  let reference: string | null = null;
  if (/ساواج/.test(text)) reference = "sauvage";
  else if (/اونتوس/.test(text)) reference = "aventus";
  else if (/آنجل/.test(text)) reference = "angels";

  return {
    occasions: occasions.slice(0, 2),
    season,
    budget,
    reference,
    shift: "none",
    note: null,
  };
}

function compareReply(results: Perfume[]): Reply {
  const third = results[2];
  const fourth = results[3];
  if (!third) {
    return { kind: "miss", body: "اول یک فهرست پیشنهاد بگیر تا بتوانم به همان عطرها اشاره کنم." };
  }
  if (!fourth) {
    const second = results[1];
    return {
      kind: "compare",
      title: third.nameFa,
      body: `در این فهرست چهارمی نیست. سومی ${third.nameFa} است${second ? ` و دومی ${second.nameFa}` : ""}.`,
      a: second?.slug ?? third.slug,
      b: third.slug,
    };
  }

  const thirdSweet = sweetness(third);
  const fourthSweet = sweetness(fourth);
  const sweeter = thirdSweet === fourthSweet ? null : thirdSweet > fourthSweet ? third : fourth;
  const body = sweeter
    ? `سومی ${third.nameFa} است و چهارمی ${fourth.nameFa}. ${sweeter.nameFa} شیرین‌تر حس می‌شود، چون نوت‌های شیرینش پررنگ‌ترند.`
    : `سومی ${third.nameFa} است و چهارمی ${fourth.nameFa}. از روی نوت‌های ثبت‌شده، شیرینی‌شان نزدیک است.`;

  return { kind: "compare", title: `${third.nameFa} و ${fourth.nameFa}`, body, a: third.slug, b: fourth.slug };
}

function needList() {
  return {
    profile: null,
    reply: { kind: "miss", body: "اول یک فهرست پیشنهاد بگیر تا بتوانم همان را اصلاح کنم." } as Reply,
  };
}

function mentionsNight(text: string) {
  return /مهمانی|(?<![\u0600-\u06FF])شب(?![\u0600-\u06FF])/u.test(text);
}

function hasScene(text: string) {
  return (
    /زمست|تابست|گرما|سرد|معتدل|کار|اداری|دفتر|قرار|ورزش|روزمره|هر روز|تا\s*\d|زیر\s*\d|میلیون/.test(text) ||
    mentionsNight(text)
  );
}

function normalize(input: string) {
  return input
    .replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)))
    .replace(/ي/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/\s+/g, " ")
    .toLowerCase();
}
