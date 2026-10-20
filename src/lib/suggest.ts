import { interpretQuery } from "@/lib/assistant";
import { listedPrice, matchBrand, perfumesByBrand, publishedPerfumes } from "@/lib/catalog";
import { faNum, millionToman } from "@/lib/format";
import { publishedEntries } from "@/lib/knowledge";
import { findReference, normalizeAsk, referenceList, type ReferenceProfile } from "@/lib/references";
import type { Perfume } from "@/lib/types";

export type Suggestion = {
  id: string;
  kind: "perfume" | "reference" | "learn" | "search" | "brand";
  title: string;
  support?: string;
  query: string;
  hint?: "did-you-mean";
  perfume?: Perfume;
};

export function suggestQueries(raw: string): Suggestion[] {
  const query = normalizeAsk(raw);
  if (query.length < 2) return [];

  const items: Suggestion[] = [];
  const seen = new Set<string>();

  const brand = matchBrand(raw);
  if (brand) {
    const catalog = perfumesByBrand(brand.nameFa);
    items.push({
      id: `brand-${brand.slug}`,
      kind: "brand",
      title: brand.nameFa,
      support: `${brand.nameEn} · ${faNum(catalog.length)} عطر`,
      query: brand.nameFa,
    });
    for (const perfume of catalog) {
      items.push(perfumeSuggestion(perfume));
    }
    return items;
  }

  const correction = didYouMean(query);
  if (correction) {
    items.push({
      id: `ref-${correction.id}`,
      kind: "reference",
      title: `منظورت ${correction.nameFa} بود؟`,
      support: "حال‌وهوای خانواده",
      query: correction.nameFa,
      hint: "did-you-mean",
    });
    seen.add(correction.id);
  }

  for (const perfume of perfumeHits(query)) {
    items.push(perfumeSuggestion(perfume));
  }

  const exact = findReference(query);
  if (exact && !seen.has(exact.id)) {
    items.push(referenceSuggestion(exact));
    seen.add(exact.id);
  } else if (!correction) {
    for (const reference of prefixReferences(query)) {
      if (seen.has(reference.id)) continue;
      items.push(referenceSuggestion(reference));
      seen.add(reference.id);
    }
  }

  for (const entry of learnHits(query)) {
    items.push({
      id: `learn-${entry.slug}`,
      kind: "learn",
      title: entry.ask,
      support: "واژه",
      query: entry.aliases[0] ?? entry.ask,
    });
  }

  const intent = interpretQuery(raw);
  if (intent.type === "results") {
    items.push({
      id: "search",
      kind: "search",
      title: `پیشنهاد برای: ${raw.trim()}`,
      query: raw.trim(),
    });
  }

  return items.slice(0, 6);
}

function perfumeSuggestion(perfume: Perfume): Suggestion {
  return {
    id: `perfume-${perfume.slug}`,
    kind: "perfume",
    title: perfume.nameFa,
    support: perfumeLine(perfume),
    query: perfume.nameFa,
    perfume,
  };
}

function perfumeLine(perfume: Perfume) {
  const bits = [perfume.brand];
  if (perfume.concentration) bits.push(perfume.concentration);
  if (perfume.volumeMl) bits.push(`${faNum(perfume.volumeMl)} میلی‌لیتر`);
  const price = listedPrice(perfume);
  if (price) bits.push(millionToman(price));
  return bits.join(" · ");
}

function referenceSuggestion(reference: ReferenceProfile): Suggestion {
  return {
    id: `ref-${reference.id}`,
    kind: "reference",
    title: reference.nameFa,
    support: reference.line,
    query: reference.nameFa,
  };
}

/** هر عطری که این عبارت در نام فارسی، انگلیسی یا نام دیگرش باشد. */
export function perfumesMatchingName(raw: string): Perfume[] {
  const query = normalizeAsk(raw);
  if (query.length < 2) return [];
  return publishedPerfumes()
    .filter((perfume) => nameRank(perfume, query) > 0)
    .sort((a, b) => nameRank(b, query) - nameRank(a, query) || a.nameFa.localeCompare(b.nameFa, "fa"));
}

function perfumeHits(query: string) {
  return publishedPerfumes()
    .map((perfume) => ({ perfume, rank: nameRank(perfume, query) }))
    .filter((item) => item.rank > 0)
    .sort((a, b) => b.rank - a.rank || a.perfume.nameFa.localeCompare(b.perfume.nameFa, "fa"))
    .slice(0, 3)
    .map((item) => item.perfume);
}

function nameRank(perfume: Perfume, query: string) {
  const names = [perfume.nameFa, perfume.nameEn, ...(perfume.aliases ?? [])].map((name) => normalizeAsk(name));
  let best = 0;
  for (const name of names) {
    if (!name) continue;
    if (name === query) best = Math.max(best, 3);
    else if (name.startsWith(query)) best = Math.max(best, 2);
    else if (name.includes(query)) best = Math.max(best, 1);
  }
  return best;
}

function prefixReferences(query: string) {
  return referenceList().filter((reference) =>
    reference.aliases.some((alias) => {
      const name = normalizeAsk(alias);
      return name.startsWith(query) || query.startsWith(name);
    }),
  );
}

function didYouMean(query: string) {
  if (findReference(query)) return null;
  if (prefixReferences(query).length > 0) return null;
  let best: { reference: ReferenceProfile; distance: number } | null = null;
  for (const reference of referenceList()) {
    for (const alias of reference.aliases) {
      const name = normalizeAsk(alias);
      if (Math.abs(name.length - query.length) > 2) continue;
      const distance = editDistance(query, name);
      if (distance === 0 || distance > 1) continue;
      if (!best || distance < best.distance) best = { reference, distance };
    }
  }
  return best?.reference ?? null;
}

function learnHits(query: string) {
  const hits = publishedEntries().filter((entry) => {
    const names = [entry.title, entry.ask, ...entry.aliases];
    return names.some((name) => {
      const alias = normalizeAsk(name);
      if (!alias) return false;
      return alias.startsWith(query) || (alias.length >= 3 && query.includes(alias));
    });
  });
  return hits.slice(0, 2);
}

function editDistance(left: string, right: string) {
  const rows = Array.from({ length: left.length + 1 }, (_, index) => [index]);
  for (let col = 1; col <= right.length; col += 1) rows[0][col] = col;
  for (let row = 1; row <= left.length; row += 1) {
    for (let col = 1; col <= right.length; col += 1) {
      const cost = left[row - 1] === right[col - 1] ? 0 : 1;
      rows[row][col] = Math.min(rows[row - 1][col] + 1, rows[row][col - 1] + 1, rows[row - 1][col - 1] + cost);
    }
  }
  return rows[left.length][right.length];
}
