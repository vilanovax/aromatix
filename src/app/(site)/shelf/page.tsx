"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { AccountStrip } from "@/components/AccountStrip";
import { AccordMark } from "@/components/AccordMark";
import { ScentMark } from "@/components/Bottle";
import { Shell } from "@/components/Shell";
import { TasteRow } from "@/components/TasteRow";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { cheaperUnconfirmed, getPerfume, isPublicPerfume, publicLead, publishedPerfumes } from "@/lib/catalog";
import { computeDna, shelfBucket } from "@/lib/dna";
import { cn, faNum, millionToman } from "@/lib/format";
import { perfumeHref } from "@/lib/nav";
import { suggestForTaste, wantedNeighbors } from "@/lib/match";
import { useAroma } from "@/lib/store";
import type { Perfume, UserPerfume } from "@/lib/types";

const SAMPLE_SLUGS = ["khamrah", "fakhar", "hayaati"];

const GROUPS = [
  { id: "owned", label: "دارم", dot: "bg-primary" },
  { id: "experienced", label: "تجربه کردم", dot: "bg-primary" },
  { id: "wanted", label: "می‌خوام", dot: "bg-brand" },
  { id: "disliked", label: "نپسندیدم", dot: "bg-destructive" },
] as const;

export default function ShelfPage() {
  const { ready, library } = useAroma();
  const samples = SAMPLE_SLUGS.map((slug) => getPerfume(slug)).filter((item): item is Perfume => isPublicPerfume(item));
  const entries = Object.entries(library)
    .map(([slug, state]) => ({ perfume: getPerfume(slug), state, bucket: shelfBucket(state) }))
    .filter((entry): entry is { perfume: Perfume; state: UserPerfume; bucket: NonNullable<ReturnType<typeof shelfBucket>> } =>
      Boolean(entry.perfume && entry.bucket && isPublicPerfume(entry.perfume)),
    );
  const dna = computeDna(library, getPerfume);
  const forMe = suggestForTaste(library);
  const neighbors = wantedNeighbors(library);
  const hasExperience = dna.validCount > 0;
  const stats = GROUPS.map((group) => ({
    ...group,
    value: entries.filter((entry) => entry.bucket === group.id).length,
  })).filter((stat) => stat.value > 0);

  return (
    <Shell back={{ href: "/", label: "شروع" }}>
      <div className="vf app step-in px-5 pt-6 pb-[max(2.5rem,env(safe-area-inset-bottom))]">
        <h1 className="text-headline font-bold">آرومای من</h1>
        <p className="mt-2 text-pretty text-body text-muted-foreground">سلیقه و مجموعه‌ات روی همین دستگاه.</p>
        <AccountStrip />

        {!ready ? null : entries.length === 0 ? (
          <div className="mt-8">
            <EmptyState
              title="هنوز چیزی ثبت نشده"
              description="داخل صفحهٔ هر عطر بزن «تجربه کردم» یا «می‌خوام» تا سلیقه‌ات اینجا جمع شود."
              action={
                <div className="flex w-full max-w-xs flex-col items-center gap-4">
                  <div className="flex w-full gap-2">
                    {samples.map((perfume) => (
                      <ScentMark key={perfume.slug} perfume={perfume} className="h-24 flex-1 rounded-control" />
                    ))}
                  </div>
                  <Button href="/" className="min-h-11">
                    شروع انتخاب
                  </Button>
                </div>
              }
            />
            <p className="mt-4 text-center text-label text-muted-foreground">
              از بین {faNum(publishedPerfumes().length)} عطر نمونه می‌توانی شروع کنی.
            </p>
          </div>
        ) : (
          <>
            <Card className="mt-6 p-4" aria-label="سلیقه تا اینجا">
              {hasExperience ? (
                <>
                  <h2 className="text-title font-semibold">سلیقه‌ات تا اینجا</h2>
                  <p className="mt-2 text-pretty text-body">{dna.sentence}</p>
                  {dna.stage === "dna" && dna.top.length > 0 ? (
                    <ul className="mt-4 flex flex-col gap-3">
                      {dna.top.map((family) => (
                        <li key={family.id}>
                          <div className="flex items-baseline justify-between gap-3 text-label">
                            <span className="font-medium">{family.label}</span>
                            <span className="tabular-nums text-muted-foreground">{faNum(family.percent)}٪</span>
                          </div>
                          <div
                            className="mt-2 h-2 overflow-hidden rounded-full bg-secondary"
                            role="img"
                            aria-label={`${family.label} ${faNum(family.percent)} درصد`}
                          >
                            <div
                              className="h-full rounded-full"
                              style={{ width: `${Math.max(family.percent, 4)}%`, background: family.color }}
                            />
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </>
              ) : (
                <>
                  <h2 className="text-title font-semibold">هنوز سلیقه‌ات شکل نگرفته</h2>
                  <p className="mt-2 text-pretty text-body">
                    {stats.some((stat) => stat.id === "wanted")
                      ? "از لیست پایین یکی را که بو کردی امتیاز بده تا سلیقه‌ات اینجا دیده شود."
                      : "یک عطر را تجربه کن و امتیاز بده تا سلیقه‌ات اینجا دیده شود."}
                  </p>
                </>
              )}
            </Card>

            {stats.length > 0 ? (
              <ul className="mt-4 flex flex-wrap justify-start gap-2" aria-label="بخش‌های قفسه">
                {stats.map((stat) => (
                  <li key={stat.id}>
                    <a
                      href={`#${stat.id}`}
                      className="inline-flex min-h-11 items-center gap-2 rounded-full border border-input bg-card px-4 text-body font-medium outline-offset-2 focus-visible:outline-2 focus-visible:outline-ring"
                    >
                      <span className={cn("size-2 shrink-0 rounded-full", stat.dot)} aria-hidden="true" />
                      {stat.label}
                      <span className="tabular-nums text-muted-foreground">{faNum(stat.value)}</span>
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}

            {hasExperience ? (
              <Suggest id="for-me" title="پیشنهاد مخصوص من" note="نزدیک سلیقه‌ات، و هنوز تجربه نکردی." items={forMe} />
            ) : null}
            <Suggest id="near-wanted" title="نزدیک به چیزهایی که می‌خوای" note="از روی ویش‌لیست، نه از روی امتیاز." items={neighbors} />

            <div className="mt-8 flex flex-col gap-8">
              {GROUPS.map((group) => {
                const items = entries.filter((entry) => entry.bucket === group.id);
                if (items.length === 0) return null;
                return (
                  <section key={group.id} id={group.id} className="scroll-mt-4" aria-labelledby={`group-${group.id}`}>
                    <h2 id={`group-${group.id}`} className="flex items-center gap-2 text-title font-semibold">
                      <span className={cn("size-2 shrink-0 rounded-full", group.dot)} aria-hidden="true" />
                      {group.label}
                      <span className="text-label font-normal tabular-nums text-muted-foreground">{faNum(items.length)}</span>
                    </h2>
                    <ul className="mt-4 flex flex-col gap-3">
                      {items.map(({ perfume, state }) => (
                        <ShelfItem key={perfume.slug} perfume={perfume} state={state} muted={group.id === "disliked"} />
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

function Suggest({ id, title, note, items }: { id: string; title: string; note: string; items: Perfume[] }) {
  if (items.length === 0) return null;
  return (
    <section className="mt-8" aria-labelledby={id}>
      <h2 id={id} className="text-title font-semibold">
        {title}
      </h2>
      <p className="mt-1 text-label text-muted-foreground">{note}</p>
      <ul className="mt-4 flex flex-col gap-3">
        {items.map((perfume) => {
          const offer = publicLead(perfume);
          const href = perfumeHref(perfume.slug, "/shelf");
          return (
            <li key={perfume.slug}>
              <Card className="p-0">
                <Link
                  href={href}
                  className="flex min-h-16 items-center gap-3 p-3 outline-offset-2 focus-visible:outline-2 focus-visible:outline-ring"
                >
                  <ScentMark perfume={perfume} className="h-14 w-12 shrink-0 rounded-control" />
                  <span className="min-w-0 flex-1 text-start">
                    <span className="block text-title font-semibold">{perfume.nameFa}</span>
                    <span className="mt-1 block text-label text-muted-foreground">
                      {perfume.brand}
                      {offer ? `، ${millionToman(offer.price)}` : ""}
                    </span>
                  </span>
                  <ChevronLeft className="size-4 shrink-0 text-muted-foreground" strokeWidth={1.5} aria-hidden="true" />
                </Link>
              </Card>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function ShelfItem({ perfume, state, muted }: { perfume: Perfume; state: UserPerfume; muted: boolean }) {
  const offer = publicLead(perfume);
  const note = statusNote(state);
  const href = perfumeHref(perfume.slug, "/shelf");
  return (
    <li>
      <Card className="p-0">
        <Link
          href={href}
          className="flex items-start gap-3 p-4 outline-offset-2 focus-visible:outline-2 focus-visible:outline-ring"
        >
          <ScentMark perfume={perfume} className={cn("h-16 w-14 shrink-0 rounded-control", muted && "opacity-55 grayscale")} />
          <span className="min-w-0 flex-1 text-start">
            <span className="block text-title font-semibold">{perfume.nameFa}</span>
            <span className="mt-1 block text-label text-muted-foreground">
              {perfume.brand}
              {offer ? `، ${millionToman(offer.price)}` : ""}
            </span>
            {note ? <span className="mt-1 block text-pretty text-label text-muted-foreground">{note}</span> : null}
            {cheaperUnconfirmed(perfume) ? (
              <span className="mt-1 block text-pretty text-label text-muted-foreground">ارزان‌تر هم هست، موجودی تأیید نشده</span>
            ) : null}
            <span className="mt-2 block max-w-48">
              <AccordMark accords={perfume.accords} />
            </span>
          </span>
          <ChevronLeft className="mt-1 size-4 shrink-0 text-muted-foreground" strokeWidth={1.5} aria-hidden="true" />
        </Link>
        <div className="border-t border-border px-4">
          <TasteRow slug={perfume.slug} name={perfume.nameFa} compact />
        </div>
      </Card>
    </li>
  );
}

function statusNote(state: UserPerfume) {
  if (state.disliked && state.owned) return "داری، ولی نپسندیدی";
  if (state.owned && state.rating == null) return "داری، هنوز امتیاز ندادی";
  return null;
}
