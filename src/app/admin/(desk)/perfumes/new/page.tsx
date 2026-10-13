import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PerfumeForm, blankPerfume } from "@/app/admin/perfume-form";
import { allBrands, allPerfumes, allShops } from "@/lib/catalog";
import { catalogStoreStatus, loadCatalog } from "@/lib/catalog-server";
import { guardSection } from "@/lib/auth/admin";

export const metadata: Metadata = { title: "عطر جدید · مدیریت آروما" };

export default async function NewPerfumePage() {
  await guardSection("perfumes");
  if ((await catalogStoreStatus()) !== "ready") redirect("/admin/perfumes");
  await loadCatalog();
  const brands = allBrands();
  const shops = allShops();
  const brand = brands.find((item) => item.active) ?? brands[0];
  if (!brand) redirect("/admin/perfumes");
  const perfume = blankPerfume(brand.nameFa);
  const shop = shops.find((item) => item.active) ?? shops[0];
  if (shop) {
    perfume.shops[0] = { ...perfume.shops[0], shop: shop.nameFa, href: shop.website || "https://" };
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PerfumeForm
        mode="create"
        perfume={perfume}
        brands={brands}
        shops={shops}
        others={allPerfumes().map((item) => ({ slug: item.slug, nameFa: item.nameFa }))}
      />
    </div>
  );
}
