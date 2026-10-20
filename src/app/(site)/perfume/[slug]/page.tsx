"use client";

import { Suspense, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Check, ChevronLeft, SearchX } from "lucide-react";
import { AccordMark } from "@/components/AccordMark";
import { AlternativeGroups } from "@/components/AlternativeGroups";
import { PerfumePhoto } from "@/components/Bottle";
import { ForYou } from "@/components/ForYou";
import { NoteStack } from "@/components/NoteStack";
import { TermChip } from "@/components/TermSheet";
import { Shell } from "@/components/Shell";
import { ReportPerfume, ReportPerfumeButton, ReportPerfumePanel } from "@/components/ReportPerfume";
import { TasteRow } from "@/components/TasteRow";
import { BrandLink } from "@/components/BrandLink";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import {
  cheaperUnconfirmed,
  getPerfume,
  guidePrice,
  isPublicPerfume,
  performanceLabel,
  publicLead,
  seasonShort,
} from "@/lib/catalog";
import { offerAvailability, offerStockLine } from "@/lib/offer-stock";
import { entryForConcentration } from "@/lib/knowledge";
import { fragranticaHref } from "@/lib/fragrantica";
import { cn, faNum, millionToman } from "@/lib/format";
import { referenceHref, resolvePerfumeBack } from "@/lib/nav";
import { contextFit, faceFromPerfume } from "@/lib/personal-fit";
import { rememberVisit } from "@/lib/recent";
import { echoesFor, type ReferenceProfile } from "@/lib/references";
import { wearHref } from "@/lib/wear";
import { useAroma } from "@/lib/store";
import type { Season } from "@/lib/types";

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
        <EmptyState
          className="vf app mx-5 my-10"
          icon={SearchX}
          title="این عطر در نمونه نیست"
          description="از پیشنهادها یکی را باز کن یا دوباره جستجو کن."
          action={
            <Button href={back.href} className="min-h-11">
              برگشت به {back.label}
            </Button>
          }
        />
      </Shell>
    );
  }

  const offer = publicLead(perfume);
  const guide = guidePrice(perfume);
  const cheaper = cheaperUnconfirmed(perfume);
  const season = perfume.seasons.includes("all") ? null : perfume.seasons.map((id) => seasonShort(id)).join("، ");
  const showFacts = Boolean(season || perfume.longevity || perfume.sillage);
  const echoes = echoesFor(perfume);
  const picked = compare.includes(perfume.slug);
  const concentrationEntry = entryForConcentration(perfume.concentration);
  const askedSeason = askedSeasonOf(search.get("season"));
  const face = faceFromPerfume(perfume);
  const context = contextFit(face, { occasion: search.get("occasion"), season: askedSeason });

  useEffect(() => {
    rememberVisit({ href: `/perfume/${perfume.slug}`, label: perfume.nameFa });
  }, [perfume.slug, perfume.nameFa]);

  useEffect(() => {
    if (search.get("focus") !== "similar") return;
    document.getElementById("similar")?.scrollIntoView({ block: "start" });
  }, [search]);

  return (
    <Shell composer back={back}>
      <ReportPerfume slug={perfume.slug} name={perfume.nameFa}>
      <article className="vf app step-in px-5 pt-4 pb-[max(2.5rem,env(safe-area-inset-bottom))]">
        <figure className="overflow-hidden rounded-surface bg-secondary">
          <PerfumePhoto
            perfume={perfume}
            sizes="hero"
            zoomable
            alt={`شیشهٔ ${perfume.nameFa}`}
            className="flex h-56 w-full items-center justify-center overflow-hidden sm:h-64"
          />
        </figure>

        <header className="mt-5">
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <h1 className="text-balance text-display font-bold">{perfume.nameFa}</h1>
              <p className="mt-1 text-body text-muted-foreground">
                <BrandLink name={perfume.brand} from={perfume.slug} />
              </p>
              <p className="mt-1 text-label text-muted-foreground">
                <bdi dir="ltr">{perfume.nameEn}</bdi>
              </p>
            </div>
            <div className="mt-1 flex shrink-0 items-center gap-2">
              <FragranticaLink name={perfume.nameFa} href={fragranticaHref(perfume.sourceUrl)} />
              <ReportPerfumeButton />
              <Button
                variant={picked ? "default" : "outline"}
                size="sm"
                aria-pressed={picked}
                aria-label={picked ? `حذف ${perfume.nameFa} از مقایسه` : `افزودن ${perfume.nameFa} به مقایسه`}
                onClick={() => toggleCompare(perfume.slug)}
                className={cn("min-h-11 shrink-0 rounded-full! px-3 font-medium", !picked && "bg-card!")}
              >
                {picked ? <Check strokeWidth={2} /> : null}
                مقایسه
              </Button>
            </div>
          </div>
          <ReportPerfumePanel />

          <ul className="mt-3 flex flex-wrap justify-start gap-2" aria-label="مشخصات شیشه">
            {perfume.concentration ? (
              <li>
                {concentrationEntry ? (
                  <TermChip slug={concentrationEntry.slug}>{perfume.concentration}</TermChip>
                ) : (
                  <Badge className="rounded-full bg-secondary px-3">{perfume.concentration}</Badge>
                )}
              </li>
            ) : null}
            {perfume.volumeMl != null ? (
              <li>
                <Badge className="rounded-full bg-secondary px-3">{faNum(perfume.volumeMl)} میلی‌لیتر</Badge>
              </li>
            ) : null}
            {perfume.marketGender !== "مشترک" ? (
              <li>
                <Badge variant="secondary">{perfume.marketGender}</Badge>
              </li>
            ) : null}
          </ul>
        </header>

        <div className="mt-5">
          <AccordMark accords={perfume.accords} names />
        </div>

        <p className="mt-5 text-pretty text-body">{perfume.why}</p>

        {echoes.length > 0 ? <Echoes items={echoes} from={`/perfume/${perfume.slug}`} /> : null}

        <Button
          size="lg"
          onClick={() => openShops(perfume.slug)}
          className="mt-5 h-auto! w-full justify-between! gap-3 whitespace-normal! px-4 py-3 text-start"
        >
          <span className="min-w-0">
            <span className="block text-body font-semibold">
              {offer
                ? `از ${millionToman(offer.price)}`
                : guide
                  ? `حدود ${millionToman(guide)}`
                  : "فروشگاه‌ها"}
            </span>
            {offer ? (
              <span className="mt-1 flex items-center gap-2 text-label font-normal leading-5 text-primary-foreground/80">
                <span
                  aria-hidden="true"
                  className={cn(
                    "size-2 shrink-0 rounded-full",
                    offerAvailability(offer) === "in_stock" && "bg-stock-ok-on-ink",
                    offerAvailability(offer) !== "in_stock" && "bg-stock-pending-on-ink",
                  )}
                />
                <span className="min-w-0 text-pretty">
                  {offer.shop}، {offerStockLine(offer)}
                </span>
              </span>
            ) : guide ? (
              <span className="mt-1 block text-label font-normal leading-5 text-primary-foreground/80">
                برآورد کاتالوگ؛ قیمت فروشگاه جدا ثبت می‌شود
              </span>
            ) : null}
          </span>
          <span className="inline-flex shrink-0 items-center gap-1 text-label font-medium">
            فروشگاه‌ها
            <ChevronLeft strokeWidth={2} />
          </span>
        </Button>
        {cheaper ? (
          <Alert variant="warning" className="mt-3">
            در {cheaper.shop} {millionToman(cheaper.price)}، موجودی تأیید نشده
          </Alert>
        ) : null}

        <ForYou face={face} context={context} />

        {showFacts ? (
          <Card className="mt-8 p-0">
            <div>
              {season ? (
                <Fact
                  label="فصل"
                  value={season}
                  href={wearHref(
                    "season",
                    perfume.seasons,
                    `/perfume/${perfume.slug}`,
                  )}
                />
              ) : null}
              {perfume.longevity ? (
                <Fact label="ماندگاری" term="longevity-sillage" value={performanceLabel("longevity", perfume.longevity)} />
              ) : null}
              {perfume.sillage ? (
                <Fact label="پخش بو" term="longevity-sillage" value={performanceLabel("sillage", perfume.sillage)} />
              ) : null}
            </div>
          </Card>
        ) : null}

        {perfume.notes.length > 0 ? (
          <section className="mt-8" aria-labelledby="pyramid-title">
            <h2 id="pyramid-title" className="text-title font-semibold">
              هرم بو
            </h2>
            <Card className="mt-3 px-4">
              <NoteStack notes={perfume.notes} />
            </Card>
          </section>
        ) : null}

        <AlternativeGroups perfume={perfume} from={`/perfume/${perfume.slug}`} />

        <section className="mt-8" aria-labelledby="taste-title">
          <h2 id="taste-title" className="text-title font-semibold">
            این عطر چطوره؟
          </h2>
          <p className="mt-1 text-pretty text-label text-muted-foreground">
            برای آرومای من و پیشنهاد بعدی نگه می‌داریم.
          </p>
          <Card className="mt-3 p-2">
            <TasteRow slug={perfume.slug} name={perfume.nameFa} />
          </Card>
        </section>

      </article>
      </ReportPerfume>
    </Shell>
  );
}

function Echoes({ items, from }: { items: ReferenceProfile[]; from: string }) {
  const many = items.length > 1;
  return (
    <section className="mt-8" aria-labelledby="echo-title">
      <h2 id="echo-title" className="text-title font-semibold">
        {many ? "یاد این عطرها می‌افتد" : "یاد این عطر می‌افتد"}
      </h2>
      <ul className="mt-3 flex flex-col gap-3">
        {items.map((item) => (
          <li key={item.id}>
            <Card className="p-0">
              <Link
                href={referenceHref(item.id, from)}
                className="flex min-h-16 items-center gap-3 p-3 outline-offset-2 focus-visible:outline-2 focus-visible:outline-ring"
              >
                <span className="min-w-0 flex-1 text-start">
                  <span className="block text-body font-semibold">{item.nameFa}</span>
                  <span className="mt-1 block text-label text-muted-foreground">
                    <bdi dir="ltr">{item.nameEn}</bdi>
                  </span>
                  {item.line ? (
                    <span className="mt-1 block text-pretty text-label">{item.line}</span>
                  ) : null}
                </span>
                <ChevronLeft strokeWidth={1.5} className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              </Link>
            </Card>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-pretty text-label text-muted-foreground">
        شباهت حس و فضای بویایی است، نه ادعای یکسان بودن با برند اصلی.
      </p>
    </section>
  );
}

function Fact({ label, value, term, href }: { label: string; value: string; term?: string; href?: string }) {
  const { openTerm } = useAroma();
  const body = (
    <>
      <span className="block text-label text-muted-foreground">{label}</span>
      <span className="mt-1 block text-pretty text-body font-semibold">{value}</span>
    </>
  );
  const className = "flex min-h-16 w-full flex-col justify-center border-b border-border px-4 py-3 text-start last:border-b-0";
  if (term) {
    return (
      <button
        type="button"
        onClick={() => openTerm(term)}
        className={cn(className, "outline-offset-2 hover:bg-press focus-visible:outline-2 focus-visible:outline-ring")}
      >
        {body}
      </button>
    );
  }
  if (href) {
    return (
      <Link href={href} className={cn(className, "outline-offset-2 hover:bg-press focus-visible:outline-2 focus-visible:outline-ring")}>
        {body}
      </Link>
    );
  }
  return <div className={className}>{body}</div>;
}

function FragranticaLink({ name, href }: { name: string; href: string }) {
  if (!href) {
    return (
      <Button
        type="button"
        variant="outline"
        size="icon"
        disabled
        aria-label={`صفحهٔ فراگرانتیکا برای ${name} ثبت نشده`}
        className="min-h-11 min-w-11 shrink-0 rounded-full! bg-card! text-muted-foreground"
      >
        <FragranticaMark />
      </Button>
    );
  }

  return (
    <Button
      href={href}
      variant="outline"
      size="icon"
      aria-label={`دیدن ${name} در فراگرانتیکا`}
      className="min-h-11 min-w-11 shrink-0 rounded-full! bg-card!"
    >
      <FragranticaMark />
    </Button>
  );
}

function FragranticaMark() {
  return (
    <span dir="ltr" aria-hidden="true" className="text-title font-bold leading-none">
      F
    </span>
  );
}

function askedSeasonOf(value: string | null): Season | null {
  if (value === "summer" || value === "winter" || value === "mild") return value;
  return null;
}
