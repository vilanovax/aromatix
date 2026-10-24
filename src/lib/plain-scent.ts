import { occasionLabel, performanceLabel, seasonShort } from "@/lib/catalog";
import { joinFa } from "@/lib/format";
import type { Perfume } from "@/lib/types";

/** One plain-Persian sentence for the perfume detail page. */
export function plainScentLine(perfume: Perfume) {
  const parts: string[] = [];

  const accords = perfume.accords
    .slice(0, 2)
    .map((item) => item.name)
    .filter(Boolean);
  if (accords.length > 0) {
    parts.push(`حال‌وهوای اصلی‌اش ${joinFa(accords)} است`);
  }

  const seasons = perfume.seasons.includes("all")
    ? null
    : perfume.seasons.map((id) => seasonShort(id)).filter(Boolean);
  if (seasons && seasons.length > 0) {
    parts.push(`بیشتر برای ${joinFa(seasons)}`);
  }

  const occasions = perfume.occasions
    .slice(0, 2)
    .map((id) => occasionLabel(id))
    .filter(Boolean);
  if (occasions.length > 0) {
    parts.push(`مناسب ${joinFa(occasions)}`);
  }

  if (perfume.longevity != null) {
    parts.push(`ماندگاری‌اش ${performanceLabel("longevity", perfume.longevity)}`);
  }
  if (perfume.sillage != null) {
    parts.push(`پخش بو ${performanceLabel("sillage", perfume.sillage)}`);
  }

  if (parts.length === 0) {
    return perfume.why.trim() || null;
  }

  const body = parts.join("؛ ");
  return `${body}.`;
}
