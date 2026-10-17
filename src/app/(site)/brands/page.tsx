"use client";

import Link from "next/link";
import { ChevronLeft, Store } from "lucide-react";
import { PerfumePhoto } from "@/components/Bottle";
import { Shell } from "@/components/Shell";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { brandCatalog, perfumesByBrand } from "@/lib/catalog";
import { countWord, joinFa } from "@/lib/format";

export default function BrandsIndexPage() {
  const list = brandCatalog();

  return (
    <Shell composer back={{ href: "/", label: "خانه" }}>
      <div className="vf app px-5 pt-6 pb-[max(2.5rem,env(safe-area-inset-bottom))]">
        <h1 className="text-headline font-bold">برندها</h1>
        <p className="mt-2 text-pretty text-body text-muted-foreground">عطرهای هر برند که در آروما بررسی شده‌اند.</p>

        {list.length === 0 ? (
          <EmptyState className="mt-8" icon={Store} title="هنوز برندی در این نمونه نیست" />
        ) : (
          <ul className="mt-6 flex flex-col gap-3">
            {list.map((brand) => {
              const items = perfumesByBrand(brand.nameFa);
              const shown = items.slice(0, 3);
              const rest = items.length - shown.length;
              const sample =
                rest > 0
                  ? `${shown.map((perfume) => perfume.nameFa).join("، ")}، …`
                  : joinFa(shown.map((perfume) => perfume.nameFa));

              return (
                <li key={brand.slug}>
                  <Card className="p-0">
                    <Link
                      href={`/brands/${brand.slug}`}
                      aria-label={`${brand.nameFa}، ${countWord(brand.count)} عطر`}
                      className="flex min-h-16 items-start gap-3 rounded-surface p-4 outline-offset-2 focus-visible:outline-2 focus-visible:outline-ring"
                    >
                      <span className="flex shrink-0" aria-hidden="true">
                        {shown.map((perfume, index) => (
                          <PerfumePhoto
                            key={perfume.slug}
                            perfume={perfume}
                            sizes="thumb"
                            alt=""
                            className={
                              index === 0
                                ? "h-14 w-12 rounded-control ring-2 ring-card"
                                : "-ms-4 h-14 w-12 rounded-control ring-2 ring-card"
                            }
                          />
                        ))}
                      </span>
                      <span className="min-w-0 flex-1 text-start">
                        <span className="block text-title font-semibold">{brand.nameFa}</span>
                        <span className="mt-1 flex flex-wrap items-baseline gap-2 text-label text-muted-foreground">
                          <bdi dir="ltr">{brand.nameEn}</bdi>
                          <span aria-hidden="true">·</span>
                          <span>{countWord(brand.count)} عطر</span>
                        </span>
                        <span className="mt-2 line-clamp-2 text-pretty text-label">
                          {brand.description || sample}
                        </span>
                      </span>
                      <ChevronLeft className="mt-1 size-4 shrink-0 text-muted-foreground" strokeWidth={1.5} aria-hidden="true" />
                    </Link>
                  </Card>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Shell>
  );
}
