import {
  getPerfume,
  isSweet,
  leaningShare,
  publishedPerfumes,
  isPublicPerfume,
  occasionLabel,
  listedPrice,
  referenceLabel,
  seasonShort,
} from "@/lib/catalog";
import { computeDna, type DnaProfile } from "@/lib/dna";
import { inspirationIds } from "@/lib/inspiration";
import { countWord } from "@/lib/format";
import { remindsOfFor } from "@/lib/reminds-of";
import type { Perfume, Profile, UserPerfume } from "@/lib/types";

function perfumeReminds(perfume: Perfume) {
  return perfume.remindsOf?.length ? perfume.remindsOf : remindsOfFor(perfume.slug);
}

const FLOOR = 2;

export function matchPerfumes(profile: Profile, library: Record<string, UserPerfume | undefined>) {
  const dna = computeDna(library, getPerfume);
  const relevant = relevanceGate(profile);
  const scored = publishedPerfumes()
    .filter(relevant)
    .map((perfume) => ({ perfume, score: scorePerfume(perfume, profile, dna) }))
    .filter((item) => item.score >= FLOOR)
    .filter((item) => item.perfume.confidence >= 0.62)
    .filter((item) => !alreadyKnown(library[item.perfume.slug]))
    .sort(
      (a, b) =>
        b.score - a.score ||
        b.perfume.confidence - a.perfume.confidence ||
        (shownPrice(a.perfume) ?? Number.POSITIVE_INFINITY) -
          (shownPrice(b.perfume) ?? Number.POSITIVE_INFINITY),
    );

  return scored.slice(0, 5).map((item) => item.perfume);
}

export function suggestForTaste(library: Record<string, UserPerfume | undefined>, limit = 3) {
  return suggestFromDna(library, limit);
}

export function suggestForBrand(brandName: string, library: Record<string, UserPerfume | undefined>, limit = 3) {
  return suggestFromDna(library, limit, brandName);
}

function suggestFromDna(library: Record<string, UserPerfume | undefined>, limit: number, brandName?: string) {
  const dna = computeDna(library, getPerfume);
  if (dna.stage !== "early" && dna.stage !== "dna") return [];
  if (dna.top.length === 0) return [];

  return publishedPerfumes()
    .filter(
      (perfume) =>
        (brandName == null || perfume.brand === brandName) &&
        perfume.confidence >= 0.62 &&
        !blocked(library[perfume.slug], true),
    )
    .map((perfume) => ({
      perfume,
      score: dna.all.reduce((sum, family) => sum + leaningShare(perfume, family.id) * family.affinity, 0),
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || b.perfume.confidence - a.perfume.confidence)
    .slice(0, limit)
    .map((item) => item.perfume);
}

export function wantedNeighbors(library: Record<string, UserPerfume | undefined>, limit = 3) {
  const wanted = Object.entries(library).filter((entry): entry is [string, UserPerfume] => {
    const state = entry[1];
    return Boolean(state?.wanted && !state.owned && !state.disliked && !state.tried && state.rating == null);
  });
  const seen = new Set<string>();
  const picks: Perfume[] = [];

  for (const [slug] of wanted) {
    const perfume = getPerfume(slug);
    if (!isPublicPerfume(perfume)) continue;
    for (const similar of perfume.similar) {
      if (seen.has(similar) || similar === slug) continue;
      const state = library[similar];
      if (blocked(state, true)) continue;
      const item = getPerfume(similar);
      if (!isPublicPerfume(item)) continue;
      seen.add(similar);
      picks.push(item);
      if (picks.length >= limit) return picks;
    }
  }
  return picks;
}

function relevanceGate(profile: Profile) {
  if (profile.occasions.length > 0) return () => true;

  const reference = profile.reference && profile.reference !== "none" ? profile.reference : null;
  if (reference) {
    const direct = publishedPerfumes().filter((perfume) => {
      if (inspirationIds(perfume.inspiredBy).includes(reference)) return true;
      return perfumeReminds(perfume).some((link) => link.id === reference);
    });
    const family = new Set(direct.flatMap((perfume) => [perfume.slug, ...perfume.similar]));
    return (perfume: Perfume) => family.has(perfume.slug);
  }

  const leaning = profile.leaning && profile.leaning !== "any" ? profile.leaning : null;
  if (leaning) return (perfume: Perfume) => leaningShare(perfume, leaning) > 0;

  return () => true;
}

function scorePerfume(perfume: Perfume, profile: Profile, dna: DnaProfile) {
  if (profile.shift === "fresh" && !perfume.tags.includes("fresh")) return 0;
  if (profile.shift === "lasting" && (perfume.longevity ?? 0) < 4) return 0;
  const price = shownPrice(perfume);
  if (profile.budget != null && price != null && price > profile.budget * 1_000_000) return 0;

  let score = 0;
  const seasonHit = perfume.seasons.includes(profile.season);
  const allYear = perfume.seasons.includes("all");

  if (profile.season === "all" || allYear) score += 1;
  else if (seasonHit) score += 2;
  else if (profile.shift === "different") score += 0;
  else score -= 1;

  const overlap = profile.occasions.filter((occasion) => perfume.occasions.includes(occasion)).length;
  score += profile.occasions.length === 0 ? 2 : overlap * 2;

  if (profile.reference && profile.reference !== "none") {
    const hit =
      inspirationIds(perfume.inspiredBy).includes(profile.reference) ||
      perfumeReminds(perfume).some((link) => link.id === profile.reference);
    if (hit) score += 3;
  }

  if (profile.shift === "different") {
    score += isSweet(perfume) ? -3 : 2;
  }

  if (profile.shift === "lasting") score += (perfume.longevity ?? 0) * 4;

  if (profile.leaning && profile.leaning !== "any") {
    const share = leaningShare(perfume, profile.leaning);
    score += share > 0 ? Math.round(share * 6) : -1;
  }

  if (dna.stage === "early" || dna.stage === "dna") {
    for (const family of dna.all) {
      score += Math.round(leaningShare(perfume, family.id) * family.affinity * 4);
    }
  }

  return score;
}

function alreadyKnown(state: UserPerfume | undefined) {
  if (!state) return false;
  return state.disliked || state.owned || state.tried;
}

function blocked(state: UserPerfume | undefined, includeWanted: boolean) {
  if (!state) return false;
  if (state.disliked || state.owned || state.tried) return true;
  return includeWanted && state.wanted;
}

export function resultHeading(profile: Profile, count: number) {
  const occasions = profile.occasions.map(occasionLabel).filter(Boolean).join(" و ");
  const season = profile.season === "all" ? "" : ` در ${seasonShort(profile.season)}`;
  const ref = referenceLabel(profile.reference);
  const prefix = ref && profile.reference !== "none" ? `نزدیک به ${ref}، ` : "";
  const place = occasions ? ` برای ${occasions}` : "";
  return `${prefix}${countWord(count)} عطر${place}${season}`;
}

function shownPrice(perfume: Perfume) {
  return listedPrice(perfume);
}

export function withinBudget(perfume: Perfume, budget: number) {
  const price = shownPrice(perfume);
  if (price == null) return true;
  return price <= budget * 1_000_000;
}
