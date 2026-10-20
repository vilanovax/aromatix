import "server-only";

import { revalidatePath } from "next/cache";
import { requireSection } from "@/lib/auth/admin";
import { allPerfumes, allShops, brandByName } from "@/lib/catalog";
import { catalogStoreStatus, loadCatalog } from "@/lib/catalog-server";
import { applyOfferFeed, offersToCsv, parseOfferFeed, type OfferApplyReport } from "@/lib/offers";
import { db } from "@/prisma/db";

export type OfferFeedResult = { ok: true; report: OfferApplyReport } | { ok: false; error: string };

export async function commitOfferFeed(input: {
  text?: unknown;
  mode?: unknown;
  shop?: unknown;
  acceptJumps?: unknown;
}): Promise<OfferFeedResult> {
  if (!(await requireSection("shops"))) return { ok: false, error: "به فروشگاه‌ها دسترسی نداری." };
  if ((await catalogStoreStatus()) !== "ready") return { ok: false, error: "اول کاتالوگ اولیه را از نمای کلی منتشر کن." };
  const parsed = parseOfferFeed(input);
  if (!parsed.ok) return parsed;
  await loadCatalog();
  const current = allPerfumes();
  const shops = allShops().map((shop) => ({ slug: shop.slug, nameFa: shop.nameFa, website: shop.website }));
  const applied = applyOfferFeed(current, shops, parsed.feed);
  if (applied.changed.length === 0) return { ok: true, report: applied.report };
  try {
    const now = new Date().toISOString();
    for (const slug of applied.changed) {
      const perfume = applied.perfumes.find((item) => item.slug === slug);
      const brand = perfume ? brandByName(perfume.brand) : undefined;
      if (!perfume || !brand) continue;
      await db.orm.aroma.CatalogPerfume.where((row) => row.slug.eq(slug)).update({
        document: JSON.stringify(perfume),
        updatedAt: now,
      });
    }
    revalidatePath("/", "layout");
    return { ok: true, report: applied.report };
  } catch (error) {
    console.error(error);
    return { ok: false, error: "قیمت‌ها ذخیره نشد." };
  }
}

export async function exportOfferCsv(shopSlug?: string) {
  if (!(await requireSection("shops"))) return { ok: false as const, status: 403, error: "به فروشگاه‌ها دسترسی نداری." };
  if ((await catalogStoreStatus()) !== "ready") return { ok: false as const, status: 409, error: "اول کاتالوگ اولیه را از نمای کلی منتشر کن." };
  await loadCatalog();
  const shops = allShops();
  const shop = shopSlug ? shops.find((item) => item.slug === shopSlug) : undefined;
  if (shopSlug && !shop) return { ok: false as const, status: 404, error: "این فروشگاه در فهرست نیست." };
  return {
    ok: true as const,
    csv: offersToCsv(allPerfumes(), shops.map((item) => ({ slug: item.slug, nameFa: item.nameFa, website: item.website })), shop?.slug),
  };
}
