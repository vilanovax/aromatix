import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { BrandEditor } from "@/app/admin/brand-editor";
import { Button } from "@/components/ui/button";
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
      <Link href="/admin/brands" className="text-label text-muted-foreground">
        برندها
      </Link>
      <div className="mt-2 flex items-start justify-between gap-3">
        <h1 className="text-headline font-bold">{brand.nameFa}</h1>
        <Button href={`/admin/perfumes?brand=${encodeURIComponent(brand.slug)}`} variant="outline" size="md" className="shrink-0">
          لیست عطرها
        </Button>
      </div>
      <BrandEditor mode="edit" brand={brand} perfumeCount={perfumeCount} />
    </div>
  );
}
