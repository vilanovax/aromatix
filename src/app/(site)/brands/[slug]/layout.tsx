import type { Metadata } from "next";
import { loadCatalog } from "@/lib/catalog-server";
import { getBrand, perfumesByBrand } from "@/lib/catalog";
import { faNum } from "@/lib/format";
import { pageMeta } from "@/lib/page-meta";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  await loadCatalog();
  const { slug } = await params;
  const brand = getBrand(decodeURIComponent(slug));
  if (!brand?.active) return pageMeta("برند", "این برند در آروما نیست.");
  const count = perfumesByBrand(brand.nameFa).length;
  return pageMeta(brand.nameFa, `${brand.description} ${faNum(count)} عطر در این فهرست.`);
}

export default function BrandLayout({ children }: { children: React.ReactNode }) {
  return children;
}
