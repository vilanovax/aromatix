"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { AccordMark } from "@/components/AccordMark";
import { PerfumePhoto } from "@/components/Bottle";
import { Button, ButtonLink } from "@/components/Button";
import { Card, Note } from "@/components/Card";
import { Chip, MetaChip } from "@/components/Chip";
import { TermChip, TermText } from "@/components/TermSheet";
import { CheckIcon, ForwardIcon } from "@/components/Icons";
import { Shell } from "@/components/Shell";
import { TasteRow } from "@/components/TasteRow";
import { BrandLink } from "@/components/BrandLink";
import { cheaperUnconfirmed, getPerfume, isPublicPerfume, leadOffer, performanceLabel, sharedAccordNames } from "@/lib/catalog";
import { entryForConcentration, entryForNote } from "@/lib/knowledge";
import { cn, faNum, joinFa, millionToman } from "@/lib/format";
import { perfumeHref, resolvePerfumeBack } from "@/lib/nav";
import { useAroma } from "@/lib/store";
import type { Perfume } from "@/lib/types";

const LAYERS = [
  { id: "top", label: "شروع" },
  { id: "middle", label: "میانه" },
  { id: "base", label: "پایه" },
] as const;

export default function PerfumePage() {
  return (
    <Suspense>
      <PerfumeScreen />
    </Suspense>
  );
}

function PerfumeScreen() {
  const params = useParams<{ slug: string }>();
  const search = useSearchParams();
  const found = getPerfume(params.slug);
  const perfume = isPublicPerfume(found) ? found : undefined;
  const { openShops, compare, toggleCompare } = useAroma();
  const back = resolvePerfumeBack(search.get("from"));

  if (!perfume) {
    return (
      <Shell back={back}>
        <div className="px-5 py-10">
          <h1 className="text-headline font-bold">این عطر در نمونه نیست.</h1>
          <p className="mt-2 max-w-[22rem] text-pretty text-body text-muted">
            از پیشنهادها یکی را باز کن یا دوباره جستجو کن.
          </p>
          <ButtonLink href={back.href} className="mt-5">
            برگشت به {back.label}
          </ButtonLink>
        </div>
      </Shell>
    );
  }

  const offer = leadOffer(perfume);
  const cheaper = cheaperUnconfirmed(perfume);
  const similars = perfume.similar
    .map((slug) => getPerfume(slug))
    .filter((item) => isPublicPerfume(item))
    .slice(0, 3);
  const season = perfume.seasons.includes("all") ? null : perfume.seasons.map(seasonName).join("، ");
  const showFacts = Boolean(season || perfume.longevity || perfume.sillage || perfume.inspiredBy);
  const picked = compare.includes(perfume.slug);
  const concentrationEntry = entryForConcentration(perfume.concentration);
  const similarFrom = `/perfume/${perfume.slug}`;

  return (
    <Shell composer back={back}>
      <article className="step-in px-5 pt-4 pb-[max(2.5rem,env(safe-area-inset-bottom))]">
        <figure className="overflow-hidden rounded-sheet bg-well">
          <PerfumePhoto
            perfume={perfume}
            sizes="hero"
            alt={`شیشهٔ ${perfume.nameFa}`}
            className="flex h-52 w-full items-center justify-center sm:h-60"
            imgClassName="max-h-[92%] py-3"
          />
        </figure>

        <header className="mt-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-balance text-display font-bold">{perfume.nameFa}</h1>
              <p className="mt-1 text-pretty text-body text-muted">
                <BrandLink name={perfume.brand} from={perfume.slug} />
                <span className="mx-1.5 text-faint">،</span>
                <span dir="ltr" className="inline-block">
                  {perfume.nameEn}
                </span>
              </p>
            </div>
            <Chip
              selected={picked}
              onClick={() => toggleCompare(perfume.slug)}
              aria-label={picked ? `حذف ${perfume.nameFa} از مقایسه` : `افزودن ${perfume.nameFa} به مقایسه`}
              className="mt-0.5 gap-1 shrink-0"
            >
              {picked ? <CheckIcon className="size-3.5" /> : null}
              مقایسه
            </Chip>
          </div>

          <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="مشخصات شیشه">
            <li>
              {concentrationEntry ? (
                <TermChip slug={concentrationEntry.slug}>{perfume.concentration}</TermChip>
              ) : (
                <MetaChip>{perfume.concentration}</MetaChip>
              )}
            </li>
            <li>
              <MetaChip>{faNum(perfume.volumeMl)} میلی‌لیتر</MetaChip>
            </li>
            {perfume.marketGender !== "مشترک" ? (
              <li className="self-center text-label text-muted">{perfume.marketGender}</li>
            ) : null}
          </ul>
        </header>

        <div className="mt-5">
          <AccordMark accords={perfume.accords} names />
        </div>

        <Note tone="paper" className="mt-5 rounded-panel px-4 py-3.5 text-pretty">
          {perfume.why}
        </Note>

        <Button
          size="xl"
          onClick={() => openShops(perfume.slug)}
          className="mt-5 w-full justify-between gap-3 px-4 text-start"
        >
          <span className="min-w-0">
            <span className="block text-body font-semibold">
              {offer ? `از ${millionToman(offer.price)}` : "فروشگاه‌ها"}
            </span>
            {offer ? (
              <span className="mt-1 flex items-center gap-1.5 text-label leading-5 text-paper/80">
                <span
                  aria-hidden="true"
                  className={cn(
                    "size-1.5 shrink-0 rounded-full",
                    offer.stockConfirmed ? "bg-stock-ok-on-ink" : "bg-stock-pending-on-ink",
                  )}
                />
                <span className="min-w-0 text-pretty">
                  {offer.shop}
                  {offer.stockConfirmed ? `، موجود، بررسی ${offer.checkedOn}` : `، موجودی تأیید نشده`}
                </span>
              </span>
            ) : null}
          </span>
          <span className="inline-flex shrink-0 items-center gap-0.5 text-label font-medium">
            فروشگاه‌ها
            <ForwardIcon className="size-4" />
          </span>
        </Button>
        {cheaper ? (
          <p className="mt-2 text-pretty text-label text-muted">
            در {cheaper.shop} {millionToman(cheaper.price)}، موجودی تأیید نشده
          </p>
        ) : null}

        <section className="mt-8" aria-labelledby="taste-title">
          <h2 id="taste-title" className="text-title font-semibold">
            این عطر چطوره؟
          </h2>
          <p className="mt-1 text-pretty text-label text-muted">
            برای آرومای من و پیشنهاد بعدی نگه می‌داریم.
          </p>
          <div className="mt-3 rounded-panel bg-paper p-1.5">
            <TasteRow slug={perfume.slug} name={perfume.nameFa} />
          </div>
        </section>

        {showFacts ? (
          <Card as="dl" className="mt-8 divide-y divide-line px-4">
            {season ? <Fact label="فصل" value={season} /> : null}
            {perfume.longevity ? (
              <Fact
                label="ماندگاری"
                term="longevity-sillage"
                value={performanceLabel("longevity", perfume.longevity)}
              />
            ) : null}
            {perfume.sillage ? (
              <Fact
                label="پخش بو"
                term="longevity-sillage"
                value={performanceLabel("sillage", perfume.sillage)}
              />
            ) : null}
            {perfume.inspiredBy ? <Fact label="نزدیک به" value={inspiredName(perfume.inspiredBy)} /> : null}
          </Card>
        ) : null}
        {perfume.inspiredBy ? (
          <p className="mt-2 text-pretty text-label text-muted">
            شباهت بر اساس نوت‌های ثبت‌شده در آروماست، نه محصول برند اصلی.
          </p>
        ) : null}

        {perfume.notes.length > 0 ? (
          <details className="group mt-8">
            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 rounded-control text-title font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink [&::-webkit-details-marker]:hidden">
              هرم بو
              <span className="text-label font-normal text-muted group-open:hidden">نمایش</span>
              <span className="hidden text-label font-normal text-muted group-open:inline">بستن</span>
            </summary>
            <dl className="mt-3 space-y-3">
              {LAYERS.map((layer) => {
                const notes = perfume.notes.filter((note) => note.layer === layer.id);
                if (notes.length === 0) return null;
                return (
                  <div key={layer.id} className="flex gap-3 text-body">
                    <dt className="w-12 shrink-0 pt-0.5 text-label text-muted">{layer.label}</dt>
                    <dd className="min-w-0 text-pretty">
                      {notes.map((note, index) => {
                        const lesson = entryForNote(note.name);
                        return (
                          <span key={note.name}>
                            {index > 0 ? "، " : null}
                            {lesson ? <TermText slug={lesson.slug}>{note.name}</TermText> : note.name}
                          </span>
                        );
                      })}
                    </dd>
                  </div>
                );
              })}
            </dl>
          </details>
        ) : null}

        {similars.length > 0 ? (
          <section className="mt-8" aria-labelledby="similar-title">
            <h2 id="similar-title" className="text-title font-semibold">
              مشابه‌ها
            </h2>
            <ul className="mt-3 flex flex-col gap-2.5">
              {similars.map((item) => (
                <li key={item.slug}>
                  <div className="flex min-h-16 items-center gap-3 rounded-panel border border-line bg-card p-2.5 pe-3">
                    <Link
                      href={perfumeHref(item.slug, similarFrom)}
                      className="pressable quiet shrink-0 rounded-control outline-offset-2 focus-visible:outline-2 focus-visible:outline-ink"
                    >
                      <PerfumePhoto
                        perfume={item}
                        sizes="thumb"
                        alt=""
                        className="h-14 w-12 rounded-control"
                      />
                    </Link>
                    <span className="min-w-0 flex-1 text-start">
                      <Link
                        href={perfumeHref(item.slug, similarFrom)}
                        className="block text-body font-semibold outline-offset-2 focus-visible:outline-2 focus-visible:outline-ink"
                      >
                        {item.nameFa}
                      </Link>
                      <span className="mt-0.5 block text-pretty text-label text-muted">
                        <BrandLink name={item.brand} from={item.slug} />
                        <span className="mx-1 text-faint">،</span>
                        {likeness(perfume, item)}
                      </span>
                      <span className="mt-2 block max-w-52">
                        <AccordMark accords={item.accords} />
                      </span>
                    </span>
                    <Link
                      href={perfumeHref(item.slug, similarFrom)}
                      aria-label={`باز کردن ${item.nameFa}`}
                      className="pressable quiet shrink-0 rounded-control p-1 text-muted outline-offset-2 focus-visible:outline-2 focus-visible:outline-ink"
                    >
                      <ForwardIcon className="size-5" />
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </article>
    </Shell>
  );
}

function Fact({ label, value, term }: { label: string; value: string; term?: string }) {
  return (
    <div className="flex gap-3 py-3.5 text-body">
      <dt className="w-20 shrink-0 text-label text-muted">
        {term ? <TermText slug={term} className="text-label text-muted">{label}</TermText> : label}
      </dt>
      <dd className="min-w-0 text-pretty">{value}</dd>
    </div>
  );
}

function seasonName(id: string) {
  if (id === "summer") return "تابستان";
  if (id === "winter") return "زمستان";
  if (id === "mild") return "معتدل";
  return "همهٔ فصل‌ها";
}

function likeness(current: Perfume, other: Perfume) {
  const accords = sharedAccordNames(current, other);
  if (accords.length > 0) return `هر دو ${joinFa(accords)} دارند`;
  const notes = new Set(other.notes.map((note) => note.name));
  const shared = [...new Set(current.notes.map((note) => note.name).filter((name) => notes.has(name)))];
  if (shared.length > 0) return `نوت مشترک: ${joinFa(shared)}`;
  return "در همین خانواده آمده";
}

function inspiredName(id: string) {
  if (id === "sauvage") return "ساواج الکسیر";
  if (id === "aventus") return "اونتوس";
  if (id === "angels") return "آنجلز شیر";
  return id;
}
