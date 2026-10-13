import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PerfumeForm, blankPerfume } from "@/app/admin/perfume-form";
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

  return (
    <div className="mx-auto max-w-3xl">
      <PerfumeForm mode="create" perfume={blankPerfume(brand.nameFa)} brands={brands} others={allPerfumes()} />
    </div>
  );
}
