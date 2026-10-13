import "server-only";
import { PRICE_STALE_MS } from "@/lib/admin/health";
import { getBrand, getPerfume } from "@/lib/catalog";
import type { Perfume } from "@/lib/types";
import { db } from "@/prisma/db";

const SECTION_LABELS: Record<string, string> = {
  "/": "خانه",
  "/results": "پیشنهادها",
  "/shelf": "آرومای من",
  "/brands": "برندها",
  "/learn": "دانستنی‌ها",
  "/guide": "راهنما",
  "/compare": "مقایسه",
};

export type UsageRow = { label: string; count: number; href?: string };
export type DemandRow = { slug: string; nameFa: string; attention: number; gap: string };

export type UsageReport = {
  days: number;
  total: number;
  perfumes: UsageRow[];
  brands: UsageRow[];
  sections: UsageRow[];
  demand: DemandRow[];
  unseen: UsageRow[];
};

export type UsageEventRow = { kind: string; subject: string };

export async function loadUsageEvents(days: number): Promise<UsageEventRow[] | null> {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
  try {
    return await db.orm.aroma.UsageEvent.where((row) => row.createdAt.gte(since)).select("kind", "subject").all();
  } catch (error) {
    console.error(error);
    return null;
  }
}

export function usageFromEvents(days: number, rows: UsageEventRow[], perfumes: Perfume[]): UsageReport {
  return summarize(days, rows, perfumes);
}

export async function loadUsageReport(days: number, perfumes: Perfume[]): Promise<UsageReport | null> {
  const rows = await loadUsageEvents(days);
  if (!rows) return null;
  return usageFromEvents(days, rows, perfumes);
}

function summarize(
  days: number,
  rows: Array<{ kind: string; subject: string }>,
  perfumes: Perfume[],
): UsageReport {
  const views = count(rows, "perfume_view");
  const shops = count(rows, "shop_open");
  const recommendations = count(rows, "recommendation");
  const brands = count(rows, "brand_view");
  const sections = count(rows, "section_view");

  return {
    days,
    total: rows.length,
    perfumes: rank(views, (slug) => getPerfume(slug)?.nameFa ?? slug, (slug) => `/admin/perfumes/${slug}`),
    brands: rank(brands, (slug) => getBrand(slug)?.nameFa ?? slug, (slug) => `/brands/${slug}`),
    sections: [...sections.entries()]
      .map(([subject, amount]) => ({ label: SECTION_LABELS[subject] ?? subject, count: amount }))
      .sort((a, b) => b.count - a.count),
    demand: perfumes
      .flatMap((perfume) => {
        const gap = shopGap(perfume);
        const attention = (views.get(perfume.slug) ?? 0) + (shops.get(perfume.slug) ?? 0);
        if (!gap || attention === 0) return [];
        return [{ slug: perfume.slug, nameFa: perfume.nameFa, attention, gap }];
      })
      .sort((a, b) => b.attention - a.attention)
      .slice(0, 6),
    unseen: [...recommendations.entries()]
      .filter(([slug, amount]) => amount > 0 && (views.get(slug) ?? 0) === 0)
      .map(([slug, amount]) => ({
        label: getPerfume(slug)?.nameFa ?? slug,
        count: amount,
        href: `/admin/perfumes/${slug}`,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6),
  };
}

function count(rows: Array<{ kind: string; subject: string }>, kind: string) {
  const counts = new Map<string, number>();
  for (const row of rows) {
    if (row.kind !== kind) continue;
    counts.set(row.subject, (counts.get(row.subject) ?? 0) + 1);
  }
  return counts;
}

function rank(counts: Map<string, number>, label: (subject: string) => string, href: (subject: string) => string): UsageRow[] {
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([subject, amount]) => ({ label: label(subject), count: amount, href: href(subject) }));
}

function shopGap(perfume: Perfume) {
  if (perfume.shops.length === 0) return "بدون فروشگاه";
  if (perfume.shops.some((shop) => !shop.stockConfirmed)) return "موجودی تأیید نشده";
  const stale = perfume.shops.some((shop) => {
    if (!shop.checkedAt) return false;
    const time = Date.parse(shop.checkedAt);
    return !Number.isNaN(time) && Date.now() - time > PRICE_STALE_MS;
  });
  return stale ? "قیمت کهنه" : null;
}
