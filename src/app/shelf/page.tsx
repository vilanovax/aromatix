"use client";

import Link from "next/link";
import { AccountStrip } from "@/components/AccountStrip";
import { AccordMark } from "@/components/AccordMark";
import { BrandLink } from "@/components/BrandLink";
import { ScentMark } from "@/components/Bottle";
import { ButtonLink } from "@/components/Button";
import { Card } from "@/components/Card";
import { ForwardIcon } from "@/components/Icons";
import { Shell } from "@/components/Shell";
import { TasteRow } from "@/components/TasteRow";
import { cheaperUnconfirmed, getPerfume, isPublicPerfume, leadOffer, publishedPerfumes } from "@/lib/catalog";
import { computeDna, shelfBucket } from "@/lib/dna";
import { cn, faNum, millionToman } from "@/lib/format";
import { perfumeHref } from "@/lib/nav";
import { suggestForTaste, wantedNeighbors } from "@/lib/match";
import { useAroma } from "@/lib/store";
import type { Perfume, UserPerfume } from "@/lib/types";

const SAMPLE_SLUGS = ["khamrah", "fakhar", "hayaati"];

const GROUPS = [
  { id: "owned", label: "دارم", dot: "bg-ink" },
  { id: "experienced", label: "تجربه کردم", dot: "bg-ink" },
  { id: "wanted", label: "می‌خوام", dot: "bg-taste-try" },
  { id: "disliked", label: "نپسندیدم", dot: "bg-danger" },
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
      <div className="step-in px-5 pt-6 pb-[max(2.5rem,env(safe-area-inset-bottom))]">
        <h1 className="text-headline font-bold">آرومای من</h1>
        <p className="mt-2 max-w-[22rem] text-pretty text-body text-muted">
          سلیقه و مجموعه‌ات روی همین دستگاه.
        </p>
        <AccountStrip />

        {!ready ? null : entries.length === 0 ? (
          <div className="mt-8">
            <Card className="p-5">
              <p className="text-title font-semibold">هنوز چیزی ثبت نشده</p>
              <p className="mt-2 text-pretty text-body text-muted">
                داخل صفحهٔ هر عطر بزن «تجربه کردم» یا «می‌خوام» تا سلیقه‌ات اینجا جمع شود.
              </p>
              <div className="mt-4 flex gap-2">
                {samples.map((perfume) => (
                  <ScentMark key={perfume.slug} perfume={perfume} className="h-24 flex-1 rounded-control" />
                ))}
              </div>
              <ButtonLink href="/" className="mt-5">
                شروع انتخاب
              </ButtonLink>
            </Card>
            <p className="mt-4 text-label text-muted">
              از بین {faNum(publishedPerfumes().length)} عطر نمونه می‌توانی شروع کنی.
            </p>
          </div>
        ) : (
          <>
            <Card as="section" bordered={false} shadow="card" className="mt-6 p-4" aria-label="سلیقه تا اینجا">
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
                            <span className="tabular-nums text-muted">{faNum(family.percent)}٪</span>
                          </div>
                          <div
                            className="mt-1.5 h-2 overflow-hidden rounded-full bg-well"
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

            {stats.length === 1 ? (
              <p className="mt-4 text-body text-muted">
                <a
                  href={`#${stats[0].id}`}
                  className="font-semibold text-ink underline-offset-4 outline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-ink"
                >
                  {faNum(stats[0].value)} عطر در {stats[0].label}
                </a>
              </p>
            ) : stats.length > 1 ? (
              <div className="mt-4 grid grid-cols-2 gap-2.5">
                {stats.map((stat) => (
                  <Stat key={stat.id} href={`#${stat.id}`} value={stat.value} label={stat.label} />
                ))}
              </div>
            ) : null}

            {hasExperience ? (
              <Suggest id="for-me" title="پیشنهاد مخصوص من" note="نزدیک سلیقه‌ات، و هنوز تجربه نکردی." items={forMe} />
            ) : null}
            <Suggest id="near-wanted" title="نزدیک به چیزهایی که می‌خوای" note="از روی ویش‌لیست، نه از روی امتیاز." items={neighbors} />

            <div className="mt-9 flex flex-col gap-9">
              {GROUPS.map((group) => {
                const items = entries.filter((entry) => entry.bucket === group.id);
                if (items.length === 0) return null;
                return (
                  <section key={group.id} id={group.id} className="scroll-mt-4" aria-labelledby={`group-${group.id}`}>
                    <h2 id={`group-${group.id}`} className="flex items-center gap-2 text-title font-semibold">
                      <span className={cn("size-2 shrink-0 rounded-full", group.dot)} aria-hidden="true" />
                      {group.label}
                      <span className="text-label font-normal tabular-nums text-muted">{faNum(items.length)}</span>
                    </h2>
                    <ul className="mt-3.5 flex flex-col gap-2.5">
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
  return (
    <a
      href={href}
      className="pressable quiet flex min-h-[4.5rem] flex-col items-center justify-center rounded-panel border border-line bg-card px-2 py-3 text-center outline-offset-2 focus-visible:outline-2 focus-visible:outline-ink"
    >
      <span className="block text-headline font-bold tabular-nums">{faNum(value)}</span>
      <span className="mt-0.5 block text-label text-muted">{label}</span>
    </a>
  );
}

function Suggest({ id, title, note, items }: { id: string; title: string; note: string; items: Perfume[] }) {
  if (items.length === 0) return null;
  return (
    <section className="mt-8" aria-labelledby={id}>
      <h2 id={id} className="text-title font-semibold">
        {title}
      </h2>
      <p className="mt-1 text-label text-muted">{note}</p>
      <ul className="mt-3.5 flex flex-col gap-2">
        {items.map((perfume) => {
          const offer = leadOffer(perfume);
          const href = perfumeHref(perfume.slug, "/shelf");
          return (
            <li key={perfume.slug}>
              <div className="flex min-h-16 items-center gap-3 rounded-panel border border-line bg-card p-3 pe-3">
                <Link href={href} className="shrink-0 rounded-control outline-offset-2 focus-visible:outline-2 focus-visible:outline-ink">
                  <ScentMark perfume={perfume} className="h-14 w-11 rounded-control" />
                </Link>
                <span className="min-w-0 flex-1 text-start">
                  <Link
                    href={href}
                    className="block text-title font-semibold outline-offset-2 focus-visible:outline-2 focus-visible:outline-ink"
                  >
                    {perfume.nameFa}
                  </Link>
                  <span className="mt-0.5 block text-label text-muted">
                    <BrandLink name={perfume.brand} from={perfume.slug} />
                    {offer ? `، ${millionToman(offer.price)}` : ""}
                  </span>
                </span>
                <Link
                  href={href}
                  aria-label={`باز کردن ${perfume.nameFa}`}
                  className="shrink-0 rounded-control p-1 text-muted outline-offset-2 focus-visible:outline-2 focus-visible:outline-ink"
                >
                  <ForwardIcon className="size-5" />
                </Link>
              </div>
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
    <Card as="li" className="p-3.5">
      <div className="flex items-start gap-3">
        <Link
          href={perfumeHref(perfume.slug, "/shelf")}
          className="shrink-0 rounded-control outline-offset-2 focus-visible:outline-2 focus-visible:outline-ink"
        >
          <ScentMark perfume={perfume} className={cn("h-20 w-16 rounded-control", muted && "opacity-55 grayscale")} />
        </Link>
        <span className="min-w-0 flex-1">
          <Link
            href={perfumeHref(perfume.slug, "/shelf")}
            className="block text-title font-semibold outline-offset-2 focus-visible:outline-2 focus-visible:outline-ink"
          >
            {perfume.nameFa}
          </Link>
          <span className="mt-0.5 block text-label text-muted">
            <BrandLink name={perfume.brand} from={perfume.slug} />
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
        <Link
          href={perfumeHref(perfume.slug, "/shelf")}
          aria-label={`باز کردن ${perfume.nameFa}`}
          className="shrink-0 rounded-control p-1 text-muted outline-offset-2 focus-visible:outline-2 focus-visible:outline-ink"
        >
          <ForwardIcon className="size-5" />
        </Link>
      </div>
      <div className="mt-3.5">
        <TasteRow slug={perfume.slug} name={perfume.nameFa} compact />
      </div>
    </Card>
  );
}

function statusNote(state: UserPerfume) {
  if (state.disliked && state.owned) return "داری، ولی نپسندیدی";
  if (state.owned && state.rating == null) return "داری، هنوز امتیاز ندادی";
  return null;
}
