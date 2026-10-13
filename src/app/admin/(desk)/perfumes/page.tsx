import type { Metadata } from "next";
import { PerfumeIndex, type PerfumeRow } from "@/app/admin/perfume-index";
import { ButtonLink } from "@/components/Button";
import { Card } from "@/components/Card";
import { catalogIssues } from "@/lib/admin/health";
import { catalogStoreStatus, loadCatalog } from "@/lib/catalog-server";
import { leadOffer } from "@/lib/catalog";
import { faNum, millionToman } from "@/lib/format";
import { guardSection } from "@/lib/auth/admin";

export const metadata: Metadata = { title: "عطرها · مدیریت آروما" };

export default async function PerfumesPage() {
  await guardSection("perfumes");
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
          <p className="mt-2 max-w-2xl text-pretty text-body text-muted">
            {store === "ready"
              ? issues.length > 0
                ? `${faNum(snapshot.perfumes.length)} عطر منتشرشده، ${faNum(new Set(issues.map((issue) => issue.slug)).size)} تا با مورد باز. نام، فرم را باز می‌کند؛ برچسب، همان بخش را.`
                : `${faNum(snapshot.perfumes.length)} عطر منتشرشده. مورد بازی نیست.`
              : "هنوز چیزی منتشر نشده"}
          </p>
        </div>
        {store === "ready" ? (
          <ButtonLink href="/admin/perfumes/new" size="md" className="shrink-0">
            عطر جدید
          </ButtonLink>
        ) : null}
      </div>

      {store !== "ready" ? (
        <Card className="mt-6 p-5">
          <p className="text-pretty text-body text-muted">از نمای کلی کاتالوگ اولیه را منتشر کن تا ویرایش اینجا باز شود.</p>
          <ButtonLink href="/admin" variant="edge" className="mt-4">
            نمای کلی
          </ButtonLink>
        </Card>
      ) : (
        <>
          <PerfumeIndex rows={rows} />
        </>
      )}
    </div>
  );
}
