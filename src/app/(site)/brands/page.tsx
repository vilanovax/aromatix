"use client";

import Link from "next/link";
import { PerfumePhoto } from "@/components/Bottle";
import { ForwardIcon } from "@/components/Icons";
import { Shell } from "@/components/Shell";
import { brandCatalog, perfumesByBrand } from "@/lib/catalog";
import { countWord, joinFa } from "@/lib/format";

export default function BrandsIndexPage() {
  const list = brandCatalog();

  return (
    <Shell composer back={{ href: "/", label: "خانه" }}>
      <div className="px-5 pt-6 pb-[max(2.5rem,env(safe-area-inset-bottom))]">
        <h1 className="text-headline font-bold">برندها</h1>
        <p className="mt-2 max-w-[22rem] text-pretty text-body text-muted">
          عطرهای هر برند که در آروما بررسی شده‌اند.
        </p>

        {list.length === 0 ? (
          <p className="mt-8 text-body text-muted">هنوز برندی در این نمونه نیست.</p>
        ) : (
          <ul className="mt-6 flex flex-col gap-2.5">
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
                  <Link
                    href={`/brands/${brand.slug}`}
                    aria-label={`${brand.nameFa}، ${countWord(brand.count)} عطر`}
                    className="pressable quiet flex min-h-16 items-center gap-3 rounded-panel border border-line bg-card p-3.5 pe-3 outline-offset-2 focus-visible:outline-2 focus-visible:outline-ink"
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
                              ? "h-14 w-11 rounded-control ring-2 ring-card"
                              : "-ms-4 h-14 w-11 rounded-control ring-2 ring-card"
                          }
                        />
                      ))}
                    </span>
                    <span className="min-w-0 flex-1 text-start">
                      <span className="flex min-w-0 items-baseline gap-2">
                        <span className="shrink-0 text-title font-semibold">{brand.nameFa}</span>
                        <span dir="ltr" className="min-w-0 truncate text-label text-muted">
                          {brand.nameEn}
                        </span>
                      </span>
                      <span className="mt-1 line-clamp-2 block text-label text-muted">
                        {countWord(brand.count)} عطر
                        <span className="mx-1.5 text-faint">·</span>
                        {brand.description || sample}
                      </span>
                    </span>
                    <ForwardIcon className="size-5 shrink-0 text-muted" />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Shell>
  );
}
