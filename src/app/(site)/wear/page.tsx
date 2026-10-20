"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { PerfumePhoto } from "@/components/Bottle";
import { Shell } from "@/components/Shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { publicLead } from "@/lib/catalog";
import { cn, countWord, joinFa, millionToman } from "@/lib/format";
import { perfumeHref, resolvePerfumeBack } from "@/lib/nav";
import {
  OCCASION_CHIPS,
  SEASON_CHIPS,
  includesYearRound,
  occasionChipLabel,
  perfumesForWear,
  readWear,
  seasonChipLabel,
  wearTags,
  type WearFacet,
} from "@/lib/wear";

export default function WearPage() {
  return (
    <Suspense>
      <WearScreen />
    </Suspense>
  );
}

function WearScreen() {
  const router = useRouter();
  const search = useSearchParams();
  const { facet, ids } = readWear(search);
  const chips = facet === "season" ? SEASON_CHIPS : OCCASION_CHIPS;
  const perfumes = perfumesForWear(facet, ids);
  const labels = ids.map((id) => (facet === "season" ? seasonChipLabel(id) : occasionChipLabel(id)));
  const back = search.get("from") ? resolvePerfumeBack(search.get("from")) : { href: "/", label: "خانه" };
  const here = `/wear?${search.toString()}`;

  function toggle(id: string) {
    const next = new URLSearchParams(search.toString());
    const key = facet;
    const current = next.getAll(key).filter((item) => item !== id);
    next.delete(key);
    for (const item of current) next.append(key, item);
    if (!ids.includes(id)) next.append(key, id);
    router.replace(`/wear?${next.toString()}`);
  }

  return (
    <Shell back={back}>
      <article className="vf app step-in px-5 pt-6 pb-[max(2.5rem,env(safe-area-inset-bottom))]">
        <header>
          <h1 className="text-balance text-display font-bold">{facet === "season" ? "فصل" : "کجا"}</h1>
          <p className="mt-2 text-pretty text-body text-muted-foreground">{lead(facet, labels, perfumes.length)}</p>
          <ul className="mt-4 flex flex-wrap justify-start gap-2" aria-label={facet === "season" ? "فصل‌ها" : "موقعیت‌ها"}>
            {chips.map((chip) => {
              const pressed = ids.includes(chip.id);
              return (
                <li key={chip.id}>
                  <Button
                    type="button"
                    variant={pressed ? "secondary" : "outline"}
                    aria-pressed={pressed}
                    onClick={() => toggle(chip.id)}
                    className={cn("min-h-11 !rounded-full px-4 font-medium", !pressed && "!bg-card")}
                  >
                    {chip.label}
                  </Button>
                </li>
              );
            })}
          </ul>
          {facet === "season" && includesYearRound(perfumes, ids) ? (
            <p className="mt-3 text-pretty text-label text-muted-foreground">
              عطرهای همهٔ فصل‌ها هم آمده‌اند، چون محدود به یک فصل نیستند.
            </p>
          ) : null}
        </header>

        {perfumes.length > 0 ? (
          <ul className="mt-6 flex flex-col gap-3">
            {perfumes.map((perfume) => {
              const offer = publicLead(perfume);
              const tags = joinFa(wearTags(perfume, facet, ids));
              return (
                <li key={perfume.slug}>
                  <Card className="p-0">
                    <Link
                      href={perfumeHref(perfume.slug, here)}
                      className="flex items-start gap-3 p-3 outline-offset-2 focus-visible:outline-2 focus-visible:outline-ring"
                    >
                      <PerfumePhoto perfume={perfume} sizes="thumb" alt="" className="h-16 w-12 shrink-0 rounded-control" />
                      <span className="min-w-0 flex-1 text-start">
                        <span className="block text-title font-semibold">{perfume.nameFa}</span>
                        <span className="mt-1 block text-label text-muted-foreground">
                          {perfume.brand}
                          {tags ? `، ${tags}` : ""}
                        </span>
                        {offer ? (
                          <span className="mt-1 block text-label text-muted-foreground">{millionToman(offer.price)}</span>
                        ) : null}
                      </span>
                      <ChevronLeft className="mt-1 size-4 shrink-0 text-muted-foreground" strokeWidth={1.5} aria-hidden="true" />
                    </Link>
                  </Card>
                </li>
              );
            })}
          </ul>
        ) : null}
      </article>
    </Shell>
  );
}

function lead(facet: WearFacet, labels: string[], count: number) {
  if (labels.length === 0) return facet === "season" ? "یک فصل را انتخاب کن." : "یک موقعیت را انتخاب کن.";
  const which = joinFa(labels);
  if (count === 0) return `برای ${which} عطری در این نمونه نیست.`;
  if (count === 1) return `یک عطر برای ${which}.`;
  return `${countWord(count)} عطر برای ${which}.`;
}
