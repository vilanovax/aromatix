import { OCCASIONS, SEASONS, brandByName } from "@/lib/catalog";
import type { BottleShape, Perfume, Season, ShopOffer } from "@/lib/types";

const GENDERS = ["مشترک", "مردانه", "زنانه"] as const;
const BOTTLES = ["rect", "slim", "round"] as const;
const LAYERS = ["top", "middle", "base"] as const;
const SEASON_IDS = new Set<string>(SEASONS.map((item) => item.id));
const OCCASION_IDS = new Set<string>(OCCASIONS.map((item) => item.id));

export type PerfumeInput = {
  slug?: unknown;
  nameFa?: unknown;
  nameEn?: unknown;
  brand?: unknown;
  perfumer?: unknown;
  marketGender?: unknown;
  concentration?: unknown;
  volumeMl?: unknown;
  bottle?: unknown;
  cap?: unknown;
  image?: unknown;
  accords?: unknown;
  notes?: unknown;
  seasons?: unknown;
  occasions?: unknown;
  tags?: unknown;
  longevity?: unknown;
  sillage?: unknown;
  inspiredBy?: unknown;
  why?: unknown;
  similar?: unknown;
  shops?: unknown;
  confidence?: unknown;
  aliases?: unknown;
};

function text(value: unknown, max: number) {
  if (typeof value !== "string") return null;
  const next = value.trim().replace(/\s+/g, " ");
  if (!next || next.length > max) return null;
  return next;
}

function optionalText(value: unknown, max: number) {
  if (value == null) return null;
  if (typeof value !== "string") return null;
  const next = value.trim().replace(/\s+/g, " ");
  if (!next) return null;
  if (next.length > max) return null;
  return next;
}

function numberIn(value: unknown, min: number, max: number) {
  const parsed = typeof value === "number" ? value : typeof value === "string" ? Number(value) : NaN;
  if (!Number.isFinite(parsed) || parsed < min || parsed > max) return null;
  return parsed;
}

function optionalScore(value: unknown) {
  if (value == null || value === "") return null;
  const score = numberIn(value, 1, 5);
  if (score == null) return null;
  return Math.round(score);
}

function stringList(value: unknown, allowed?: Set<string>) {
  if (!Array.isArray(value)) return null;
  const items: string[] = [];
  for (const item of value) {
    if (typeof item !== "string") return null;
    const next = item.trim();
    if (!next || next.length > 80) return null;
    if (allowed && !allowed.has(next)) return null;
    if (!items.includes(next)) items.push(next);
  }
  return items;
}

export function parsePerfumeInput(
  input: PerfumeInput,
  options: { slugLocked?: string; knownSlugs: string[] },
): { error: string } | { value: Perfume } {
  const slug = options.slugLocked ?? text(input.slug, 80)?.toLowerCase() ?? null;
  if (!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return { error: "اسلاگ فقط حرف کوچک انگلیسی، عدد و خط تیره باشد." };
  }
  if (!options.slugLocked && options.knownSlugs.includes(slug)) {
    return { error: "این اسلاگ قبلاً استفاده شده." };
  }

  const nameFa = text(input.nameFa, 80);
  if (!nameFa) return { error: "نام فارسی را بنویس." };
  const nameEn = text(input.nameEn, 80);
  if (!nameEn) return { error: "نام انگلیسی را بنویس." };

  const brandName = text(input.brand, 80);
  const brand = brandName ? brandByName(brandName) : undefined;
  if (!brand) return { error: "برند را از فهرست انتخاب کن." };

  const marketGender = GENDERS.find((item) => item === input.marketGender);
  if (!marketGender) return { error: "جنسیت بازار را انتخاب کن." };

  const concentration = text(input.concentration, 40);
  if (!concentration) return { error: "غلظت را بنویس." };
  const volumeMl = numberIn(input.volumeMl, 1, 500);
  if (volumeMl == null) return { error: "حجم را بین ۱ تا ۵۰۰ میلی‌لیتر بنویس." };

  const bottle = BOTTLES.find((item) => item === input.bottle);
  if (!bottle) return { error: "شکل شیشه را انتخاب کن." };
  const cap = typeof input.cap === "string" ? input.cap.trim() : "";
  if (!/^#[0-9A-Fa-f]{6}$/.test(cap)) return { error: "رنگ درپوش باید کد شش‌رقمی باشد." };

  const image = optionalText(input.image, 200);
  if (image && !image.startsWith("/") && !/^https:\/\//.test(image)) {
    return { error: "عکس باید مسیر داخل سایت یا نشانی https باشد." };
  }

  if (!Array.isArray(input.accords) || input.accords.length === 0) return { error: "حداقل یک آکورد لازم است." };
  const accords = [];
  for (const item of input.accords) {
    if (!item || typeof item !== "object") return { error: "آکورد ناقص است." };
    const row = item as { name?: unknown; color?: unknown; strength?: unknown };
    const name = text(row.name, 40);
    const color = typeof row.color === "string" ? row.color.trim() : "";
    const strength = numberIn(row.strength, 0.01, 1);
    if (!name || !/^#[0-9A-Fa-f]{6}$/.test(color) || strength == null) {
      return { error: "هر آکورد نام، رنگ و شدت بین ۰٫۰۱ تا ۱ می‌خواهد." };
    }
    accords.push({ name, color, strength: Math.round(strength * 100) / 100 });
  }

  if (!Array.isArray(input.notes) || input.notes.length === 0) return { error: "حداقل یک نت لازم است." };
  const notes = [];
  for (const item of input.notes) {
    if (!item || typeof item !== "object") return { error: "نت ناقص است." };
    const row = item as { layer?: unknown; name?: unknown };
    const layer = LAYERS.find((entry) => entry === row.layer);
    const name = text(row.name, 40);
    if (!layer || !name) return { error: "هر نت لایه و نام می‌خواهد." };
    notes.push({ layer, name });
  }

  const seasons = stringList(input.seasons, SEASON_IDS);
  if (!seasons || seasons.length === 0) return { error: "حداقل یک فصل انتخاب کن." };
  const occasions = stringList(input.occasions, OCCASION_IDS);
  if (!occasions || occasions.length === 0) return { error: "حداقل یک موقعیت انتخاب کن." };
  const tags = stringList(input.tags);
  if (!tags) return { error: "برچسب‌ها درست نیستند." };

  const why = text(input.why, 500);
  if (!why) return { error: "جملهٔ «چرا» را بنویس." };

  const similar = stringList(input.similar);
  if (!similar) return { error: "عطرهای مشابه درست نیستند." };
  if (similar.includes(slug) || similar.some((item) => !options.knownSlugs.includes(item) && item !== slug)) {
    return { error: "مشابه‌ها باید از عطرهای موجود باشند و خودِ این عطر را شامل نشوند." };
  }

  const aliases = stringList(input.aliases);
  if (!aliases) return { error: "نام‌های مستعار درست نیستند." };

  if (!Array.isArray(input.shops) || input.shops.length === 0) return { error: "حداقل یک فروشگاه لازم است." };
  const shops: ShopOffer[] = [];
  for (const item of input.shops) {
    if (!item || typeof item !== "object") return { error: "فروشگاه ناقص است." };
    const row = item as { shop?: unknown; price?: unknown; href?: unknown; stockConfirmed?: unknown; checkedOn?: unknown; checkedAt?: unknown };
    const shop = text(row.shop, 40);
    const price = numberIn(row.price, 1, 500_000_000);
    const href = text(row.href, 300);
    if (!shop || price == null || !href || !/^https:\/\//.test(href)) {
      return { error: "هر فروشگاه نام، قیمت به تومان و لینک https می‌خواهد." };
    }
    const checkedOn = typeof row.checkedOn === "string" ? row.checkedOn : "";
    const checkedAt = typeof row.checkedAt === "string" && row.checkedAt ? row.checkedAt : undefined;
    shops.push({
      shop,
      price: Math.round(price),
      href,
      stockConfirmed: row.stockConfirmed === true,
      checkedOn,
      checkedAt,
    });
  }

  const confidence = numberIn(input.confidence, 0, 1);
  if (confidence == null) return { error: "اطمینان را بین ۰ و ۱ بنویس." };

  const inspired = optionalText(input.inspiredBy, 40);
  const perfume: Perfume = {
    slug,
    nameFa,
    nameEn,
    brand: brand.nameFa,
    marketGender,
    concentration,
    volumeMl: Math.round(volumeMl),
    bottle: bottle as BottleShape,
    cap,
    accords,
    notes,
    seasons: seasons as Season[],
    occasions,
    tags,
    longevity: optionalScore(input.longevity),
    sillage: optionalScore(input.sillage),
    why,
    similar,
    shops,
    confidence: Math.round(confidence * 100) / 100,
    aliases,
  };
  if (image) perfume.image = image;
  const perfumer = optionalText(input.perfumer, 80);
  if (perfumer) perfume.perfumer = perfumer;
  if (inspired) perfume.inspiredBy = inspired;
  return { value: perfume };
}
