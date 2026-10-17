"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { AccordMark } from "@/components/AccordMark";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cheaperUnconfirmed, publicLead } from "@/lib/catalog";
import { cn, faNum, millionToman, ordinalWord } from "@/lib/format";
import { perfumeHref } from "@/lib/nav";
import { useAroma } from "@/lib/store";
import type { Perfume } from "@/lib/types";

export function PerfumeCard({ perfume, rank }: { perfume: Perfume; rank: number }) {
  const { compare, toggleCompare, openShops } = useAroma();
  const offer = publicLead(perfume);
  const cheaper = cheaperUnconfirmed(perfume);
  const picked = compare.includes(perfume.slug);

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="pt-2 text-label font-medium text-muted-foreground">پیشنهاد {ordinalWord(rank)}</p>
        <Button
          variant={picked ? "default" : "outline"}
          size="sm"
          aria-pressed={picked}
          onClick={() => toggleCompare(perfume.slug)}
          aria-label={picked ? `حذف ${perfume.nameFa} از مقایسه` : `افزودن ${perfume.nameFa} به مقایسه`}
          className={cn("min-h-11 !rounded-full px-3 font-medium", !picked && "!bg-card")}
        >
          {picked ? <Check strokeWidth={2} /> : null}
          مقایسه
        </Button>
      </div>

      <div className="mt-1">
        <Link
          href={perfumeHref(perfume.slug, "/results")}
          className="block rounded-control outline-offset-2 focus-visible:outline-2 focus-visible:outline-ring"
        >
          <h2 className="text-title font-semibold">{perfume.nameFa}</h2>
        </Link>
        <p className="mt-1 text-label text-muted-foreground">{perfume.brand}</p>
      </div>

      <div className="mt-3">
        <AccordMark accords={perfume.accords} names />
      </div>

      <p className="mt-3 text-pretty text-body">{perfume.why}</p>

      <Button
        variant="ghost"
        onClick={() => openShops(perfume.slug)}
        className="mt-3 !h-auto w-full !flex-col !items-start !justify-start gap-1 !whitespace-normal border-t border-border pt-3 text-start font-normal"
      >
        <span className="text-body font-semibold">
          {offer ? (
            <>
              {millionToman(offer.price)}
              <span className="font-normal text-muted-foreground">، {offer.shop}</span>
            </>
          ) : (
            "فروشگاه فعالی نیست"
          )}
        </span>
        {offer ? (
          <span className="mt-1 flex items-center gap-2 text-label font-normal text-muted-foreground">
            <span
              aria-hidden="true"
              className={cn("size-2 shrink-0 rounded-full", offer.stockConfirmed ? "bg-stock-ok" : "bg-stock-pending")}
            />
            <span className="min-w-0 text-pretty">
              {offer.stockConfirmed ? `موجود، بررسی ${offer.checkedOn}` : `آخرین قیمت ${offer.checkedOn}`}
              {cheaper ? ` · ${cheaper.shop} ${millionToman(cheaper.price)}` : ""}
            </span>
          </span>
        ) : null}
      </Button>

      <p className="sr-only">رتبهٔ {faNum(rank)}</p>
    </Card>
  );
}
