"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { BrandLink } from "@/components/BrandLink";
import { ScentMark } from "@/components/Bottle";
import { ButtonLink } from "@/components/Button";
import { Note } from "@/components/Card";
import { ForwardIcon } from "@/components/Icons";
import { Shell } from "@/components/Shell";
import { faNum } from "@/lib/format";
import { getEntry, relatedEntries, relatedPerfumes } from "@/lib/knowledge";

export default function LearnEntryPage() {
  const params = useParams<{ slug: string }>();
  const entry = getEntry(params.slug);

  if (!entry) {
    return (
      <Shell composer back={{ href: "/learn", label: "دانستنی‌ها" }}>
        <div className="px-5 py-10">
          <h1 className="text-headline font-bold">این مدخل را نداریم.</h1>
          <p className="mt-2 max-w-[22rem] text-pretty text-body text-muted">از فهرست دانستنی‌ها یکی را باز کن.</p>
          <ButtonLink href="/learn" className="mt-5">
            برگشت به دانستنی‌ها
          </ButtonLink>
        </div>
      </Shell>
    );
  }

  const perfumes = relatedPerfumes(entry);
  const others = relatedEntries(entry);

  return (
    <Shell composer back={{ href: "/learn", label: "دانستنی‌ها" }}>
      <article className="step-in px-5 pt-6 pb-[max(2.5rem,env(safe-area-inset-bottom))]">
        <h1 className="text-balance text-display font-bold">{entry.title}</h1>
        <p className="mt-2 text-body text-muted">
          {entry.support}
          <span className="mx-1.5 text-faint">·</span>
          {faNum(entry.minutes)} دقیقه
        </p>
        {entry.mark ? (
          <div className="mt-4 h-2 w-24 rounded-full" style={{ background: entry.mark }} aria-hidden="true" />
        ) : null}

        {entry.body.map((paragraph) => (
          <p key={paragraph} className="mt-4 text-pretty text-body">
            {paragraph}
          </p>
        ))}

        {entry.compare ? (
          <section className="mt-8" aria-labelledby="compare-title">
            <h2 id="compare-title" className="text-title font-semibold">
              بازه‌های رایج غلظت
            </h2>
            <ul className="mt-3 divide-y divide-line overflow-hidden rounded-panel border border-line bg-card">
              {entry.compare.map((row) => (
                <li key={row.label} className="flex items-baseline justify-between gap-3 px-4 py-3.5">
                  <span className="text-body font-medium">{row.label}</span>
                  <span className="text-label text-muted">{row.range}</span>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-pretty text-label text-muted">تقریبی در صنعت‌اند، نه مرز قانونی ثابت.</p>
          </section>
        ) : null}

        {entry.myth ? (
          <Note tone="moss" className="mt-8 rounded-panel px-4 py-3.5 text-pretty">
            <span className="block font-semibold">{entry.myth.reality}</span>
            <span className="mt-1.5 block text-label text-muted">باور رایج: {entry.myth.claim}</span>
          </Note>
        ) : null}

        {perfumes.length > 0 ? (
          <section className="mt-10" aria-labelledby="in-catalog">
            <h2 id="in-catalog" className="text-title font-semibold">
              در این عطرها هست
            </h2>
            <ul className="mt-3 flex flex-col gap-2">
              {perfumes.map((perfume) => (
                <li key={perfume.slug}>
                  <div className="flex w-full items-center gap-3 rounded-panel border border-line bg-card p-2.5">
                    <Link href={`/perfume/${perfume.slug}`} className="shrink-0 rounded-control">
                      <ScentMark perfume={perfume} className="h-16 w-12 rounded-control" />
                    </Link>
                    <span className="min-w-0 flex-1 text-start">
                      <Link href={`/perfume/${perfume.slug}`} className="block font-medium">
                        {perfume.nameFa}
                      </Link>
                      <span className="block text-label text-muted">
                        <BrandLink name={perfume.brand} from={perfume.slug} />
                      </span>
                    </span>
                    <Link
                      href={`/perfume/${perfume.slug}`}
                      aria-label={`باز کردن ${perfume.nameFa}`}
                      className="shrink-0 rounded-control p-1 text-muted"
                    >
                      <ForwardIcon className="size-5" />
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {others.length > 0 ? (
          <section className="mt-10" aria-labelledby="more-title">
            <h2 id="more-title" className="text-title font-semibold">
              بعد از این
            </h2>
            <ul className="mt-3 flex flex-col gap-2">
              {others.map((item) => (
                <li key={item.slug}>
                  <ButtonLink
                    href={`/learn/${item.slug}`}
                    variant="quiet"
                    shape="panel"
                    className="w-full justify-between gap-3 border border-line bg-card px-4 py-3 font-normal"
                  >
                    <span className="min-w-0 flex-1 text-start">
                      <span className="block font-medium">{item.title}</span>
                      <span className="mt-0.5 block text-label text-muted">{item.support}</span>
                    </span>
                    <ForwardIcon className="size-5 shrink-0 text-muted" />
                  </ButtonLink>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </article>
    </Shell>
  );
}
