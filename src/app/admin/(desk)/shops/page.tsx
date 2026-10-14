import type { Metadata } from "next";
import { ShopIndex, type ShopRow } from "@/app/admin/shop-index";
import { ButtonLink } from "@/components/Button";
import { Card } from "@/components/Card";
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
          <p className="mt-2 max-w-2xl text-pretty text-body text-muted">
            {store === "ready"
              ? `${faNum(rows.length)} فروشگاه، ${faNum(activeCount)} فعال. قیمت و موجودی مال فروشگاه است، نه فرم عطر.`
              : "هنوز چیزی منتشر نشده"}
          </p>
        </div>
        {store === "ready" ? (
          <ButtonLink href="/admin/shops/new" size="md" className="shrink-0">
            فروشگاه جدید
          </ButtonLink>
        ) : null}
      </div>

      {store !== "ready" ? (
        <Card className="mt-6 p-5">
          <p className="text-pretty text-body text-muted">از نمای کلی کاتالوگ اولیه را منتشر کن تا فروشگاه‌ها اینجا باز شوند.</p>
          <ButtonLink href="/admin" variant="edge" className="mt-4">
            نمای کلی
          </ButtonLink>
        </Card>
      ) : (
        <ShopIndex rows={rows} />
      )}
    </div>
  );
}
