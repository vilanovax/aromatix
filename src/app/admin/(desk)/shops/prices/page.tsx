import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { OfferDesk } from "@/app/admin/offer-desk";
import { catalogStoreStatus, loadCatalog } from "@/lib/catalog-server";
import { guardSection } from "@/lib/auth/admin";

export const metadata: Metadata = { title: "به‌روزرسانی قیمت · مدیریت آروما" };

export default async function ShopPricesPage({ searchParams }: { searchParams: Promise<{ shop?: string }> }) {
  await guardSection("shops");
  if ((await catalogStoreStatus()) !== "ready") redirect("/admin/shops");
  const { shop } = await searchParams;
  const snapshot = await loadCatalog();
  const initialShop = snapshot.shops.some((item) => item.slug === shop) ? shop : "";

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/admin/shops" className="inline-flex min-h-11 items-center text-label text-muted-foreground">
        فروشگاه‌ها
      </Link>
      <h1 className="mt-1 text-headline font-bold text-balance">به‌روزرسانی قیمت</h1>
      <p className="mt-2 max-w-xl text-pretty text-body text-muted-foreground">فایل را بگذار. پرش بالای ۴۰٪ تا تأیید تو منتشر نمی‌شود.</p>
      <div className="mt-5">
        <OfferDesk shops={snapshot.shops.map((item) => ({ slug: item.slug, nameFa: item.nameFa }))} initialShop={initialShop} />
      </div>
    </div>
  );
}