import { brandMeta } from "@/lib/brand-registry";
import { inspirationValue, inspirationIds } from "@/lib/inspiration";
import { remindsOfFor } from "@/lib/reminds-of";
import type { Accord, BottleShape, Note, Perfume, RemindsOfLink, Season, ShopOffer } from "@/lib/types";

/** رکورد قفل seed (v16+) قبل از هم‌ترازی با تایپ صفحه. */
export type LockedPerfumeRow = {
  slug: string;
  nameFa: string;
  nameEn: string;
  brand: string;
  aliases?: string[] | null;
  perfumer?: string | null;
  family?: string | null;
  sourceUrl?: string | null;
  marketGender: "مشترک" | "مردانه" | "زنانه";
  concentration?: string | null;
  volumeMl?: number | null;
  priceMin?: number | null;
  priceMax?: number | null;
  accords: Accord[];
  notes: Note[];
  seasons: Array<Season | "all">;
  occasions?: string[] | null;
  tags?: string[] | null;
  longevity?: number | null;
  sillage?: number | null;
  inspiredBy?: string | string[] | null;
  remindsOf?: RemindsOfLink[] | null;
  why: string;
  similar?: string[] | null;
  confidence: number;
  shops?: ShopOffer[] | null;
  /** آدرس استوریج شیشه؛ معمولاً ‎https://…/perfumes/800/{slug}.webp */
  image?: string | null;
};

const SEASONS = new Set(["summer", "winter", "mild", "all"]);

function bottleFor(slug: string): BottleShape {
  const n = [...slug].reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  return (["rect", "slim", "round"] as const)[n % 3];
}

function capFor(accords: Accord[]) {
  const color = accords[0]?.color?.trim();
  if (color && /^#[0-9A-Fa-f]{6}$/.test(color)) return color;
  return "#6E5436";
}

/** تبدیل رکورد قفل به شکل قابل‌نمایش در صفحات داخلی؛ فروشگاه همیشه خالی. */
export function perfumeFromLocked(row: LockedPerfumeRow): Perfume {
  if (!brandMeta(row.brand)) {
    throw new Error(`برند ناشناخته در رجیستری: ${row.brand} (${row.slug})`);
  }
  const seasons = (row.seasons ?? []).filter((id): id is Season | "all" => SEASONS.has(id));
  if (seasons.length === 0) {
    throw new Error(`فصل نامعتبر: ${row.slug}`);
  }
  if (!Array.isArray(row.accords) || row.accords.length === 0) {
    throw new Error(`آکورد خالی: ${row.slug}`);
  }
  if (!Array.isArray(row.notes) || row.notes.length === 0) {
    throw new Error(`نت خالی: ${row.slug}`);
  }

  const concentration =
    typeof row.concentration === "string" && row.concentration.trim() ? row.concentration.trim() : null;
  const volumeMl =
    typeof row.volumeMl === "number" && Number.isFinite(row.volumeMl) && row.volumeMl > 0
      ? Math.round(row.volumeMl)
      : null;

  const image =
    typeof row.image === "string" && /^https:\/\//.test(row.image.trim()) ? row.image.trim() : undefined;

  return {
    slug: row.slug,
    nameFa: row.nameFa,
    nameEn: row.nameEn,
    brand: row.brand,
    perfumer: row.perfumer ?? null,
    marketGender: row.marketGender,
    concentration,
    volumeMl,
    bottle: bottleFor(row.slug),
    cap: capFor(row.accords),
    ...(image ? { image } : {}),
    accords: row.accords,
    notes: row.notes,
    seasons,
    occasions: Array.isArray(row.occasions) ? row.occasions.filter((id) => typeof id === "string" && id) : [],
    tags: Array.isArray(row.tags) ? row.tags.filter((id) => typeof id === "string" && id) : [],
    longevity: row.longevity ?? null,
    sillage: row.sillage ?? null,
    inspiredBy: inspirationValue(inspirationIds(row.inspiredBy)),
    remindsOf: (() => {
      const fromRow = Array.isArray(row.remindsOf) ? row.remindsOf.filter((link) => link?.id) : [];
      return fromRow.length > 0 ? fromRow : remindsOfFor(row.slug);
    })(),
    why: row.why,
    similar: Array.isArray(row.similar) ? row.similar.filter((id) => typeof id === "string" && id) : [],
    shops: [],
    confidence: row.confidence,
    aliases: Array.isArray(row.aliases) ? row.aliases.filter((id) => typeof id === "string" && id) : [],
    family: row.family ?? null,
    priceMin: typeof row.priceMin === "number" ? row.priceMin : null,
    priceMax: typeof row.priceMax === "number" ? row.priceMax : null,
    sourceUrl: row.sourceUrl ?? null,
  };
}
