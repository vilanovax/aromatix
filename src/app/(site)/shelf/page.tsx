"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDown, ChevronLeft } from "lucide-react";
import { AccountStrip } from "@/components/AccountStrip";
import { AccordMark } from "@/components/AccordMark";
import { PerfumePhoto, ScentMark } from "@/components/Bottle";
import { Shell } from "@/components/Shell";
import { TasteRow } from "@/components/TasteRow";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { cheaperUnconfirmed, getPerfume, isPublicPerfume, publicLead, publishedPerfumes } from "@/lib/catalog";
import { computeDna, shelfBucket, type DnaProfile } from "@/lib/dna";
import { cn, faNum, joinFa, millionToman } from "@/lib/format";
import { perfumeHref } from "@/lib/nav";
import { noteHref } from "@/lib/notes";
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
        {ready ? (
          <div className="mt-4 flex flex-col gap-2">
            <Button href="/layer" variant="outline" className="min-h-11 w-full bg-card!">
              دو عطر را روی هم بزن
            </Button>
            <Button href="/couple" variant="outline" className="min-h-11 w-full bg-card!">
              ست دونفره
            </Button>
          </div>
        ) : null}

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
            <TasteCard dna={dna} wanted={stats.some((stat) => stat.id === "wanted")} />

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

function TasteCard({ dna, wanted }: { dna: DnaProfile; wanted: boolean }) {
  const [open, setOpen] = useState(false);
  const chart = (dna.stage === "early" || dna.stage === "dna") && dna.top.length > 0;
  const total = dna.top.reduce((sum, family) => sum + family.percent, 0) || 1;

  return (
    <Card className="mt-6 p-4" aria-label="سلیقه تا اینجا">
      {dna.validCount === 0 ? (
        <>
          <h2 className="text-title font-semibold">هنوز سلیقه‌ات شکل نگرفته</h2>
          <p className="mt-2 text-pretty text-body">
            {wanted
              ? "از لیست پایین یکی را که بو کردی امتیاز بده تا سلیقه‌ات اینجا دیده شود."
              : "یک عطر را تجربه کن و امتیاز بده تا سلیقه‌ات اینجا دیده شود."}
          </p>
        </>
      ) : (
        <>
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-title font-semibold">سلیقه‌ات تا اینجا</h2>
            {dna.stage === "early" && chart ? (
              <span className="shrink-0 text-label text-muted-foreground">برداشت اولیه</span>
            ) : null}
          </div>
          <p className="mt-2 text-pretty text-body">{dna.sentence}</p>
          {chart ? (
            <>
              <div
                className="mt-4 flex h-2 overflow-hidden rounded-full bg-secondary"
                role="img"
                aria-label={dna.top.map((family) => `${family.label} ${faNum(family.percent)} درصد`).join("، ")}
              >
                {dna.top.map((family) => (
                  <div
                    key={family.id}
                    className="h-full"
                    style={{ width: `${(family.percent / total) * 100}%`, background: family.color }}
                  />
                ))}
              </div>
              {dna.notes.length > 0 ? (
                <ul className="mt-3 flex flex-wrap gap-2" aria-label="نت‌های محبوب">
                  {dna.notes.map((note) => (
                    <li key={note.name}>
                      <Link
                        href={noteHref(note.name, "/shelf")}
                        className="inline-flex min-h-11 items-center gap-2 rounded-full bg-secondary px-3 text-label outline-offset-2 focus-visible:outline-2 focus-visible:outline-ring"
                      >
                        <span className="size-2 shrink-0 rounded-full" style={{ background: note.color }} aria-hidden="true" />
                        {note.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : null}
              <button
                type="button"
                aria-expanded={open}
                onClick={() => setOpen((value) => !value)}
                className="mt-4 flex min-h-11 w-full items-center justify-between gap-3 rounded-full border border-input bg-card px-4 text-body font-medium outline-offset-2 focus-visible:outline-2 focus-visible:outline-ring"
              >
                {open ? "بستن جزئیات" : "جزئیات سلیقه"}
                <ChevronDown
                  className={cn(
                    "size-4 shrink-0 transition-transform duration-(--motion) ease-motion motion-reduce:transition-none",
                    open && "rotate-180",
                  )}
                  strokeWidth={2}
                  aria-hidden="true"
                />
              </button>
              {open ? (
                <div className="mt-4">
                  <ul className="flex flex-col gap-3">
                    {dna.top.map((family) => (
                      <ReadingBar
                        key={family.id}
                        label={family.label}
                        percent={family.percent}
                        color={family.color}
                        from={family.from}
                      />
                    ))}
                  </ul>
                  {dna.notes.length > 0 ? (
                    <>
                      <h3 className="mt-5 text-body font-semibold">نت‌هایی که بیشتر می‌پسندی</h3>
                      <ul className="mt-3 flex flex-col gap-3">
                        {dna.notes.map((note) => (
                          <ReadingBar
                            key={note.name}
                            label={note.name}
                            percent={note.percent}
                            color={note.color}
                            from={note.from}
                            href={noteHref(note.name, "/shelf")}
                          />
                        ))}
                      </ul>
                    </>
                  ) : null}
                </div>
              ) : null}
            </>
          ) : null}
        </>
      )}
    </Card>
  );
}

function ReadingBar({
  label,
  percent,
  color,
  from,
  href,
}: {
  label: string;
  percent: number;
  color: string;
  from: string[];
  href?: string;
}) {
  const name = href ? (
    <Link
      href={href}
      className="inline-flex min-h-11 items-center gap-1 font-medium outline-offset-2 focus-visible:outline-2 focus-visible:outline-ring"
    >
      {label}
      <ChevronLeft className="size-4 text-muted-foreground" strokeWidth={1.5} aria-hidden="true" />
    </Link>
  ) : (
    <span className="font-medium">{label}</span>
  );

  return (
    <li>
      <div className="flex items-center justify-between gap-3 text-label">
        {name}
        <span className="tabular-nums text-muted-foreground">{faNum(percent)}٪</span>
      </div>
      <div
        className="mt-2 h-2 overflow-hidden rounded-full bg-secondary"
        role="img"
        aria-label={`${label} ${faNum(percent)} درصد`}
      >
        <div className="h-full rounded-full" style={{ width: `${Math.max(percent, 4)}%`, background: color }} />
      </div>
      {from.length > 0 ? <p className="mt-1 text-label text-muted-foreground">از {joinFa(from)}</p> : null}
    </li>
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
                  <PerfumePhoto perfume={perfume} sizes="thumb" alt="" className="h-14 w-12 shrink-0 rounded-control" />
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
          <PerfumePhoto
            perfume={perfume}
            sizes="thumb"
            alt=""
            className={cn("h-16 w-12 shrink-0 rounded-control", muted && "opacity-55 grayscale")}
          />
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
