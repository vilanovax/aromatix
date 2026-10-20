"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronLeft, SearchX } from "lucide-react";
import { PerfumePhoto } from "@/components/Bottle";
import { Shell } from "@/components/Shell";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { listedPrice } from "@/lib/catalog";
import { countWord, millionToman } from "@/lib/format";
import { perfumeHref } from "@/lib/nav";
import { perfumesMatchingName } from "@/lib/suggest";

export default function SearchPage() {
  return (
    <Suspense>
      <SearchScreen />
    </Suspense>
  );
}

function SearchScreen() {
  const params = useSearchParams();
  const query = (params.get("q") ?? "").trim();
  const matches = query ? perfumesMatchingName(query) : [];
  const here = `/search?q=${encodeURIComponent(query)}`;

  return (
    <Shell back={{ href: "/", label: "خانه" }}>
      <article className="vf app step-in px-5 pt-6 pb-[max(2.5rem,env(safe-area-inset-bottom))]">
        <h1 className="text-balance text-display font-bold">
          {query ? `عطرهایی با «${query}»` : "جستجو"}
        </h1>
        {matches.length > 0 ? (
          <p className="mt-2 text-pretty text-body text-muted-foreground">
            {countWord(matches.length)} عطر این عبارت را در نام دارند.
          </p>
        ) : null}

        {matches.length === 0 ? (
          <EmptyState
            className="mt-8"
            icon={SearchX}
            title={query ? "عطری با این نام نیست" : "عبارتی برای جستجو نیست"}
            description="نام را در خانه بنویس و بپرس."
          />
        ) : (
          <ul className="mt-5 flex flex-col gap-3">
            {matches.map((perfume) => {
              const price = listedPrice(perfume);
              return (
                <li key={perfume.slug}>
                  <Card className="p-0">
                    <Link
                      href={perfumeHref(perfume.slug, here)}
                      className="flex min-h-16 items-center gap-3 rounded-surface p-3 outline-offset-2 focus-visible:outline-2 focus-visible:outline-ring"
                    >
                      <PerfumePhoto perfume={perfume} sizes="thumb" alt="" className="h-16 w-12 shrink-0 rounded-control" />
                      <span className="min-w-0 flex-1 text-start">
                        <span className="block text-title font-semibold">{perfume.nameFa}</span>
                        <span className="mt-1 block text-label text-muted-foreground">
                          {perfume.brand}
                          {price ? `، ${millionToman(price)}` : ""}
                        </span>
                      </span>
                      <ChevronLeft className="size-4 shrink-0 text-muted-foreground" strokeWidth={1.5} aria-hidden="true" />
                    </Link>
                  </Card>
                </li>
              );
            })}
          </ul>
        )}
      </article>
    </Shell>
  );
}
