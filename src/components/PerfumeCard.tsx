"use client";

import Link from "next/link";
import { AccordMark } from "@/components/AccordMark";
import { Bottle } from "@/components/Bottle";
import { CheckIcon, ForwardIcon } from "@/components/Icons";
import { TasteRow } from "@/components/TasteRow";
import { leadOffer } from "@/lib/catalog";
import { cn, millionToman } from "@/lib/format";
import { useAroma } from "@/lib/store";
import type { Perfume } from "@/lib/types";

export function PerfumeCard({ perfume }: { perfume: Perfume }) {
  const { compare, toggleCompare, openShops } = useAroma();
  const offer = leadOffer(perfume);
  const picked = compare.includes(perfume.slug);

  return (
    <article className="rounded-2xl border border-[var(--line)] bg-[var(--card)] p-3.5">
      <div className="flex gap-3">
        <Link href={`/perfume/${perfume.slug}`} className="shrink-0 rounded-xl focus-visible:outline-offset-4">
          <Bottle perfume={perfume} className="h-[6.5rem] w-[4.75rem] rounded-xl" />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h2 className="text-[1.05rem] font-semibold leading-6">
                <Link href={`/perfume/${perfume.slug}`}>{perfume.nameFa}</Link>
              </h2>
              <p className="mt-0.5 text-[13px] text-[var(--muted)]">{perfume.brand}</p>
              <p dir="ltr" className="text-end text-[11px] text-[var(--muted)]">
                {perfume.nameEn}
              </p>
            </div>
            <button
              type="button"
              aria-pressed={picked}
              onClick={() => toggleCompare(perfume.slug)}
              className={cn(
                "pressable -me-1 inline-flex min-h-9 shrink-0 items-center gap-1 rounded-full border px-2.5 text-[12px]",
                picked
                  ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--paper)]"
                  : "edge border-[var(--line)] text-[var(--muted)]",
              )}
            >
              {picked ? <CheckIcon className="size-3.5" /> : null}
              مقایسه
            </button>
          </div>
          <div className="mt-3">
            <AccordMark accords={perfume.accords} />
          </div>
        </div>
      </div>
      <p className="mt-3 text-[15px] leading-7">{perfume.why}</p>
      {offer ? (
        <button
          type="button"
          onClick={() => openShops(perfume.slug)}
          className="pressable quiet -mx-1.5 mt-2 flex w-[calc(100%+0.75rem)] items-center gap-2 rounded-xl px-1.5 py-2 text-start"
        >
          <span className="min-w-0 flex-1">
            <span className="text-[15px] font-semibold">{millionToman(offer.price)}</span>
            <span className="text-[13px] text-[var(--muted)]">، {offer.shop}</span>
            <span className="mt-1 flex items-center gap-1.5 text-[12px] text-[var(--muted)]">
              <span
                aria-hidden="true"
                className={cn("size-1.5 rounded-full", offer.stockConfirmed ? "bg-[#4F8A62]" : "bg-[#B8A27A]")}
              />
              {offer.stockConfirmed ? `موجود، بررسی ${offer.checkedOn}` : `آخرین قیمت ${offer.checkedOn}، موجودی تأیید نشده`}
            </span>
          </span>
          <span className="inline-flex shrink-0 items-center text-[13px] text-[var(--muted)]">
            فروشگاه‌ها
            <ForwardIcon className="size-4" />
          </span>
        </button>
      ) : null}
      <div className="mt-3">
        <TasteRow slug={perfume.slug} />
      </div>
    </article>
  );
}
