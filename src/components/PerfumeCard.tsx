"use client";

import Link from "next/link";
import { AccordMark } from "@/components/AccordMark";
import { BrandLink } from "@/components/BrandLink";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Chip } from "@/components/Chip";
import { CheckIcon } from "@/components/Icons";
import { cheaperUnconfirmed, leadOffer } from "@/lib/catalog";
import { cn, faNum, millionToman, ordinalWord } from "@/lib/format";
import { useAroma } from "@/lib/store";
import type { Perfume } from "@/lib/types";

export function PerfumeCard({ perfume, rank }: { perfume: Perfume; rank: number }) {
  const { compare, toggleCompare, openShops } = useAroma();
  const offer = leadOffer(perfume);
  const cheaper = cheaperUnconfirmed(perfume);
  const picked = compare.includes(perfume.slug);

  return (
    <Card as="article" shadow="card" className="p-3.5">
      <div className="flex items-start justify-between gap-3">
        <p className="pt-2 text-label font-medium text-muted">پیشنهاد {ordinalWord(rank)}</p>
        <Chip
          selected={picked}
          onClick={() => toggleCompare(perfume.slug)}
          aria-label={picked ? `حذف ${perfume.nameFa} از مقایسه` : `افزودن ${perfume.nameFa} به مقایسه`}
          className="gap-1 px-3"
        >
          {picked ? <CheckIcon className="size-3.5" /> : null}
          مقایسه
        </Chip>
      </div>

      <div className="mt-1">
        <Link
          href={`/perfume/${perfume.slug}`}
          className="block rounded-control outline-offset-2 focus-visible:outline-2 focus-visible:outline-ink"
        >
          <h2 className="text-title font-semibold">{perfume.nameFa}</h2>
        </Link>
        <p className="mt-0.5 text-label text-muted">
          <BrandLink name={perfume.brand} from={perfume.slug} />
        </p>
      </div>

      <div className="mt-3">
        <AccordMark accords={perfume.accords} names />
      </div>

      <p className="mt-2.5 text-pretty text-body">{perfume.why}</p>

      <Button
        variant="quiet"
        shape="control"
        onClick={() => openShops(perfume.slug)}
        className="mt-3 w-full flex-col items-start border-t border-line pt-3 text-start font-normal"
      >
        <span className="text-body font-semibold">
          {millionToman(offer.price)}
          <span className="font-normal text-muted">، {offer.shop}</span>
        </span>
        <span className="mt-1 flex items-center gap-1.5 text-label text-muted">
          <span
            aria-hidden="true"
            className={cn("size-1.5 shrink-0 rounded-full", offer.stockConfirmed ? "bg-stock-ok" : "bg-stock-pending")}
          />
          <span className="min-w-0 text-pretty">
            {offer.stockConfirmed ? `موجود، بررسی ${offer.checkedOn}` : `آخرین قیمت ${offer.checkedOn}`}
            {cheaper ? ` · ${cheaper.shop} ${millionToman(cheaper.price)}` : ""}
          </span>
        </span>
      </Button>

      <p className="sr-only">رتبهٔ {faNum(rank)}</p>
    </Card>
  );
}
