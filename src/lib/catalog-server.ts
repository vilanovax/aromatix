import "server-only";
import { cache } from "react";
import { installCatalog, seedSnapshot, type CatalogSnapshot } from "@/lib/catalog";
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
    return { ...value, slug, nameFa, nameEn, brand: brandName };
  } catch {
    return null;
  }
}

export const loadCatalog = cache(async (): Promise<CatalogSnapshot> => {
  try {
    const [brands, rows] = await Promise.all([
      db.orm.aroma.CatalogBrand.orderBy((row) => row.nameFa.asc()).all(),
      db.orm.aroma.CatalogPerfume.all(),
    ]);
    if (rows.length === 0) {
      const seed = seedSnapshot();
      installCatalog(seed);
      return seed;
    }
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
        active: brand.active,
      })),
      perfumes,
    };
    installCatalog(snapshot);
    return snapshot;
  } catch (error) {
    console.error(error);
    const seed = seedSnapshot();
    installCatalog(seed);
    return seed;
  }
});

export async function catalogStoreStatus(): Promise<CatalogStore> {
  try {
    const rows = await db.orm.aroma.CatalogPerfume.select("slug").all();
    return rows.length === 0 ? "empty" : "ready";
  } catch (error) {
    console.error(error);
    return "offline";
  }
}
