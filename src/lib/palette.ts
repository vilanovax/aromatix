import { publishedPerfumes } from "@/lib/catalog";
import { countWord, joinFa } from "@/lib/format";
import type { Perfume } from "@/lib/types";

export type PaletteHit = {
  perfume: Perfume;
  found: string[];
  base: string[];
  reason: string;
};

const MAX_NOTES = 3;

/** پرتکرارترین نت‌های کاتالوگ برای چیپ‌های پالت. */
export function topNoteNames(limit = 12) {
  const counts = new Map<string, number>();
  for (const perfume of publishedPerfumes()) {
    for (const note of perfume.notes) {
      counts.set(note.name, (counts.get(note.name) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "fa"))
    .slice(0, limit)
    .map(([name]) => name);
}

/** عطرهایی که نت‌های انتخاب‌شده را دارند. پایه کمی جلوتر می‌آید. */
export function paletteMatches(names: string[], limit = 6): PaletteHit[] {
  const wanted = [...new Set(names.map((name) => name.trim()).filter(Boolean))].slice(0, MAX_NOTES);
  if (wanted.length === 0) return [];

  return publishedPerfumes()
    .flatMap((perfume) => {
      const found = wanted.filter((name) => perfume.notes.some((note) => note.name === name));
      if (found.length === 0) return [];
      const base = found.filter((name) =>
        perfume.notes.some((note) => note.name === name && note.layer === "base"),
      );
      return [{ perfume, found, base, score: found.length * 2 + base.length }];
    })
    .sort(
      (a, b) =>
        b.score - a.score ||
        b.found.length - a.found.length ||
        a.perfume.nameFa.localeCompare(b.perfume.nameFa, "fa"),
    )
    .slice(0, limit)
    .map(({ perfume, found, base }) => ({
      perfume,
      found,
      base,
      reason: paletteReason(found, base, wanted.length),
    }));
}

export function paletteReason(found: string[], base: string[], asked: number) {
  const allBase = base.length > 0 && base.length === found.length;
  if (asked === 1) {
    return allBase ? `${found[0]} در پایهٔ این عطر است.` : "این نت را دارد.";
  }
  if (found.length === asked && allBase) {
    return `هر ${countWord(asked)} نت را در پایه دارد: ${joinFa(found)}.`;
  }
  if (found.length === asked) {
    return base.length > 0
      ? `هر ${countWord(asked)} نت را دارد. ${joinFa(base)} در پایه است.`
      : `هر ${countWord(asked)} نت را دارد.`;
  }
  if (allBase) {
    return `${countWord(found.length)} نت از ${countWord(asked)}، در پایه: ${joinFa(found)}.`;
  }
  if (base.length > 0) {
    return `${countWord(found.length)} نت از ${countWord(asked)}: ${joinFa(found)}. ${joinFa(base)} در پایه است.`;
  }
  return `${countWord(found.length)} نت از ${countWord(asked)}: ${joinFa(found)}.`;
}
