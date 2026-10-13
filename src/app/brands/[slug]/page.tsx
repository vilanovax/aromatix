"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { AccordMark } from "@/components/AccordMark";
import { PerfumePhoto } from "@/components/Bottle";
import { ButtonLink } from "@/components/Button";
import { ForwardIcon } from "@/components/Icons";
import { Shell } from "@/components/Shell";
import { getBrand, getPerfume, perfumesByBrand, publicLead } from "@/lib/catalog";
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
        <div className="px-5 py-10">
          <h1 className="text-headline font-bold">این برند در نمونه نیست.</h1>
          <p className="mt-2 max-w-[22rem] text-pretty text-body text-muted">از فهرست برندها یکی را باز کن.</p>
          <ButtonLink href="/brands" className="mt-5">
            برگشت به برندها
          </ButtonLink>
        </div>
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
      <article className="step-in px-5 pt-6 pb-[max(2.5rem,env(safe-area-inset-bottom))]">
        <header>
          <h1 className="text-balance text-display font-bold">{brand.nameFa}</h1>
          <p className="mt-1 text-body text-muted">
            <span dir="ltr" className="inline-block">
              {brand.nameEn}
            </span>
            <span className="mx-1.5 text-faint">·</span>
            {countWord(catalog.length)} عطر در آروما
          </p>
          {brand.description ? <p className="mt-4 max-w-[36rem] text-pretty text-body">{brand.description}</p> : null}
        </header>

        <ForYou brandName={brand.nameFa} brandSlug={brand.slug} />

        <section className="mt-8" aria-labelledby="catalog-title">
          <h2 id="catalog-title" className="text-title font-semibold">
            همهٔ عطرها
          </h2>
          <ul className="mt-3 flex flex-col gap-2">
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

function ForYou({ brandName, brandSlug }: { brandName: string; brandSlug: string }) {
  const { ready, library } = useAroma();
  if (!ready) return null;

  const dna = computeDna(library, getPerfume);
  const known = dna.stage === "early" || dna.stage === "dna";

  if (!known) {
    return (
      <p className="mt-5 rounded-panel bg-moss px-4 py-3 text-pretty text-body">
        چند عطری را که تجربه کردی امتیاز بده تا از {brandName} برایت جدا کنیم؛ یا با{" "}
        <Link
          href="/guide"
          className="font-semibold underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
        >
          راهنمای انتخاب
        </Link>{" "}
        شروع کن.
      </p>
    );
  }

  const picks = suggestForBrand(brandName, library);
  if (picks.length === 0) return null;

  return (
    <section className="mt-8" aria-labelledby="for-you-title">
      <h2 id="for-you-title" className="text-title font-semibold">
        از {brandName} برای تو
      </h2>
      <p className="mt-1 text-pretty text-label text-muted">{dna.sentence}</p>
      <ul className="mt-3 flex flex-col gap-2">
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
    <Link
      href={perfumeHref(perfume.slug, from)}
      className="pressable quiet flex items-center gap-3 rounded-panel border border-line bg-card p-2.5 pe-3 outline-offset-2 focus-visible:outline-2 focus-visible:outline-ink"
    >
      <PerfumePhoto perfume={perfume} sizes="thumb" alt="" className="h-16 w-13 shrink-0 rounded-control" />
      <span className="min-w-0 flex-1 text-start">
        <span className="flex items-baseline justify-between gap-2">
          <span className="truncate text-body font-semibold">{perfume.nameFa}</span>
          {status ? <span className="shrink-0 text-label text-muted">{status}</span> : null}
        </span>
        {why ? (
          <span className="mt-0.5 line-clamp-2 block text-pretty text-label text-muted">{perfume.why}</span>
        ) : (
          <span className="mt-1.5 block max-w-56">
            <AccordMark accords={perfume.accords} names />
          </span>
        )}
        {offer ? <span className="mt-1 block text-label text-muted">{millionToman(offer.price)}</span> : null}
      </span>
      <ForwardIcon className="size-5 shrink-0 text-muted" />
    </Link>
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
