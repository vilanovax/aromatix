import type { Metadata } from "next";
import { PerfumeIndex, type PerfumeRow } from "@/app/admin/perfume-index";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { catalogIssues } from "@/lib/admin/health";
import { catalogStoreStatus, loadCatalog } from "@/lib/catalog-server";
import { leadOffer } from "@/lib/catalog";
import { faNum, millionToman } from "@/lib/format";
import { guardSection } from "@/lib/auth/admin";

export const metadata: Metadata = { title: "عطرها · مدیریت آروما" };

export default async function PerfumesPage({ searchParams }: { searchParams: Promise<{ brand?: string }> }) {
  await guardSection("perfumes");
  const { brand } = await searchParams;
  const store = await catalogStoreStatus();
  const snapshot = await loadCatalog();
  const issues = store === "ready" ? catalogIssues(snapshot.perfumes) : [];
  const rows: PerfumeRow[] = snapshot.perfumes.map((perfume) => {
    const offer = perfume.shops.length > 0 ? leadOffer(perfume) : null;
    return {
      slug: perfume.slug,
      nameFa: perfume.nameFa,
      nameEn: perfume.nameEn,
      brand: perfume.brand,
      price: offer?.price ?? null,
      priceLabel: offer ? millionToman(offer.price) : null,
      issues: issues
        .filter((issue) => issue.slug === perfume.slug)
        .map((issue) => ({ label: issue.label, part: issue.part })),
      accords: perfume.accords,
    };
  });

  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-headline font-bold text-balance">عطرها</h1>
          <p className="mt-2 max-w-2xl text-pretty text-body text-muted-foreground">
            {store === "ready"
              ? issues.length > 0
                ? `${faNum(snapshot.perfumes.length)} عطر منتشرشده، ${faNum(new Set(issues.map((issue) => issue.slug)).size)} تا با ${faNum(issues.length)} مورد باز. نام، فرم را باز می‌کند؛ برچسب، همان بخش را.`
                : `${faNum(snapshot.perfumes.length)} عطر منتشرشده. مورد بازی نیست.`
              : "هنوز چیزی منتشر نشده"}
          </p>
        </div>
        {store === "ready" ? (
          <Button href="/admin/perfumes/new" size="md" className="shrink-0">
            عطر جدید
          </Button>
        ) : null}
      </div>

      {store !== "ready" ? (
        <EmptyState
          className="mt-6"
          title="کاتالوگ هنوز باز نیست"
          description="از نمای کلی کاتالوگ اولیه را منتشر کن تا ویرایش اینجا باز شود."
          action={
            <Button href="/admin" variant="outline">
              نمای کلی
            </Button>
          }
        />
      ) : (
        <>
          <PerfumeIndex
            rows={rows}
            brands={snapshot.brands.map((item) => ({ slug: item.slug, nameFa: item.nameFa }))}
            brand={typeof brand === "string" ? brand : ""}
          />
        </>
      )}
    </div>
  );
}
