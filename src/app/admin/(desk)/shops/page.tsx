import type { Metadata } from "next";
import { ShopIndex, type ShopRow } from "@/app/admin/shop-index";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { catalogStoreStatus, loadCatalog } from "@/lib/catalog-server";
import { faNum } from "@/lib/format";
import { guardSection } from "@/lib/auth/admin";

export const metadata: Metadata = { title: "فروشگاه‌ها · مدیریت آروما" };

export default async function ShopsPage() {
  await guardSection("shops");
  const store = await catalogStoreStatus();
  const snapshot = await loadCatalog();
  const rows: ShopRow[] = snapshot.shops.map((shop) => ({
    slug: shop.slug,
    nameFa: shop.nameFa,
    nameEn: shop.nameEn,
    city: shop.city,
    website: shop.website,
    active: shop.active,
    offerCount: snapshot.perfumes.reduce(
      (count, perfume) => count + perfume.shops.filter((offer) => offer.shop === shop.nameFa).length,
      0,
    ),
  }));
  const activeCount = rows.filter((row) => row.active).length;

  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-headline font-bold text-balance">فروشگاه‌ها</h1>
          <p className="mt-2 max-w-2xl text-pretty text-body text-muted-foreground">
            {store === "ready"
              ? `${faNum(rows.length)} فروشگاه، ${faNum(activeCount)} فعال. قیمت و موجودی مال فروشگاه است، نه فرم عطر.`
              : "هنوز چیزی منتشر نشده"}
          </p>
        </div>
        {store === "ready" ? (
          <Button href="/admin/shops/new" size="md" className="shrink-0">
            فروشگاه جدید
          </Button>
        ) : null}
      </div>

      {store !== "ready" ? (
        <EmptyState
          className="mt-6"
          title="کاتالوگ هنوز باز نیست"
          description="از نمای کلی کاتالوگ اولیه را منتشر کن تا فروشگاه‌ها اینجا باز شوند."
          action={
            <Button href="/admin" variant="outline">
              نمای کلی
            </Button>
          }
        />
      ) : (
        <ShopIndex rows={rows} />
      )}
    </div>
  );
}
