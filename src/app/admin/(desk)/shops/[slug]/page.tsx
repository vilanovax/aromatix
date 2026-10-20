import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { ShopEditor } from "@/app/admin/shop-editor";
import { catalogStoreStatus, loadCatalog } from "@/lib/catalog-server";
import { offerMatchesShop } from "@/lib/offers";
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
    (count, perfume) => count + perfume.shops.filter((offer) => offerMatchesShop(offer, shop)).length,
    0,
  );

  return (
    <div className="mx-auto max-w-3xl">
      <ShopEditor mode="edit" shop={shop} offerCount={offerCount} />
    </div>
  );
}
