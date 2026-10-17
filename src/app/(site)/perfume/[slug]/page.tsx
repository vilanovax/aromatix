"use client";

import { Suspense, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Check, ChevronLeft, SearchX } from "lucide-react";
import { AccordMark } from "@/components/AccordMark";
import { AlternativeGroups } from "@/components/AlternativeGroups";
import { PerfumePhoto } from "@/components/Bottle";
import { ForYou } from "@/components/ForYou";
import { NoteStack } from "@/components/NoteStack";
import { TermChip } from "@/components/TermSheet";
import { Shell } from "@/components/Shell";
import { TasteRow } from "@/components/TasteRow";
import { BrandLink } from "@/components/BrandLink";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { cheaperUnconfirmed, getPerfume, isPublicPerfume, performanceLabel, publicLead, seasonShort } from "@/lib/catalog";
import { entryForConcentration } from "@/lib/knowledge";
import { cn, faNum, millionToman } from "@/lib/format";
import { resolvePerfumeBack } from "@/lib/nav";
import { contextFit, faceFromPerfume } from "@/lib/personal-fit";
import { rememberVisit } from "@/lib/recent";
import { getReference } from "@/lib/references";
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
  const cheaper = cheaperUnconfirmed(perfume);
  const season = perfume.seasons.includes("all") ? null : perfume.seasons.map((id) => seasonShort(id)).join("، ");
  const showFacts = Boolean(season || perfume.longevity || perfume.sillage || perfume.inspiredBy);
  const picked = compare.includes(perfume.slug);
  const concentrationEntry = entryForConcentration(perfume.concentration);
  const askedSeason = askedSeasonOf(search.get("season"));
  const face = faceFromPerfume(perfume);
  const context = contextFit(face, { occasion: search.get("occasion"), season: askedSeason });
  const reference = perfume.inspiredBy ? getReference(perfume.inspiredBy) : undefined;

  useEffect(() => {
    rememberVisit({ href: `/perfume/${perfume.slug}`, label: perfume.nameFa });
  }, [perfume.slug, perfume.nameFa]);

  useEffect(() => {
    if (search.get("focus") !== "similar") return;
    document.getElementById("similar")?.scrollIntoView({ block: "start" });
  }, [search]);

  return (
    <Shell composer back={back}>
      <article className="vf app step-in px-5 pt-4 pb-[max(2.5rem,env(safe-area-inset-bottom))]">
        <figure className="overflow-hidden rounded-surface bg-secondary">
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
              <p className="mt-1 text-pretty text-body text-muted-foreground">
                <BrandLink name={perfume.brand} from={perfume.slug} />
                <span className="mx-2">،</span>
                <span dir="ltr" className="inline-block">
                  {perfume.nameEn}
                </span>
              </p>
            </div>
            <Button
              variant={picked ? "default" : "outline"}
              size="sm"
              aria-pressed={picked}
              aria-label={picked ? `حذف ${perfume.nameFa} از مقایسه` : `افزودن ${perfume.nameFa} به مقایسه`}
              onClick={() => toggleCompare(perfume.slug)}
              className={cn("mt-1 min-h-11 shrink-0 !rounded-full px-3 font-medium", !picked && "!bg-card")}
            >
              {picked ? <Check strokeWidth={2} /> : null}
              مقایسه
            </Button>
          </div>

          <ul className="mt-3 flex flex-wrap items-center gap-2" aria-label="مشخصات شیشه">
            <li>
              {concentrationEntry ? (
                <TermChip slug={concentrationEntry.slug}>{perfume.concentration}</TermChip>
              ) : (
                <Badge className="rounded-full bg-secondary px-3">{perfume.concentration}</Badge>
              )}
            </li>
            <li>
              <Badge className="rounded-full bg-secondary px-3">{faNum(perfume.volumeMl)} میلی‌لیتر</Badge>
            </li>
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

        <Alert className="mt-5">{perfume.why}</Alert>

        <Button
          size="lg"
          onClick={() => openShops(perfume.slug)}
          className="mt-5 !h-auto w-full !justify-between gap-3 !whitespace-normal px-4 py-3 text-start"
        >
          <span className="min-w-0">
            <span className="block text-body font-semibold">
              {offer ? `از ${millionToman(offer.price)}` : "فروشگاه‌ها"}
            </span>
            {offer ? (
              <span className="mt-1 flex items-center gap-2 text-label font-normal leading-5 text-primary-foreground/80">
                <span
                  aria-hidden="true"
                  className={cn(
                    "size-2 shrink-0 rounded-full",
                    offer.stockConfirmed ? "bg-stock-ok-on-ink" : "bg-stock-pending-on-ink",
                  )}
                />
                <span className="min-w-0 text-pretty">
                  {offer.shop}
                  {offer.stockConfirmed ? `، موجود، بررسی ${offer.checkedOn}` : "، موجودی تأیید نشده"}
                </span>
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
          <Card className="mt-8 px-4">
            <dl className="divide-y divide-border">
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
              {reference ? <Fact label="نزدیک به" value={reference.nameFa} /> : null}
            </dl>
          </Card>
        ) : null}
        {reference ? (
          <Button href={`/reference/${reference.id}`} variant="ghost" className="mt-2 min-h-11 px-0">
            شناخت {reference.nameFa}
          </Button>
        ) : null}
        {perfume.inspiredBy ? (
          <p className="mt-2 text-pretty text-label text-muted-foreground">
            شباهت بر اساس نوت‌های ثبت‌شده در آروماست، نه محصول برند اصلی.
          </p>
        ) : null}

        {perfume.notes.length > 0 ? (
          <section className="mt-8" aria-labelledby="pyramid-title">
            <h2 id="pyramid-title" className="text-title font-semibold">
              هرم بو
            </h2>
            <NoteStack notes={perfume.notes} />
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
    </Shell>
  );
}

function Fact({ label, value, term }: { label: string; value: string; term?: string }) {
  return (
    <div className="flex items-center justify-between gap-3 py-3 text-body">
      <dt className="shrink-0">
        {term ? (
          <TermChip slug={term}>{label}</TermChip>
        ) : (
          <span className="text-label text-muted-foreground">{label}</span>
        )}
      </dt>
      <dd className="min-w-0 text-pretty text-end">{value}</dd>
    </div>
  );
}

function askedSeasonOf(value: string | null): Season | null {
  if (value === "summer" || value === "winter" || value === "mild") return value;
  return null;
}
