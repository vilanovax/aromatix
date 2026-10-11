import {
  isSweet,
  occasionLabel,
  perfumes,
  referenceLabel,
  seasonShort,
} from "@/lib/catalog";
import { countWord } from "@/lib/format";
import type { Perfume, Profile, Taste } from "@/lib/types";

const FLOOR = 2;

export function matchPerfumes(profile: Profile, taste: Record<string, Taste | undefined>) {
  const scored = perfumes
    .map((perfume) => ({ perfume, score: scorePerfume(perfume, profile) }))
    .filter((item) => item.score >= FLOOR)
    .filter((item) => item.perfume.confidence >= 0.62)
    .filter((item) => taste[item.perfume.slug] !== "dislike")
    .sort(
      (a, b) =>
        b.score - a.score ||
        b.perfume.confidence - a.perfume.confidence ||
        minPrice(a.perfume) - minPrice(b.perfume),
    );

  return scored.slice(0, 8).map((item) => item.perfume);
}

function scorePerfume(perfume: Perfume, profile: Profile) {
  if (profile.shift === "fresh" && !perfume.tags.includes("fresh")) return 0;
  if (perfume.shops.every((shop) => shop.price > profile.budget * 1_000_000)) return 0;

  let score = 0;
  const seasonHit = perfume.seasons.includes(profile.season);
  const allYear = perfume.seasons.includes("all");

  if (profile.season === "all" || allYear) score += 1;
  else if (seasonHit) score += 2;
  else if (profile.shift === "different") score += 0;
  else score -= 1;

  const overlap = profile.occasions.filter((occasion) => perfume.occasions.includes(occasion)).length;
  score += overlap * 2;

  if (profile.reference && profile.reference !== "none" && perfume.inspiredBy === profile.reference) {
    score += 3;
  }

  if (profile.shift === "different") {
    score += isSweet(perfume) ? -3 : 2;
  }

  return score;
}

export function resultHeading(profile: Profile, count: number) {
  const occasions = profile.occasions.map(occasionLabel).join(" و ");
  const season = profile.season === "all" ? "" : ` در ${seasonShort(profile.season)}`;
  const ref = referenceLabel(profile.reference);
  const prefix = ref && profile.reference !== "none" ? `نزدیک به ${ref}، ` : "";
  return `${prefix}${countWord(count)} عطر برای ${occasions}${season}`;
}

function minPrice(perfume: Perfume) {
  return Math.min(...perfume.shops.map((shop) => shop.price));
}

export function withinBudget(perfume: Perfume, budget: number) {
  return perfume.shops.some((shop) => shop.price <= budget * 1_000_000);
}
