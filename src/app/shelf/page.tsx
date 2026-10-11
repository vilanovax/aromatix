"use client";

import Link from "next/link";
import { AccordMark } from "@/components/AccordMark";
import { Bottle } from "@/components/Bottle";
import { ForwardIcon } from "@/components/Icons";
import { Shell } from "@/components/Shell";
import { TasteRow } from "@/components/TasteRow";
import { getPerfume, leadOffer } from "@/lib/catalog";
import { cn, faNum, millionToman } from "@/lib/format";
import { useAroma } from "@/lib/store";
import type { Accord, Perfume, Taste } from "@/lib/types";

const GROUPS: Array<{ id: Taste; label: string; dot: string }> = [
  { id: "like", label: "دوست دارم", dot: "bg-[var(--ink)]" },
  { id: "try", label: "می‌خوام امتحان کنم", dot: "bg-[#7FA58A]" },
  { id: "dislike", label: "دوست ندارم", dot: "bg-[var(--danger)]" },
];

const WEIGHT: Record<Taste, number> = { like: 1, try: 0.5, dislike: 0 };

export default function ShelfPage() {
  const { ready, taste } = useAroma();
  const entries = Object.entries(taste)
    .map(([slug, value]) => ({ perfume: getPerfume(slug), value }))
    .filter((entry): entry is { perfume: Perfume; value: Taste } => entry.perfume !== undefined);
  const profile = tasteAccords(entries);

  return (
    <Shell composer back={{ href: "/results", label: "پیشنهادها" }}>
      <div className="px-5 pt-6 pb-10">
        <h1 className="text-[1.6rem] font-bold">قفسه</h1>
        <p className="mt-1.5 text-[14px] leading-7 text-[var(--muted)]">روی همین دستگاه می‌ماند و پیشنهاد بعدی را به سلیقه‌ات نزدیک‌تر می‌کند.</p>

        {!ready ? null : entries.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-[var(--line)] p-5">
            <p className="text-[15px] font-semibold">قفسه هنوز خالی است</p>
            <p className="mt-1.5 text-[14px] leading-7 text-[var(--muted)]">
              روی هر پیشنهاد بزن «دوست دارم» یا «امتحان کنم» تا اینجا جمع شود.
            </p>
            <Link
              href="/"
              className="pressable solid mt-4 inline-flex min-h-12 items-center rounded-2xl bg-[var(--ink)] px-5 text-[15px] font-semibold text-[var(--paper)]"
            >
              شروع انتخاب
            </Link>
          </div>
        ) : (
          <>
            {profile.length > 0 ? (
              <section className="mt-6 rounded-2xl bg-[var(--card)] p-4 shadow-[0_6px_20px_-16px_rgba(28,33,31,0.4)]">
                <h2 className="text-[13px] font-semibold">سلیقه‌ات تا اینجا</h2>
                <div className="mt-3">
                  <AccordMark accords={profile} labeled />
                </div>
              </section>
            ) : null}

            <div className="mt-8 flex flex-col gap-8">
              {GROUPS.map((group) => {
                const items = entries.filter((entry) => entry.value === group.id).map((entry) => entry.perfume);
                if (items.length === 0) return null;
                return (
                  <section key={group.id} aria-labelledby={`group-${group.id}`}>
                    <h2 id={`group-${group.id}`} className="flex items-center gap-2 text-[15px] font-semibold">
                      <span className={cn("size-2 rounded-full", group.dot)} aria-hidden="true" />
                      {group.label}
                      <span className="text-[13px] font-normal text-[var(--muted)]">{faNum(items.length)}</span>
                    </h2>
                    <ul className="mt-3 flex flex-col gap-3">
                      {items.map((perfume) => (
                        <ShelfItem key={perfume.slug} perfume={perfume} muted={group.id === "dislike"} />
                      ))}
                    </ul>
                  </section>
                );
              })}
            </div>
          </>
        )}
      </div>
    </Shell>
  );
}

function ShelfItem({ perfume, muted }: { perfume: Perfume; muted: boolean }) {
  const offer = leadOffer(perfume);
  return (
    <li className="rounded-2xl border border-[var(--line)] bg-[var(--card)] p-3">
      <Link href={`/perfume/${perfume.slug}`} className="group flex items-center gap-3 rounded-xl">
        <Bottle perfume={perfume} className={cn("h-20 w-14 shrink-0 rounded-xl", muted && "opacity-55 grayscale")} />
        <span className="min-w-0 flex-1">
          <span className="block font-semibold">{perfume.nameFa}</span>
          <span className="mt-0.5 block text-[13px] text-[var(--muted)]">
            {perfume.brand}
            {offer ? `، از ${millionToman(Math.min(...perfume.shops.map((shop) => shop.price)))}` : null}
          </span>
          <span className="mt-2.5 block max-w-[12rem]">
            <AccordMark accords={perfume.accords} />
          </span>
        </span>
        <ForwardIcon className="size-5 shrink-0 text-[var(--muted)]" />
      </Link>
      <div className="mt-3">
        <TasteRow slug={perfume.slug} />
      </div>
    </li>
  );
}

function tasteAccords(entries: Array<{ perfume: Perfume; value: Taste }>): Accord[] {
  const totals = new Map<string, Accord>();
  for (const { perfume, value } of entries) {
    const weight = WEIGHT[value];
    if (!weight) continue;
    for (const accord of perfume.accords) {
      const current = totals.get(accord.name);
      totals.set(accord.name, {
        name: accord.name,
        color: accord.color,
        strength: (current?.strength ?? 0) + accord.strength * weight,
      });
    }
  }
  return [...totals.values()].sort((a, b) => b.strength - a.strength).slice(0, 4);
}
