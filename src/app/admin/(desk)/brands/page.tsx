import type { Metadata } from "next";
import { BrandIndex, type BrandRow } from "@/app/admin/brand-index";
import { ButtonLink } from "@/components/Button";
import { Card } from "@/components/Card";
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
          <p className="text-label text-brass">کاتالوگ</p>
          <h1 className="mt-1 text-headline font-bold">برندها</h1>
          <p className="mt-1 text-label text-muted">
            {store === "ready" ? `${faNum(rows.length)} برند، ${faNum(activeCount)} فعال` : "هنوز چیزی منتشر نشده"}
          </p>
        </div>
        {store === "ready" ? (
          <ButtonLink href="/admin/brands/new" size="md" className="shrink-0">
            برند جدید
          </ButtonLink>
        ) : null}
      </div>

      {store !== "ready" ? (
        <Card className="mt-6 p-5">
          <p className="text-pretty text-body text-muted">از نمای کلی کاتالوگ اولیه را منتشر کن تا برندها اینجا باز شوند.</p>
          <ButtonLink href="/admin" variant="edge" className="mt-4">
            نمای کلی
          </ButtonLink>
        </Card>
      ) : (
        <BrandIndex rows={rows} />
      )}
    </div>
  );
}
