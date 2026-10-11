import {
  isSweet,
  leadOffer,
  leaningShare,
  occasionLabel,
  perfumes,
  referenceLabel,
  seasonShort,
} from "@/lib/catalog";
import { countWord } from "@/lib/format";
import type { Perfume, Profile, Taste } from "@/lib/types";

const FLOOR = 2;

export function matchPerfumes(profile: Profile, taste: Record<string, Taste | undefined>) {
  const relevant = relevanceGate(profile);
  const scored = perfumes
    .filter(relevant)
    .map((perfume) => ({ perfume, score: scorePerfume(perfume, profile) }))
    .filter((item) => item.score >= FLOOR)
    .filter((item) => item.perfume.confidence >= 0.62)
    .filter((item) => taste[item.perfume.slug] !== "dislike")
    .sort(
      (a, b) =>
        b.score - a.score ||
        b.perfume.confidence - a.perfume.confidence ||
        shownPrice(a.perfume) - shownPrice(b.perfume),
    );

  return scored.slice(0, 5).map((item) => item.perfume);
}

function relevanceGate(profile: Profile) {
  if (profile.occasions.length > 0) return () => true;

  const reference = profile.reference && profile.reference !== "none" ? profile.reference : null;
  if (reference) {
    const direct = perfumes.filter((perfume) => perfume.inspiredBy === reference);
    const family = new Set(direct.flatMap((perfume) => [perfume.slug, ...perfume.similar]));
    return (perfume: Perfume) => family.has(perfume.slug);
  }

  const leaning = profile.leaning && profile.leaning !== "any" ? profile.leaning : null;
  if (leaning) return (perfume: Perfume) => leaningShare(perfume, leaning) > 0;

  return () => true;
}

function scorePerfume(perfume: Perfume, profile: Profile) {
  if (profile.shift === "fresh" && !perfume.tags.includes("fresh")) return 0;
  if (profile.shift === "lasting" && (perfume.longevity ?? 0) < 4) return 0;
  if (shownPrice(perfume) > profile.budget * 1_000_000) return 0;

  let score = 0;
  const seasonHit = perfume.seasons.includes(profile.season);
  const allYear = perfume.seasons.includes("all");

  if (profile.season === "all" || allYear) score += 1;
  else if (seasonHit) score += 2;
  else if (profile.shift === "different") score += 0;
  else score -= 1;

  const overlap = profile.occasions.filter((occasion) => perfume.occasions.includes(occasion)).length;
  score += profile.occasions.length === 0 ? 2 : overlap * 2;

  if (profile.reference && profile.reference !== "none" && perfume.inspiredBy === profile.reference) {
    score += 3;
  }

  if (profile.shift === "different") {
    score += isSweet(perfume) ? -3 : 2;
  }

  if (profile.shift === "lasting") score += (perfume.longevity ?? 0) * 4;

  if (profile.leaning && profile.leaning !== "any") {
    const share = leaningShare(perfume, profile.leaning);
    score += share > 0 ? Math.round(share * 6) : -1;
  }

  return score;
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
  return leadOffer(perfume).price;
}

export function withinBudget(perfume: Perfume, budget: number) {
  return shownPrice(perfume) <= budget * 1_000_000;
}
