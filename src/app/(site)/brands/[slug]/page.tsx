"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { ChevronLeft, Globe, Store } from "lucide-react";
import { AccordMark } from "@/components/AccordMark";
import { PerfumePhoto } from "@/components/Bottle";
import { Shell } from "@/components/Shell";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { getBrand, getPerfume, perfumesByBrand, publicLead, type Brand } from "@/lib/catalog";
import { computeDna } from "@/lib/dna";
import { countWord, faNum, millionToman } from "@/lib/format";
import { perfumeHref } from "@/lib/nav";
import { suggestForBrand } from "@/lib/match";
import { useAroma } from "@/lib/store";
import type { Perfume, UserPerfume } from "@/lib/types";

export default function BrandPage() {
  return (
    <Suspense>
      <BrandScreen />
    </Suspense>
  );
}

function BrandScreen() {
  const params = useParams<{ slug: string }>();
  const search = useSearchParams();
  const brand = getBrand(params.slug);
  const from = search.get("from");
  const origin = from ? getPerfume(from) : undefined;

  if (!brand?.active) {
    return (
      <Shell composer back={{ href: "/brands", label: "برندها" }}>
        <EmptyState
          className="vf app mx-5 my-10"
          icon={Store}
          title="این برند در نمونه نیست"
          description="از فهرست برندها یکی را باز کن."
          action={
            <Button href="/brands" className="min-h-11">
              برگشت به برندها
            </Button>
          }
        />
      </Shell>
    );
  }

  const catalog = perfumesByBrand(brand.nameFa);
  const back =
    origin && origin.brand === brand.nameFa
      ? { href: `/perfume/${origin.slug}`, label: origin.nameFa }
      : { href: "/brands", label: "برندها" };

  return (
    <Shell composer back={back}>
      <article className="vf app step-in px-5 pt-6 pb-[max(2.5rem,env(safe-area-inset-bottom))]">
        <header>
          <div className="flex items-center gap-4">
            <div className="flex shrink-0 items-center gap-2">
              {brand.logo ? (
                <div className="flex size-16 items-center justify-center overflow-hidden rounded-surface border border-border bg-secondary sm:size-20">
                  <img src={brand.logo} alt="" className="max-h-full max-w-full object-contain p-2" />
                </div>
              ) : null}
              <BrandMarks brand={brand} />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-balance text-display font-bold">{brand.nameFa}</h1>
              <p className="mt-1 text-label text-muted-foreground">
                <bdi dir="ltr">{brand.nameEn}</bdi>
              </p>
              <p className="mt-2 text-body text-muted-foreground">{countWord(catalog.length)} عطر در آروما</p>
            </div>
          </div>
          {brand.description ? <p className="mt-4 text-pretty text-body">{brand.description}</p> : null}
        </header>

        <ForYou brandName={brand.nameFa} brandSlug={brand.slug} />

        <section className="mt-8" aria-labelledby="catalog-title">
          <h2 id="catalog-title" className="text-title font-semibold">
            همهٔ عطرها
          </h2>
          <ul className="mt-4 flex flex-col gap-3">
            {catalog.map((perfume) => (
              <li key={perfume.slug}>
                <PerfumeRow perfume={perfume} from={`/brands/${brand.slug}`} />
              </li>
            ))}
          </ul>
        </section>
      </article>
    </Shell>
  );
}

function BrandMarks({ brand }: { brand: Brand }) {
  const website = brand.website?.trim() ?? "";
  const instagram = instagramHref(brand.instagram);
  if (!website && !instagram) return null;

  return (
    <div className="flex shrink-0 flex-col gap-2" aria-label="لینک‌های برند">
      {website ? (
        <Button
          href={website}
          variant="outline"
          size="icon"
          className="min-h-11 min-w-11 rounded-full! bg-card! text-foreground"
          aria-label={`وب‌سایت ${brand.nameFa}`}
        >
          <Globe strokeWidth={1.5} aria-hidden="true" />
        </Button>
      ) : null}
      {instagram ? (
        <Button
          href={instagram}
          variant="outline"
          size="icon"
          className="min-h-11 min-w-11 rounded-full! bg-card! text-foreground"
          aria-label={`اینستاگرام ${brand.nameFa}`}
        >
          <InstagramMark />
        </Button>
      ) : null}
    </div>
  );
}

function InstagramMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="3.75" />
      <circle cx="17.25" cy="6.75" r="0.75" fill="currentColor" stroke="none" />
    </svg>
  );
}

function instagramHref(value: string | undefined) {
  const text = value?.trim() ?? "";
  if (!text) return "";
  if (/^https?:\/\//i.test(text)) return text;
  return `https://instagram.com/${text.replace(/^@/, "")}`;
}

function ForYou({ brandName, brandSlug }: { brandName: string; brandSlug: string }) {
  const { ready, library } = useAroma();
  if (!ready) return null;

  const dna = computeDna(library, getPerfume);
  const known = dna.stage === "early" || dna.stage === "dna";

  if (!known) {
    return (
      <Alert className="mt-5">
        چند عطری را که تجربه کردی امتیاز بده تا از {brandName} برایت جدا کنیم؛ یا با{" "}
        <Link
          href="/guide"
          className="font-semibold underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          راهنمای انتخاب
        </Link>{" "}
        شروع کن.
      </Alert>
    );
  }

  const picks = suggestForBrand(brandName, library);
  if (picks.length === 0) return null;

  return (
    <section className="mt-8" aria-labelledby="for-you-title">
      <h2 id="for-you-title" className="text-title font-semibold">
        از {brandName} برای تو
      </h2>
      <p className="mt-1 text-pretty text-label text-muted-foreground">{dna.sentence}</p>
      <ul className="mt-4 flex flex-col gap-3">
        {picks.map((perfume) => (
          <li key={perfume.slug}>
            <PerfumeRow perfume={perfume} from={`/brands/${brandSlug}`} why />
          </li>
        ))}
      </ul>
    </section>
  );
}

function PerfumeRow({ perfume, from, why = false }: { perfume: Perfume; from: string; why?: boolean }) {
  const { library } = useAroma();
  const offer = publicLead(perfume);
  const status = statusLabel(library[perfume.slug]);

  return (
    <Card className="p-0">
      <Link
        href={perfumeHref(perfume.slug, from)}
        className="flex items-start gap-3 rounded-surface p-3 outline-offset-2 focus-visible:outline-2 focus-visible:outline-ring"
      >
        <PerfumePhoto perfume={perfume} sizes="thumb" alt="" className="h-16 w-12 shrink-0 rounded-control" />
        <span className="min-w-0 flex-1 text-start">
          <span className="block text-title font-semibold">{perfume.nameFa}</span>
          <span className="mt-1 block text-label text-muted-foreground">
            {perfume.brand}
            {offer ? `، ${millionToman(offer.price)}` : ""}
            {status ? `، ${status}` : ""}
          </span>
          {why ? (
            <span className="mt-1 line-clamp-2 text-pretty text-label text-muted-foreground">{perfume.why}</span>
          ) : (
            <span className="mt-2 block max-w-56">
              <AccordMark accords={perfume.accords} names />
            </span>
          )}
        </span>
        <ChevronLeft className="mt-1 size-4 shrink-0 text-muted-foreground" strokeWidth={1.5} aria-hidden="true" />
      </Link>
    </Card>
  );
}

function statusLabel(state: UserPerfume | undefined) {
  if (!state) return null;
  if (state.disliked) return "نپسندیدی";
  if (state.rating != null) return `${faNum(state.rating)} از ۱۰`;
  if (state.owned) return "داری";
  if (state.wanted) return "می‌خوای";
  return null;
}
