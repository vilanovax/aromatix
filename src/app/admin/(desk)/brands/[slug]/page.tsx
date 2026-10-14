import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { BrandEditor } from "@/app/admin/brand-editor";
import { catalogStoreStatus, loadCatalog } from "@/lib/catalog-server";
import { guardSection } from "@/lib/auth/admin";

export const metadata: Metadata = { title: "ویرایش برند · مدیریت آروما" };

export default async function EditBrandPage({ params }: { params: Promise<{ slug: string }> }) {
  await guardSection("brands");
  if ((await catalogStoreStatus()) !== "ready") redirect("/admin/brands");
  const { slug } = await params;
  const snapshot = await loadCatalog();
  const brand = snapshot.brands.find((item) => item.slug === slug);
  if (!brand) notFound();
  const perfumeCount = snapshot.perfumes.filter((perfume) => perfume.brand === brand.nameFa).length;

  return (
    <div className="mx-auto max-w-3xl">
      <BrandEditor mode="edit" brand={brand} perfumeCount={perfumeCount} />
    </div>
  );
}
