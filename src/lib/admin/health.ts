import type { Perfume } from "@/lib/types";

export const LOW_CONFIDENCE = 0.75;
export const PRICE_STALE_MS = 21 * 24 * 60 * 60 * 1000;

export type IssuePart = "shops" | "scent" | "use" | "identity" | "links";

export type CatalogIssue = {
  slug: string;
  nameFa: string;
  label: string;
  part: IssuePart;
};

export function catalogIssues(perfumes: Perfume[]): CatalogIssue[] {
  const slugs = new Set(perfumes.map((perfume) => perfume.slug));
  const issues: CatalogIssue[] = [];

  for (const perfume of perfumes) {
    const push = (label: string, part: IssuePart) =>
      issues.push({ slug: perfume.slug, nameFa: perfume.nameFa, label, part });
    if (!perfume.image) push("بدون عکس", "identity");
    if (perfume.longevity == null) push("ماندگاری خالی", "use");
    if (perfume.sillage == null) push("پخش بو خالی", "use");
    if (perfume.confidence < LOW_CONFIDENCE) push("اطمینان پایین", "use");
    for (const similar of perfume.similar) {
      if (!slugs.has(similar)) push(`مشابه ناموجود: ${similar}`, "links");
    }
    for (const shop of perfume.shops) {
      if (!shop.stockConfirmed) push(`${shop.shop}: موجودی تأیید نشده`, "shops");
      if (!shop.checkedAt) continue;
      const time = Date.parse(shop.checkedAt);
      if (!Number.isNaN(time) && Date.now() - time > PRICE_STALE_MS) push(`${shop.shop}: قیمت کهنه`, "shops");
    }
  }

  return issues;
}

export function formatCheckedOn(date: Date) {
  return new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}
