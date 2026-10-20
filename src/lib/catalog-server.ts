import "server-only";
import { cache } from "react";
import { BUDGET_SETTING_KEY, DEFAULT_BUDGET_MILLIONS, parseBudgetMillions } from "@/lib/budgets";
import { installCatalog, seedShops, seedSnapshot, type CatalogSnapshot, type Shop } from "@/lib/catalog";
import { catalogImage } from "@/lib/perfume-images";
import { attachRemindsOf } from "@/lib/reminds-of";
import type { Perfume } from "@/lib/types";
import { db } from "@/prisma/db";

export type CatalogStore = "empty" | "ready" | "offline";

function perfumeFromDocument(
  document: string,
  brandName: string,
  slug: string,
  nameFa: string,
  nameEn: string,
): Perfume | null {
  try {
    const value = JSON.parse(document) as Perfume;
    if (!value || typeof value !== "object" || !Array.isArray(value.accords) || !Array.isArray(value.shops)) {
      return null;
    }
    const image = catalogImage(slug, value.image);
    return attachRemindsOf({
      ...value,
      slug,
      nameFa,
      nameEn,
      brand: brandName,
      ...(image ? { image } : {}),
    });
  } catch {
    return null;
  }
}

const loadCatalogState = cache(async (): Promise<{ store: CatalogStore; snapshot: CatalogSnapshot }> => {
  try {
    const [brands, rows] = await Promise.all([
      db.orm.aroma.CatalogBrand.orderBy((row) => row.nameFa.asc()).all(),
      db.orm.aroma.CatalogPerfume.all(),
    ]);
    if (rows.length === 0) {
      const seed = seedSnapshot();
      installCatalog(seed);
      return { store: "empty", snapshot: seed };
    }
    const [shops, budgets] = await Promise.all([readyShops(), readBudgetMillions()]);
    const brandName = new Map(brands.map((brand) => [brand.slug, brand.nameFa]));
    const perfumes = rows.flatMap((row) => {
      const perfume = perfumeFromDocument(
        row.document,
        brandName.get(row.brandSlug) ?? "",
        row.slug,
        row.nameFa,
        row.nameEn,
      );
      return perfume ? [perfume] : [];
    });
    const snapshot: CatalogSnapshot = {
      brands: brands.map((brand) => ({
        slug: brand.slug,
        nameFa: brand.nameFa,
        nameEn: brand.nameEn,
        description: brand.description,
        logo: brand.logo,
        website: brand.website,
        instagram: brand.instagram,
        active: brand.active,
      })),
      shops,
      budgets,
      perfumes,
    };
    installCatalog(snapshot);
    return { store: "ready", snapshot };
  } catch (error) {
    console.error(error);
    const seed = seedSnapshot();
    installCatalog(seed);
    return { store: "offline", snapshot: seed };
  }
});

export const loadCatalogBundle = loadCatalogState;

export const loadCatalog = cache(async (): Promise<CatalogSnapshot> => (await loadCatalogState()).snapshot);

async function readBudgetMillions() {
  try {
    const row = await db.orm.aroma.AppSetting.where((item) => item.key.eq(BUDGET_SETTING_KEY)).select("value").first();
    return parseBudgetMillions(row?.value) ?? [...DEFAULT_BUDGET_MILLIONS];
  } catch (error) {
    console.error(error);
    return [...DEFAULT_BUDGET_MILLIONS];
  }
}

export { readBudgetMillions };

async function readyShops(): Promise<Shop[]> {
  let rows = await db.orm.aroma.CatalogShop.orderBy((row) => row.nameFa.asc()).all();
  if (rows.length === 0) {
    for (const shop of seedShops) {
      const existing = await db.orm.aroma.CatalogShop.where((row) => row.slug.eq(shop.slug)).select("slug").first();
      if (!existing) await db.orm.aroma.CatalogShop.create(shop);
    }
    rows = await db.orm.aroma.CatalogShop.orderBy((row) => row.nameFa.asc()).all();
  }
  return rows.map((shop) => ({
    slug: shop.slug,
    nameFa: shop.nameFa,
    nameEn: shop.nameEn,
    description: shop.description,
    website: shop.website,
    instagram: shop.instagram,
    telegram: shop.telegram,
    phone: shop.phone,
    city: shop.city,
    active: shop.active,
  }));
}

export const catalogStoreStatus = cache(async (): Promise<CatalogStore> => (await loadCatalogState()).store);
