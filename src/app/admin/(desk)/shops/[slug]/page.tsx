import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ShopEditor } from "@/app/admin/shop-editor";
import { catalogStoreStatus, loadCatalog } from "@/lib/catalog-server";
import { guardSection } from "@/lib/auth/admin";

export const metadata: Metadata = { title: "ویرایش فروشگاه · مدیریت آروما" };

export default async function EditShopPage({ params }: { params: Promise<{ slug: string }> }) {
  await guardSection("shops");
  if ((await catalogStoreStatus()) !== "ready") redirect("/admin/shops");
  const { slug } = await params;
  const snapshot = await loadCatalog();
  const shop = snapshot.shops.find((item) => item.slug === slug);
  if (!shop) notFound();
  const offerCount = snapshot.perfumes.reduce(
    (count, perfume) => count + perfume.shops.filter((offer) => offer.shop === shop.nameFa).length,
    0,
  );

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/admin/shops" className="text-label text-muted">
        فروشگاه‌ها
      </Link>
      <h1 className="mt-2 text-headline font-bold">{shop.nameFa}</h1>
      <ShopEditor mode="edit" shop={shop} offerCount={offerCount} />
    </div>
  );
}
