"use client";

import Link from "next/link";
import { ForwardIcon } from "@/components/Icons";
import { Shell } from "@/components/Shell";
import { brandCatalog } from "@/lib/catalog";
import { countWord } from "@/lib/format";

export default function BrandsIndexPage() {
  const list = brandCatalog();

  return (
    <Shell composer back={{ href: "/", label: "خانه" }}>
      <div className="px-5 pt-6 pb-[max(2rem,env(safe-area-inset-bottom))]">
        <h1 className="text-display font-bold">برندها</h1>
        <p className="mt-2.5 max-w-[22rem] text-pretty text-body text-muted">
          برندهایی که عطرشان در آروما هست؛ نه ویترین فروشگاه.
        </p>

        <ul className="mt-6 flex flex-col gap-2.5">
          {list.map((brand) => (
            <li key={brand.slug}>
              <Link
                href={`/brands/${brand.slug}`}
                className="pressable quiet flex min-h-16 items-center gap-3 rounded-panel border border-line bg-card px-4 py-3 outline-offset-2 focus-visible:outline-2 focus-visible:outline-ink"
              >
                <span className="min-w-0 flex-1 text-start">
                  <span className="block text-body font-semibold">{brand.nameFa}</span>
                  <span className="mt-0.5 block text-label text-muted">
                    <span dir="ltr" className="inline-block">
                      {brand.nameEn}
                    </span>
                    <span className="mx-1.5 text-faint">·</span>
                    {countWord(brand.count)} عطر
                  </span>
                </span>
                <ForwardIcon className="size-5 shrink-0 text-muted" />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </Shell>
  );
}
