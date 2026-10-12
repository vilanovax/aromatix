"use client";

import Link from "next/link";
import { AccordMark } from "@/components/AccordMark";
import { ScentMark } from "@/components/Bottle";
import { ButtonLink } from "@/components/Button";
import { Card } from "@/components/Card";
import { ForwardIcon } from "@/components/Icons";
import { Shell } from "@/components/Shell";
import { TasteRow } from "@/components/TasteRow";
import { cheaperUnconfirmed, getPerfume, leadOffer, perfumes } from "@/lib/catalog";
import { computeDna, shelfBucket } from "@/lib/dna";
import { cn, faNum, millionToman } from "@/lib/format";
import { suggestForTaste, wantedNeighbors } from "@/lib/match";
import { useAroma } from "@/lib/store";
import type { Perfume, UserPerfume } from "@/lib/types";

const SAMPLES = ["khamrah", "fakhar", "hayaati"]
  .map((slug) => getPerfume(slug))
  .filter((item): item is Perfume => Boolean(item));

const GROUPS = [
  { id: "owned", label: "دارم", dot: "bg-ink" },
  { id: "experienced", label: "تجربه کردم", dot: "bg-ink" },
  { id: "wanted", label: "می‌خوام", dot: "bg-taste-try" },
  { id: "disliked", label: "نپسندیدم", dot: "bg-danger" },
] as const;

export default function ShelfPage() {
  const { ready, library } = useAroma();
  const entries = Object.entries(library)
    .map(([slug, state]) => ({ perfume: getPerfume(slug), state, bucket: shelfBucket(state) }))
    .filter((entry): entry is { perfume: Perfume; state: UserPerfume; bucket: NonNullable<ReturnType<typeof shelfBucket>> } =>
      Boolean(entry.perfume && entry.bucket),
    );
  const dna = computeDna(library, getPerfume);
  const forMe = suggestForTaste(library);
  const neighbors = wantedNeighbors(library);
  const counts = {
    owned: entries.filter((entry) => entry.bucket === "owned").length,
    experienced: entries.filter((entry) => entry.bucket === "experienced").length,
    wanted: entries.filter((entry) => entry.bucket === "wanted").length,
    disliked: entries.filter((entry) => entry.bucket === "disliked").length,
  };

  return (
    <Shell composer back={{ href: "/results", label: "پیشنهادها" }}>
      <div className="px-5 pt-6 pb-10">
        <h1 className="text-headline font-bold">آرومای من</h1>
        <p className="mt-1.5 text-body text-muted">
          روی همین دستگاه می‌ماند و پیشنهاد بعدی را به سلیقه‌ات نزدیک‌تر می‌کند.
        </p>

        {!ready ? null : entries.length === 0 ? (
          <div className="mt-8">
            <Card className="p-5">
              <p className="text-body font-semibold">هنوز چیزی ثبت نشده</p>
              <p className="mt-1.5 text-body text-muted">
                داخل صفحهٔ هر عطر بزن «تجربه کردم» یا «می‌خوام» تا سلیقه‌ات اینجا جمع شود.
              </p>
              <div className="mt-4 flex gap-2">
                {SAMPLES.map((perfume) => (
                  <ScentMark key={perfume.slug} perfume={perfume} className="h-24 flex-1 rounded-control" />
                ))}
              </div>
              <ButtonLink href="/" className="mt-5">
                شروع انتخاب
              </ButtonLink>
            </Card>
            <p className="mt-4 text-label text-muted">از بین {faNum(perfumes.length)} عطر نمونه می‌توانی شروع کنی.</p>
          </div>
        ) : (
          <>
            <Card as="section" bordered={false} shadow="card" className="mt-6 p-4" aria-label="سلیقه تا اینجا">
              <h2 className="text-label font-semibold">سلیقه‌ات تا اینجا</h2>
              <p className="mt-2 text-body text-pretty">{dna.sentence}</p>
              {dna.stage === "dna" && dna.top.length > 0 ? (
                <ul className="mt-4 flex flex-col gap-3">
                  {dna.top.map((family) => (
                    <li key={family.id}>
                      <div className="flex items-baseline justify-between gap-3 text-label">
                        <span className="font-medium">{family.label}</span>
                        <span className="text-muted">{faNum(family.percent)}٪</span>
                      </div>
                      <div className="mt-1.5 h-2 rounded-full bg-well" role="img" aria-label={`${family.label} ${faNum(family.percent)} درصد`}>
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${Math.max(family.percent, 4)}%`, background: family.color }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              ) : null}
            </Card>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <Stat href="#owned" value={counts.owned} label="دارم" />
              <Stat href="#experienced" value={counts.experienced} label="تجربه کردم" />
              <Stat href="#wanted" value={counts.wanted} label="می‌خوام" />
              <Stat href="#disliked" value={counts.disliked} label="نپسندیدم" />
            </div>

            <Suggest id="for-me" title="پیشنهاد مخصوص من" note="نزدیک سلیقه‌ات، و هنوز تجربه نکردی." items={forMe} />
            <Suggest id="near-wanted" title="نزدیک به چیزهایی که می‌خوای" note="از روی ویش‌لیست، نه از روی امتیاز." items={neighbors} />

            <div className="mt-8 flex flex-col gap-8">
              {GROUPS.map((group) => {
                const items = entries.filter((entry) => entry.bucket === group.id);
                if (items.length === 0) return null;
                return (
                  <section key={group.id} id={group.id} className="scroll-mt-4" aria-labelledby={`group-${group.id}`}>
                    <h2 id={`group-${group.id}`} className="flex items-center gap-2 text-body font-semibold">
                      <span className={cn("size-2 rounded-full", group.dot)} aria-hidden="true" />
                      {group.label}
                      <span className="text-label font-normal text-muted">{faNum(items.length)}</span>
                    </h2>
                    <ul className="mt-3 flex flex-col gap-3">
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

function Stat({ href, value, label }: { href: string; value: number; label: string }) {
  const className = "rounded-panel border border-line bg-card px-2 py-3 text-center";
  const inner = (
    <>
      <span className="block text-headline font-bold">{faNum(value)}</span>
      <span className="mt-0.5 block text-label text-muted">{label}</span>
    </>
  );
  if (value === 0) return <div className={className}>{inner}</div>;
  return (
    <a href={href} className={cn(className, "pressable")}>
      {inner}
    </a>
  );
}

function Suggest({ id, title, note, items }: { id: string; title: string; note: string; items: Perfume[] }) {
  if (items.length === 0) return null;
  return (
    <section className="mt-8" aria-labelledby={id}>
      <h2 id={id} className="text-body font-semibold">
        {title}
      </h2>
      <p className="mt-1 text-label text-muted">{note}</p>
      <ul className="mt-3 flex flex-col gap-2">
        {items.map((perfume) => {
          const offer = leadOffer(perfume);
          return (
            <li key={perfume.slug}>
              <Card className="p-3">
                <Link href={`/perfume/${perfume.slug}`} className="flex items-center gap-3 rounded-control">
                  <ScentMark perfume={perfume} className="h-16 w-14 shrink-0 rounded-control" />
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold">{perfume.nameFa}</span>
                    <span className="mt-0.5 block text-label text-muted">
                      {perfume.brand}
                      {offer ? `، ${millionToman(offer.price)}` : ""}
                    </span>
                  </span>
                  <ForwardIcon className="size-5 shrink-0 text-muted" />
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
  const offer = leadOffer(perfume);
  const note = statusNote(state);
  return (
    <Card as="li" className="p-3">
      <Link href={`/perfume/${perfume.slug}`} className="group flex items-center gap-3 rounded-control">
        <ScentMark perfume={perfume} className={cn("h-20 w-16 shrink-0 rounded-control", muted && "opacity-55 grayscale")} />
        <span className="min-w-0 flex-1">
          <span className="block font-semibold">{perfume.nameFa}</span>
          <span className="mt-0.5 block text-label text-muted">
            {perfume.brand}
            {offer ? `، ${millionToman(offer.price)}` : ""}
          </span>
          {note ? <span className="mt-0.5 block text-label text-muted">{note}</span> : null}
          {cheaperUnconfirmed(perfume) ? (
            <span className="mt-0.5 block text-label text-muted">ارزان‌تر هم هست، موجودی تأیید نشده</span>
          ) : null}
          <span className="mt-2.5 block max-w-48">
            <AccordMark accords={perfume.accords} />
          </span>
        </span>
        <ForwardIcon className="size-5 shrink-0 text-muted" />
      </Link>
      <div className="mt-3">
        <TasteRow slug={perfume.slug} name={perfume.nameFa} />
      </div>
    </Card>
  );
}

function statusNote(state: UserPerfume) {
  if (state.disliked && state.owned) return "داری، ولی نپسندیدی";
  if (state.rating != null && state.owned) return `داری · ${faNum(state.rating)} از ۱۰`;
  if (state.owned) return "داری، هنوز امتیاز ندادی";
  if (state.rating != null) return `${faNum(state.rating)} از ۱۰`;
  return null;
}
