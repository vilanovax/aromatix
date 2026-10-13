import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PerfumeForm } from "@/app/admin/perfume-form";
import { allBrands, allPerfumes, getPerfume } from "@/lib/catalog";
import { loadCatalog } from "@/lib/catalog-server";
import { guardSection } from "@/lib/auth/admin";

type Params = { slug: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  await loadCatalog();
  const perfume = getPerfume(slug);
  return { title: perfume ? `${perfume.nameFa} · مدیریت آروما` : "عطر · مدیریت آروما" };
}

export default async function EditPerfumePage({ params }: { params: Promise<Params> }) {
  await guardSection("perfumes");
  const { slug } = await params;
  await loadCatalog();
  const perfume = getPerfume(slug);
  if (!perfume) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <PerfumeForm mode="edit" perfume={perfume} brands={allBrands()} others={allPerfumes()} />
    </div>
  );
}
