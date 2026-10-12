"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { AccordMark } from "@/components/AccordMark";
import { PerfumePhoto } from "@/components/Bottle";
import { ButtonLink } from "@/components/Button";
import { ForwardIcon } from "@/components/Icons";
import { Shell } from "@/components/Shell";
import { getBrand, getPerfume, perfumesByBrand } from "@/lib/catalog";
import { computeDna } from "@/lib/dna";
import { countWord } from "@/lib/format";
import { suggestForBrand } from "@/lib/match";
import { useAroma } from "@/lib/store";
import type { Perfume } from "@/lib/types";

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

  if (!brand) {
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
      ? { href: `/perfume/${origin.slug}`, label: "عطر" }
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
          </p>
          <p className="mt-2 text-label text-muted">{countWord(catalog.length)} عطر در آروما</p>
        </header>

        <ForYou brandName={brand.nameFa} />

        <section className="mt-8" aria-labelledby="catalog-title">
          <h2 id="catalog-title" className="text-title font-semibold">
            عطرها
          </h2>
          <ul className="mt-3 flex flex-col gap-2.5">
            {catalog.map((perfume) => (
              <li key={perfume.slug}>
                <PerfumeRow perfume={perfume} detail={perfume.nameEn} latin />
              </li>
            ))}
          </ul>
        </section>
      </article>
    </Shell>
  );
}

function ForYou({ brandName }: { brandName: string }) {
  const { ready, library } = useAroma();
  const dna = computeDna(library, getPerfume);
  const picks = suggestForBrand(brandName, library);
  const known = dna.stage === "early" || dna.stage === "dna";

  if (!ready || (known && picks.length === 0)) return null;

  return (
    <section className="mt-8" aria-labelledby="for-you-title">
      <h2 id="for-you-title" className="text-title font-semibold">
        از {brandName} برای تو
      </h2>
      {known ? (
        <>
          <p className="mt-1 text-pretty text-body text-muted">{dna.sentence}</p>
          <ul className="mt-3 flex flex-col gap-2.5">
            {picks.map((perfume) => (
              <li key={perfume.slug}>
                <PerfumeRow perfume={perfume} detail={perfume.why} />
              </li>
            ))}
          </ul>
        </>
      ) : (
        <>
          <p className="mt-1 text-pretty text-body text-muted">هنوز سلیقه‌ات را کم می‌شناسیم.</p>
          <ButtonLink href="/guide" variant="edge" shape="control" size="md" className="mt-3">
            راهنمای انتخاب
          </ButtonLink>
        </>
      )}
    </section>
  );
}

function PerfumeRow({ perfume, detail, latin = false }: { perfume: Perfume; detail: string; latin?: boolean }) {
  return (
    <Link
      href={`/perfume/${perfume.slug}`}
      className="pressable quiet flex min-h-16 items-center gap-3 rounded-panel border border-line bg-card p-2.5 pe-3 outline-offset-2 focus-visible:outline-2 focus-visible:outline-ink"
    >
      <PerfumePhoto perfume={perfume} sizes="thumb" alt="" className="h-14 w-12 shrink-0 rounded-control" />
      <span className="min-w-0 flex-1 text-start">
        <span className="block text-body font-semibold">{perfume.nameFa}</span>
        <span dir={latin ? "ltr" : undefined} className="mt-0.5 block text-pretty text-label text-muted">
          {detail}
        </span>
        <span className="mt-2 block max-w-52">
          <AccordMark accords={perfume.accords} />
        </span>
      </span>
      <ForwardIcon className="size-5 shrink-0 text-muted" />
    </Link>
  );
}
