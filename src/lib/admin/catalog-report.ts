import { budgetChoices } from "@/lib/budgets";
import { OCCASIONS, SEASONS, listedPrice } from "@/lib/catalog";
import { LOW_CONFIDENCE, PRICE_STALE_MS } from "@/lib/admin/health";
import { offerAvailability } from "@/lib/offer-stock";
import type { Perfume } from "@/lib/types";

export type CountRow = { label: string; count: number };
export type GapRow = { slug: string; nameFa: string; href: string };

export type CatalogReport = {
  total: number;
  brands: CountRow[];
  seasons: CountRow[];
  occasions: CountRow[];
  genders: CountRow[];
  concentrations: CountRow[];
  accords: CountRow[];
  rareAccords: CountRow[];
  price: { min: number; median: number; max: number; priced: number } | null;
  budgets: Array<{ label: string; count: number }>;
  coverage: {
    image: number;
    stock: number;
    fresh: number;
    confidence: number;
  };
  gaps: {
    image: GapRow[];
    stock: GapRow[];
    fresh: GapRow[];
    confidence: GapRow[];
  };
};

export function buildCatalogReport(perfumes: Perfume[]): CatalogReport {
  const total = perfumes.length;
  const prices = perfumes.flatMap((perfume) => {
    const price = listedPrice(perfume);
    return price != null ? [price] : [];
  });
  return {
    total,
    brands: countBy(perfumes, (perfume) => perfume.brand),
    seasons: labeled(perfumes, SEASONS, (perfume) => perfume.seasons),
    occasions: labeled(perfumes, OCCASIONS, (perfume) => perfume.occasions),
    genders: countBy(perfumes, (perfume) => perfume.marketGender),
    concentrations: countBy(perfumes, (perfume) => perfume.concentration ?? "نامشخص"),
    accords: topAccords(perfumes, 8),
    rareAccords: rareAccords(perfumes),
    price: prices.length === 0 ? null : { min: Math.min(...prices), median: median(prices), max: Math.max(...prices), priced: prices.length },
    budgets: budgetChoices().map((budget) => ({
      label: budget.label,
      count: prices.filter((price) => price <= budget.id * 1_000_000).length,
    })),
    coverage: {
      image: share(perfumes, (perfume) => Boolean(perfume.image)),
      stock: share(perfumes, (perfume) => perfume.shops.length > 0 && perfume.shops.every((shop) => offerAvailability(shop) === "in_stock")),
      fresh: share(perfumes, freshPrice),
      confidence: share(perfumes, (perfume) => perfume.confidence >= LOW_CONFIDENCE),
    },
    gaps: {
      image: gaps(perfumes, (perfume) => !perfume.image, "identity"),
      stock: gaps(
        perfumes,
        (perfume) => perfume.shops.length === 0 || perfume.shops.some((shop) => offerAvailability(shop) === "unknown"),
        "shops",
      ),
      fresh: gaps(perfumes, (perfume) => !freshPrice(perfume), "shops"),
      confidence: gaps(perfumes, (perfume) => perfume.confidence < LOW_CONFIDENCE, "use"),
    },
  };
}

function countBy(perfumes: Perfume[], key: (perfume: Perfume) => string): CountRow[] {
  const counts = new Map<string, number>();
  for (const perfume of perfumes) {
    const label = key(perfume);
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, "fa"));
}

function labeled(
  perfumes: Perfume[],
  options: readonly { id: string; label: string; short?: string }[],
  values: (perfume: Perfume) => readonly string[],
): CountRow[] {
  return options.map((option) => ({
    label: option.short ?? option.label,
    count: perfumes.filter((perfume) => values(perfume).includes(option.id)).length,
  }));
}

function accordCounts(perfumes: Perfume[]) {
  const counts = new Map<string, number>();
  for (const perfume of perfumes) {
    for (const name of new Set(perfume.accords.map((accord) => accord.name))) {
      counts.set(name, (counts.get(name) ?? 0) + 1);
    }
  }
  return [...counts.entries()].map(([label, count]) => ({ label, count }));
}

function topAccords(perfumes: Perfume[], limit: number) {
  return accordCounts(perfumes)
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, "fa"))
    .slice(0, limit);
}

function rareAccords(perfumes: Perfume[]) {
  return accordCounts(perfumes)
    .filter((row) => row.count === 1)
    .sort((a, b) => a.label.localeCompare(b.label, "fa"))
    .slice(0, 8);
}

function freshPrice(perfume: Perfume) {
  if (perfume.shops.length === 0) return false;
  return perfume.shops.every((shop) => {
    if (!shop.checkedAt) return true;
    const time = Date.parse(shop.checkedAt);
    return Number.isNaN(time) || Date.now() - time <= PRICE_STALE_MS;
  });
}

function share(perfumes: Perfume[], test: (perfume: Perfume) => boolean) {
  if (perfumes.length === 0) return 0;
  return Math.round((perfumes.filter(test).length / perfumes.length) * 100);
}

function gaps(perfumes: Perfume[], test: (perfume: Perfume) => boolean, part: string): GapRow[] {
  return perfumes
    .filter(test)
    .map((perfume) => ({ slug: perfume.slug, nameFa: perfume.nameFa, href: `/admin/perfumes/${perfume.slug}#${part}` }));
}

function median(values: number[]) {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 1) return sorted[mid];
  return Math.round((sorted[mid - 1] + sorted[mid]) / 2);
}
