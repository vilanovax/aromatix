import { OCCASIONS, publishedPerfumes } from "@/lib/catalog";
import type { Perfume, Season } from "@/lib/types";

export type WearFacet = "season" | "occasion";

const SEASON_IDS = ["summer", "winter", "mild", "all"] as const;

export const SEASON_CHIPS: Array<{ id: Season; label: string }> = [
  { id: "summer", label: "تابستان" },
  { id: "winter", label: "زمستان" },
  { id: "mild", label: "معتدل" },
  { id: "all", label: "همهٔ فصل‌ها" },
];

export const OCCASION_CHIPS = OCCASIONS.map((item) => ({ id: item.id, label: item.label }));

export function wearHref(facet: WearFacet, ids: readonly string[], from?: string) {
  const params = new URLSearchParams();
  for (const id of ids) {
    if (facet === "season" && isSeason(id)) params.append("season", id);
    if (facet === "occasion" && isOccasion(id)) params.append("occasion", id);
  }
  if (from) params.set("from", from);
  return `/wear?${params.toString()}`;
}

export function readWear(params: { getAll: (key: string) => string[] }): { facet: WearFacet; ids: string[] } {
  const seasons = unique(params.getAll("season").filter(isSeason));
  const occasions = unique(params.getAll("occasion").filter(isOccasion));
  if (seasons.length === 0 && occasions.length > 0) return { facet: "occasion", ids: occasions };
  return { facet: "season", ids: seasons };
}

export function seasonChipLabel(id: string) {
  return SEASON_CHIPS.find((item) => item.id === id)?.label ?? id;
}

export function occasionChipLabel(id: string) {
  return OCCASION_CHIPS.find((item) => item.id === id)?.label ?? id;
}

export function perfumesForWear(facet: WearFacet, ids: string[]): Perfume[] {
  if (ids.length === 0) return [];
  return publishedPerfumes()
    .filter((perfume) => wears(perfume, facet, ids))
    .sort((a, b) => a.nameFa.localeCompare(b.nameFa, "fa"));
}

export function wearTags(perfume: Perfume, facet: WearFacet, ids: string[]) {
  if (facet === "season") {
    if (perfume.seasons.includes("all") && !ids.includes("all")) return [seasonChipLabel("all")];
    return perfume.seasons.filter((season) => ids.includes(season)).map(seasonChipLabel);
  }
  return perfume.occasions.filter((occasion) => ids.includes(occasion)).map(occasionChipLabel);
}

export function includesYearRound(perfumes: Perfume[], ids: string[]) {
  return !ids.includes("all") && perfumes.some((perfume) => perfume.seasons.includes("all"));
}

function wears(perfume: Perfume, facet: WearFacet, ids: string[]) {
  if (facet === "occasion") return perfume.occasions.some((occasion) => ids.includes(occasion));
  return perfume.seasons.some((season) => season === "all" || ids.includes(season));
}

function isSeason(id: string): id is Season {
  return (SEASON_IDS as readonly string[]).includes(id);
}

function isOccasion(id: string) {
  return OCCASION_CHIPS.some((item) => item.id === id);
}

function unique(ids: string[]) {
  return [...new Set(ids)];
}
