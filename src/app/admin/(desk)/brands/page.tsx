import type { Metadata } from "next";
import { BrandIndex, type BrandRow } from "@/app/admin/brand-index";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { catalogStoreStatus, loadCatalog } from "@/lib/catalog-server";
import { faNum } from "@/lib/format";
import { guardSection } from "@/lib/auth/admin";

export const metadata: Metadata = { title: "برندها · مدیریت آروما" };

export default async function BrandsPage() {
  await guardSection("brands");
  const store = await catalogStoreStatus();
  const snapshot = await loadCatalog();
  const rows: BrandRow[] = snapshot.brands.map((brand) => ({
    slug: brand.slug,
    nameFa: brand.nameFa,
    nameEn: brand.nameEn,
    description: brand.description,
    active: brand.active,
    perfumeCount: snapshot.perfumes.filter((perfume) => perfume.brand === brand.nameFa).length,
  }));
  const activeCount = rows.filter((row) => row.active).length;

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-headline font-bold">برندها</h1>
          <p className="mt-1 text-label text-muted-foreground">
            {store === "ready" ? `${faNum(rows.length)} برند، ${faNum(activeCount)} فعال` : "هنوز چیزی منتشر نشده"}
          </p>
        </div>
        {store === "ready" ? (
          <Button href="/admin/brands/new" size="md" className="shrink-0">
            برند جدید
          </Button>
        ) : null}
      </div>

      {store !== "ready" ? (
        <EmptyState
          className="mt-6"
          title="کاتالوگ هنوز باز نیست"
          description="از نمای کلی کاتالوگ اولیه را منتشر کن تا برندها اینجا باز شوند."
          action={
            <Button href="/admin" variant="outline">
              نمای کلی
            </Button>
          }
        />
      ) : (
        <BrandIndex rows={rows} />
      )}
    </div>
  );
}
