"use server";

import { revalidatePath } from "next/cache";
import { formatCheckedOn } from "@/lib/admin/health";
import { parsePerfumeInput, type PerfumeInput } from "@/lib/admin/perfume-input";
import { requireSection } from "@/lib/auth/admin";
import { catalogStoreStatus, loadCatalog } from "@/lib/catalog-server";
import { allBrands, allPerfumes, allShops, brandByName, seedSnapshot } from "@/lib/catalog";
import type { Perfume, ShopOffer } from "@/lib/types";
import { db } from "@/prisma/db";

export type ActionResult = { ok: true; slug?: string } | { ok: false; error: string };

function denied(): ActionResult {
  return { ok: false, error: "به مدیریت دسترسی نداری." };
}

function publish() {
  revalidatePath("/", "layout");
}

function stampShops(next: ShopOffer[], previous: ShopOffer[] | undefined, now: Date): ShopOffer[] {
  return next.map((shop) => {
    const prior = previous?.find((item) => item.shop === shop.shop && item.href === shop.href);
    const unchanged =
      prior &&
      prior.price === shop.price &&
      prior.stockConfirmed === shop.stockConfirmed &&
      prior.checkedOn === shop.checkedOn;
    if (unchanged && prior.checkedAt) return { ...shop, checkedOn: prior.checkedOn, checkedAt: prior.checkedAt };
    if (unchanged && prior) return { ...shop, checkedOn: prior.checkedOn, checkedAt: prior.checkedAt };
    return { ...shop, checkedOn: formatCheckedOn(now), checkedAt: now.toISOString() };
  });
}

async function writePerfume(perfume: Perfume) {
  const brand = brandByName(perfume.brand);
  if (!brand) return denied();
  const document = JSON.stringify(perfume);
  const existing = await db.orm.aroma.CatalogPerfume.where((row) => row.slug.eq(perfume.slug)).select("slug").first();
  const data = {
    nameFa: perfume.nameFa,
    nameEn: perfume.nameEn,
    brandSlug: brand.slug,
    document,
    updatedAt: new Date().toISOString(),
  };
  if (existing) {
    await db.orm.aroma.CatalogPerfume.where((row) => row.slug.eq(perfume.slug)).update(data);
  } else {
    await db.orm.aroma.CatalogPerfume.create({ slug: perfume.slug, ...data });
  }
  publish();
  return { ok: true as const, slug: perfume.slug };
}

export async function savePerfume(input: PerfumeInput, slugLocked?: string): Promise<ActionResult> {
  if (!(await requireSection("perfumes"))) return denied();
  if ((await catalogStoreStatus()) !== "ready") {
    return { ok: false, error: "اول کاتالوگ اولیه را از نمای کلی منتشر کن." };
  }
  await loadCatalog();
  const known = allPerfumes().map((perfume) => perfume.slug);
  const parsed = parsePerfumeInput(input, { slugLocked, knownSlugs: known });
  if ("error" in parsed) return { ok: false, error: parsed.error };

  const previous = slugLocked ? allPerfumes().find((perfume) => perfume.slug === slugLocked) : undefined;
  const perfume = {
    ...parsed.value,
    shops: stampShops(parsed.value.shops, previous?.shops, new Date()),
  };
  try {
    return await writePerfume(perfume);
  } catch (error) {
    console.error(error);
    return { ok: false, error: "ذخیره نشد. کمی بعد دوباره امتحان کن." };
  }
}

export async function deletePerfume(slug: string): Promise<ActionResult> {
  if (!(await requireSection("perfumes"))) return denied();
  await loadCatalog();
  if (!allPerfumes().some((perfume) => perfume.slug === slug)) {
    return { ok: false, error: "این عطر در کاتالوگ نیست." };
  }
  try {
    const rows = await db.orm.aroma.CatalogPerfume.all();
    for (const row of rows) {
      if (row.slug === slug) continue;
      const perfume = JSON.parse(row.document) as Perfume;
      if (!perfume.similar?.includes(slug)) continue;
      perfume.similar = perfume.similar.filter((item) => item !== slug);
      await db.orm.aroma.CatalogPerfume.where((item) => item.slug.eq(row.slug)).update({
        document: JSON.stringify(perfume),
        updatedAt: new Date().toISOString(),
      });
    }
    await db.orm.aroma.CatalogPerfume.where((row) => row.slug.eq(slug)).delete();
    publish();
    return { ok: true };
  } catch (error) {
    console.error(error);
    return { ok: false, error: "حذف نشد." };
  }
}

export async function publishSeedCatalog(): Promise<ActionResult> {
  if (!(await requireSection("overview"))) return denied();
  try {
    const existing = await db.orm.aroma.CatalogPerfume.select("slug").all();
    if (existing.length > 0) return { ok: false, error: "کاتالوگ قبلاً منتشر شده." };
    const seed = seedSnapshot();
    for (const brand of seed.brands) {
      await db.orm.aroma.CatalogBrand.create(brand);
    }
    for (const shop of seed.shops) {
      await db.orm.aroma.CatalogShop.create(shop);
    }
    const now = new Date().toISOString();
    for (const perfume of seed.perfumes) {
      const brand = seed.brands.find((item) => item.nameFa === perfume.brand);
      if (!brand) continue;
      await db.orm.aroma.CatalogPerfume.create({
        slug: perfume.slug,
        nameFa: perfume.nameFa,
        nameEn: perfume.nameEn,
        brandSlug: brand.slug,
        document: JSON.stringify(perfume),
        updatedAt: now,
      });
    }
    publish();
    return { ok: true };
  } catch (error) {
    console.error(error);
    return { ok: false, error: "انتشار کاتالوگ اولیه نشد." };
  }
}

function readBrandFields(input: { nameFa?: unknown; nameEn?: unknown; description?: unknown; active?: unknown }) {
  const nameFa = typeof input.nameFa === "string" ? input.nameFa.trim().replace(/\s+/g, " ") : "";
  const nameEn = typeof input.nameEn === "string" ? input.nameEn.trim().replace(/\s+/g, " ") : "";
  const description = typeof input.description === "string" ? input.description.trim().replace(/\s+/g, " ") : "";
  const active = input.active !== false;
  if (nameFa.length < 2 || nameFa.length > 40 || nameEn.length < 2 || nameEn.length > 40) {
    return { ok: false as const, error: "نام فارسی و انگلیسی برند را بنویس." };
  }
  if (description.length > 400) return { ok: false as const, error: "توضیح برند حداکثر ۴۰۰ حرف باشد." };
  return { ok: true as const, nameFa, nameEn, description, active };
}

export async function createBrand(input: {
  slug?: unknown;
  nameFa?: unknown;
  nameEn?: unknown;
  description?: unknown;
}): Promise<ActionResult> {
  if (!(await requireSection("brands"))) return denied();
  const slug = typeof input.slug === "string" ? input.slug.trim().toLowerCase() : "";
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return { ok: false, error: "اسلاگ برند فقط حرف کوچک، عدد و خط تیره باشد." };
  const fields = readBrandFields({ ...input, active: true });
  if (!fields.ok) return fields;
  await loadCatalog();
  if (allBrands().some((brand) => brand.slug === slug || brand.nameFa === fields.nameFa)) {
    return { ok: false, error: "این برند قبلاً هست." };
  }
  try {
    const stored = await db.orm.aroma.CatalogPerfume.select("slug").all();
    if (stored.length === 0) return { ok: false, error: "اول کاتالوگ اولیه را منتشر کن." };
    await db.orm.aroma.CatalogBrand.create({
      slug,
      nameFa: fields.nameFa,
      nameEn: fields.nameEn,
      description: fields.description,
      active: true,
    });
    publish();
    return { ok: true, slug };
  } catch (error) {
    console.error(error);
    return { ok: false, error: "برند ذخیره نشد." };
  }
}

export async function updateBrand(input: {
  slug?: unknown;
  nameFa?: unknown;
  nameEn?: unknown;
  description?: unknown;
  active?: unknown;
}): Promise<ActionResult> {
  if (!(await requireSection("brands"))) return denied();
  const slug = typeof input.slug === "string" ? input.slug : "";
  const fields = readBrandFields(input);
  if (!fields.ok) return fields;
  await loadCatalog();
  const current = allBrands().find((brand) => brand.slug === slug);
  if (!current) return { ok: false, error: "این برند در کاتالوگ نیست." };
  if (allBrands().some((brand) => brand.slug !== slug && brand.nameFa === fields.nameFa)) {
    return { ok: false, error: "برند دیگری با این نام فارسی هست." };
  }
  try {
    await db.orm.aroma.CatalogBrand.where((row) => row.slug.eq(slug)).update({
      nameFa: fields.nameFa,
      nameEn: fields.nameEn,
      description: fields.description,
      active: fields.active,
    });
    if (current.nameFa !== fields.nameFa) {
      const rows = await db.orm.aroma.CatalogPerfume.where((row) => row.brandSlug.eq(slug)).all();
      for (const row of rows) {
        const perfume = JSON.parse(row.document) as Perfume;
        perfume.brand = fields.nameFa;
        await db.orm.aroma.CatalogPerfume.where((item) => item.slug.eq(row.slug)).update({
          document: JSON.stringify(perfume),
          updatedAt: new Date().toISOString(),
        });
      }
    }
    publish();
    return { ok: true, slug };
  } catch (error) {
    console.error(error);
    return { ok: false, error: "برند ذخیره نشد." };
  }
}

function cleanLine(value: unknown, max: number) {
  const text = typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";
  return text.slice(0, max);
}

function readShopFields(input: {
  nameFa?: unknown;
  nameEn?: unknown;
  description?: unknown;
  website?: unknown;
  instagram?: unknown;
  telegram?: unknown;
  phone?: unknown;
  city?: unknown;
  active?: unknown;
}) {
  const nameFa = cleanLine(input.nameFa, 40);
  const nameEn = cleanLine(input.nameEn, 40);
  const description = cleanLine(input.description, 400);
  const website = cleanLine(input.website, 200);
  const instagram = cleanLine(input.instagram, 80);
  const telegram = cleanLine(input.telegram, 80);
  const phone = cleanLine(input.phone, 20);
  const city = cleanLine(input.city, 40);
  const active = input.active !== false;
  if (nameFa.length < 2 || nameEn.length < 2) return { ok: false as const, error: "نام فارسی و انگلیسی فروشگاه را بنویس." };
  if (website && !/^https:\/\/\S+$/.test(website)) return { ok: false as const, error: "وب‌سایت باید با https:// شروع شود." };
  return { ok: true as const, nameFa, nameEn, description, website, instagram, telegram, phone, city, active };
}

export async function createShop(input: {
  slug?: unknown;
  nameFa?: unknown;
  nameEn?: unknown;
  description?: unknown;
  website?: unknown;
  instagram?: unknown;
  telegram?: unknown;
  phone?: unknown;
  city?: unknown;
}): Promise<ActionResult> {
  if (!(await requireSection("shops"))) return denied();
  const slug = typeof input.slug === "string" ? input.slug.trim().toLowerCase() : "";
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return { ok: false, error: "اسلاگ فروشگاه فقط حرف کوچک، عدد و خط تیره باشد." };
  const fields = readShopFields({ ...input, active: true });
  if (!fields.ok) return fields;
  await loadCatalog();
  if (allShops().some((shop) => shop.slug === slug || shop.nameFa === fields.nameFa)) {
    return { ok: false, error: "این فروشگاه قبلاً هست." };
  }
  try {
    const stored = await db.orm.aroma.CatalogPerfume.select("slug").all();
    if (stored.length === 0) return { ok: false, error: "اول کاتالوگ اولیه را منتشر کن." };
    await db.orm.aroma.CatalogShop.create({
      slug,
      nameFa: fields.nameFa,
      nameEn: fields.nameEn,
      description: fields.description,
      website: fields.website,
      instagram: fields.instagram,
      telegram: fields.telegram,
      phone: fields.phone,
      city: fields.city,
      active: true,
    });
    publish();
    return { ok: true, slug };
  } catch (error) {
    console.error(error);
    return { ok: false, error: "فروشگاه ذخیره نشد." };
  }
}

export async function updateShop(input: {
  slug?: unknown;
  nameFa?: unknown;
  nameEn?: unknown;
  description?: unknown;
  website?: unknown;
  instagram?: unknown;
  telegram?: unknown;
  phone?: unknown;
  city?: unknown;
  active?: unknown;
}): Promise<ActionResult> {
  if (!(await requireSection("shops"))) return denied();
  const slug = typeof input.slug === "string" ? input.slug : "";
  const fields = readShopFields(input);
  if (!fields.ok) return fields;
  await loadCatalog();
  const current = allShops().find((shop) => shop.slug === slug);
  if (!current) return { ok: false, error: "این فروشگاه در فهرست نیست." };
  if (allShops().some((shop) => shop.slug !== slug && shop.nameFa === fields.nameFa)) {
    return { ok: false, error: "فروشگاه دیگری با این نام فارسی هست." };
  }
  try {
    await db.orm.aroma.CatalogShop.where((row) => row.slug.eq(slug)).update({
      nameFa: fields.nameFa,
      nameEn: fields.nameEn,
      description: fields.description,
      website: fields.website,
      instagram: fields.instagram,
      telegram: fields.telegram,
      phone: fields.phone,
      city: fields.city,
      active: fields.active,
    });
    if (current.nameFa !== fields.nameFa) {
      const rows = await db.orm.aroma.CatalogPerfume.all();
      const now = new Date().toISOString();
      for (const row of rows) {
        const perfume = JSON.parse(row.document) as Perfume;
        if (!perfume.shops?.some((offer) => offer.shop === current.nameFa)) continue;
        perfume.shops = perfume.shops.map((offer) => (offer.shop === current.nameFa ? { ...offer, shop: fields.nameFa } : offer));
        await db.orm.aroma.CatalogPerfume.where((item) => item.slug.eq(row.slug)).update({
          document: JSON.stringify(perfume),
          updatedAt: now,
        });
      }
    }
    publish();
    return { ok: true, slug };
  } catch (error) {
    console.error(error);
    return { ok: false, error: "فروشگاه ذخیره نشد." };
  }
}

export async function setShopActive(input: { slug?: unknown; active?: unknown }): Promise<ActionResult> {
  if (!(await requireSection("shops"))) return denied();
  const slug = typeof input.slug === "string" ? input.slug : "";
  const active = input.active === true;
  await loadCatalog();
  const current = allShops().find((shop) => shop.slug === slug);
  if (!current) return { ok: false, error: "این فروشگاه در فهرست نیست." };
  try {
    await db.orm.aroma.CatalogShop.where((row) => row.slug.eq(slug)).update({ active });
    publish();
    return { ok: true, slug };
  } catch (error) {
    console.error(error);
    return { ok: false, error: "وضعیت فروشگاه عوض نشد." };
  }
}

export async function setBrandActive(input: { slug?: unknown; active?: unknown }): Promise<ActionResult> {
  if (!(await requireSection("brands"))) return denied();
  const slug = typeof input.slug === "string" ? input.slug : "";
  const active = input.active === true;
  await loadCatalog();
  const current = allBrands().find((brand) => brand.slug === slug);
  if (!current) return { ok: false, error: "این برند در کاتالوگ نیست." };
  try {
    await db.orm.aroma.CatalogBrand.where((row) => row.slug.eq(slug)).update({ active });
    publish();
    return { ok: true, slug };
  } catch (error) {
    console.error(error);
    return { ok: false, error: "وضعیت برند عوض نشد." };
  }
}
