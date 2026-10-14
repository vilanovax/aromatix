import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PerfumeForm } from "@/app/admin/perfume-form";
import { blankPerfume } from "@/lib/admin/blank-perfume";
import { allBrands, allPerfumes } from "@/lib/catalog";
import { catalogStoreStatus, loadCatalog } from "@/lib/catalog-server";
import { guardSection } from "@/lib/auth/admin";

export const metadata: Metadata = { title: "عطر جدید · مدیریت آروما" };

export default async function NewPerfumePage() {
  await guardSection("perfumes");
  if ((await catalogStoreStatus()) !== "ready") redirect("/admin/perfumes");
  await loadCatalog();
  const brands = allBrands();
  const brand = brands.find((item) => item.active) ?? brands[0];
  if (!brand) redirect("/admin/perfumes");
  const perfume = blankPerfume(brand.nameFa);

  return (
    <div className="mx-auto max-w-3xl">
      <PerfumeForm
        mode="create"
        perfume={perfume}
        brands={brands}
        others={allPerfumes().map((item) => ({ slug: item.slug, nameFa: item.nameFa }))}
      />
    </div>
  );
}
