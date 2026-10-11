"use client";

import Link from "next/link";
import { AccordMark } from "@/components/AccordMark";
import { CheckIcon } from "@/components/Icons";
import { TasteRow } from "@/components/TasteRow";
import { cheaperUnconfirmed, leadOffer } from "@/lib/catalog";
import { cn, faNum, millionToman, ordinalWord } from "@/lib/format";
import { useAroma } from "@/lib/store";
import type { Perfume } from "@/lib/types";

export function PerfumeCard({ perfume, rank }: { perfume: Perfume; rank: number }) {
  const { compare, toggleCompare, openShops } = useAroma();
  const offer = leadOffer(perfume);
  const cheaper = cheaperUnconfirmed(perfume);
  const picked = compare.includes(perfume.slug);
  const topAccords = perfume.accords.slice(0, 3).map((accord) => accord.name).join("، ");

  return (
    <article className="rounded-2xl border border-[var(--line)] bg-[var(--card)] p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[12px] font-medium text-[var(--muted)]">پیشنهاد {ordinalWord(rank)}</p>
        <button
          type="button"
          aria-pressed={picked}
          onClick={() => toggleCompare(perfume.slug)}
          className={cn(
            "pressable inline-flex min-h-8 shrink-0 items-center gap-1 rounded-full border px-2.5 text-[12px]",
            picked
              ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--paper)]"
              : "edge border-[var(--line)] text-[var(--muted)]",
          )}
        >
          {picked ? <CheckIcon className="size-3.5" /> : null}
          مقایسه
        </button>
      </div>

      <h2 className="mt-1 text-[1.05rem] font-semibold leading-6">
        <Link href={`/perfume/${perfume.slug}`}>{perfume.nameFa}</Link>
      </h2>
      <p className="text-[13px] text-[var(--muted)]">{perfume.brand}</p>

      <div className="mt-2.5">
        <AccordMark accords={perfume.accords} />
        <p className="mt-1.5 text-[12px] leading-5 text-[var(--muted)]">{topAccords}</p>
      </div>

      <p className="mt-2 text-[14px] leading-6">{perfume.why}</p>

      <button
        type="button"
        onClick={() => openShops(perfume.slug)}
        className="pressable quiet mt-1.5 -mx-1.5 flex w-[calc(100%+0.75rem)] flex-col items-start rounded-xl px-1.5 py-1.5 text-start"
      >
        <span className="text-[14px] font-semibold">
          {millionToman(offer.price)}، {offer.shop}
        </span>
        <span className="mt-0.5 flex items-center gap-1.5 text-[12px] text-[var(--muted)]">
          <span
            aria-hidden="true"
            className={cn("size-1.5 rounded-full", offer.stockConfirmed ? "bg-[#4F8A62]" : "bg-[#B8A27A]")}
          />
          {offer.stockConfirmed ? `موجود، بررسی ${offer.checkedOn}` : `آخرین قیمت ${offer.checkedOn}، موجودی تأیید نشده`}
        </span>
        {cheaper ? (
          <span className="mt-0.5 text-[12px] text-[var(--muted)]">
            در {cheaper.shop} {millionToman(cheaper.price)}، موجودی تأیید نشده
          </span>
        ) : null}
      </button>

      <div className="mt-2">
        <TasteRow slug={perfume.slug} dense />
      </div>

      <p className="sr-only">رتبهٔ {faNum(rank)}</p>
    </article>
  );
}
