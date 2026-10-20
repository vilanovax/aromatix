import data from "@/lib/reminds-of.json";
import type { RemindsOfLink } from "@/lib/types";

type ThinRow = {
  id: string;
  nameFa: string;
  nameEn: string;
  thin: boolean;
};

type LinkRow = {
  id: string;
  relation: string;
  source: string;
  nameFa: string;
  nameEn: string | null;
};

const bySlug = (data as { bySlug: Record<string, LinkRow[]> }).bySlug ?? {};
const thinRows = ((data as { references: ThinRow[] }).references ?? []).filter((row) => row.thin);

export const THIN_REFERENCE_LINE = "عطر مرجعی که بعضی عطرهای کاتالوگ یادش می‌اندازند.";

export function remindsOfFor(slug: string): RemindsOfLink[] {
  const rows = bySlug[slug];
  if (!rows?.length) return [];
  return rows.map((row) => ({
    id: row.id,
    relation: row.relation === "inspired" ? "inspired" : "similar",
    ...(row.source ? { source: row.source } : {}),
  }));
}

export function remindsOfMap(): Record<string, RemindsOfLink[]> {
  return Object.fromEntries(Object.keys(bySlug).map((slug) => [slug, remindsOfFor(slug)]));
}

/** ردیف‌های نازک؛ در `references.ts` به پروفایل کامل تبدیل می‌شوند. */
export function thinReferenceRows(): ThinRow[] {
  return thinRows;
}

export function attachRemindsOf<T extends { slug: string; remindsOf?: RemindsOfLink[] | null }>(perfume: T): T {
  const fromDoc = Array.isArray(perfume.remindsOf) ? perfume.remindsOf : [];
  if (fromDoc.length > 0) return perfume;
  const fromMap = remindsOfFor(perfume.slug);
  if (fromMap.length === 0) return perfume;
  return { ...perfume, remindsOf: fromMap };
}
