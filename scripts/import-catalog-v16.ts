import "dotenv/config";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import postgres from "@prisma/orm-postgres/runtime";
import { brandMeta } from "../src/lib/brand-registry";
import { perfumeFromLocked, type LockedPerfumeRow } from "../src/lib/locked-perfume";
import type { Contract } from "../src/prisma/contract.d";
import contractJson from "../src/prisma/contract.json" with { type: "json" };

const sourcePath = resolve(
  process.argv[2] ?? "data/catalog/all-app-v16.LOCKED.json",
);

const db = postgres<Contract>({
  contractJson,
  url: process.env["DATABASE_URL"]!,
});

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.close();
  });

async function main() {
  const rows = JSON.parse(readFileSync(sourcePath, "utf8")) as LockedPerfumeRow[];
  if (!Array.isArray(rows) || rows.length === 0) {
    throw new Error(`فایل خالی یا نامعتبر: ${sourcePath}`);
  }

  const perfumes = rows.map((row) => perfumeFromLocked(row));
  const brandNames = [...new Set(perfumes.map((perfume) => perfume.brand))].sort((a, b) =>
    a.localeCompare(b, "fa"),
  );

  for (const nameFa of brandNames) {
    const meta = brandMeta(nameFa);
    if (!meta) throw new Error(`برند در رجیستری نیست: ${nameFa}`);
    const existing = await db.orm.aroma.CatalogBrand.where((row) => row.slug.eq(meta.slug)).select("slug").first();
    const data = {
      nameFa,
      nameEn: meta.nameEn,
      description: "",
      active: true,
    };
    if (existing) {
      await db.orm.aroma.CatalogBrand.where((row) => row.slug.eq(meta.slug)).update(data);
    } else {
      await db.orm.aroma.CatalogBrand.create({ slug: meta.slug, ...data });
    }
  }

  const now = new Date().toISOString();
  let created = 0;
  let updated = 0;
  for (const perfume of perfumes) {
    const meta = brandMeta(perfume.brand)!;
    const document = JSON.stringify(perfume);
    const existing = await db.orm.aroma.CatalogPerfume.where((row) => row.slug.eq(perfume.slug))
      .select("slug")
      .first();
    const data = {
      nameFa: perfume.nameFa,
      nameEn: perfume.nameEn,
      brandSlug: meta.slug,
      document,
      updatedAt: now,
    };
    if (existing) {
      await db.orm.aroma.CatalogPerfume.where((row) => row.slug.eq(perfume.slug)).update(data);
      updated += 1;
    } else {
      await db.orm.aroma.CatalogPerfume.create({ slug: perfume.slug, ...data });
      created += 1;
    }
  }

  const total = await db.orm.aroma.CatalogPerfume.select("slug").all();
  const brands = await db.orm.aroma.CatalogBrand.select("slug").all();
  console.log(
    JSON.stringify(
      {
        source: sourcePath,
        imported: perfumes.length,
        brands: brandNames.length,
        created,
        updated,
        catalogPerfumeRows: total.length,
        catalogBrandRows: brands.length,
        shopsKeptSeparate: true,
      },
      null,
      2,
    ),
  );
}
