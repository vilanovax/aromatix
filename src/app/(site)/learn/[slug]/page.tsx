"use client";

import { useParams } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { BookOpen, ChevronLeft } from "lucide-react";
import { PerfumePhoto } from "@/components/Bottle";
import { Shell } from "@/components/Shell";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Separator } from "@/components/ui/separator";
import { faNum } from "@/lib/format";
import { formatShamsi } from "@/lib/jalali";
import { recordUsage } from "@/lib/usage";
import { perfumeHref } from "@/lib/nav";
import { getEntry, relatedEntries, relatedPerfumes } from "@/lib/knowledge";

function latinLine(value: string) {
  return /^[\sA-Za-z0-9.'’·-]+$/.test(value);
}

export default function LearnEntryPage() {
  const params = useParams<{ slug: string }>();
  const entry = getEntry(params.slug);
  useEffect(() => {
    if (entry) recordUsage("article_view", entry.slug);
  }, [entry]);

  if (!entry) {
    return (
      <Shell composer back={{ href: "/learn", label: "دانستنی‌ها" }}>
        <EmptyState
          className="vf app mx-5 my-10"
          icon={BookOpen}
          title="این مدخل را نداریم"
          description="از فهرست دانستنی‌ها یکی را باز کن."
          action={
            <Button href="/learn" className="min-h-11">
              برگشت به دانستنی‌ها
            </Button>
          }
        />
      </Shell>
    );
  }

  const perfumes = relatedPerfumes(entry);
  const others = relatedEntries(entry);

  return (
    <Shell composer back={{ href: "/learn", label: "دانستنی‌ها" }}>
      <article className="vf app step-in px-5 pt-6 pb-[max(2.5rem,env(safe-area-inset-bottom))]">
        <h1 className="text-balance text-headline font-bold">{entry.title}</h1>
        <p className="mt-2 text-pretty text-body text-muted-foreground">
          {latinLine(entry.support) ? <bdi dir="ltr">{entry.support}</bdi> : entry.support}
          <span className="mx-2">·</span>
          {faNum(entry.minutes)} دقیقه
          <span className="mx-2">·</span>
          {formatShamsi(entry.publishedOn)}
        </p>
        {entry.mark ? (
          <div className="mt-4 h-2 w-24 rounded-full" style={{ background: entry.mark }} aria-hidden="true" />
        ) : null}

        <p className="mt-5 text-pretty text-body font-medium">{entry.summary}</p>

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
            <Card className="mt-4 px-4 py-1">
              <ul>
                {entry.compare.map((row, index) => (
                  <li key={row.label}>
                    {index > 0 ? <Separator /> : null}
                    <div className="flex min-h-14 flex-col justify-center py-3">
                      <span className="text-label text-muted-foreground">{row.label}</span>
                      <span className="mt-1 text-body font-semibold">{row.range}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
            <p className="mt-2 text-pretty text-label text-muted-foreground">تقریبی در صنعت‌اند، نه مرز قانونی ثابت.</p>
          </section>
        ) : null}

        {entry.myth ? (
          <Alert className="mt-8" title={entry.myth.reality}>
            باور رایج: {entry.myth.claim}
          </Alert>
        ) : null}

        {perfumes.length > 0 ? (
          <section className="mt-8" aria-labelledby="in-catalog">
            <h2 id="in-catalog" className="text-title font-semibold">
              در این عطرها هست
            </h2>
            <ul className="mt-4 flex flex-col gap-3">
              {perfumes.map((perfume) => {
                const href = perfumeHref(perfume.slug, `/learn/${entry.slug}`);
                return (
                  <li key={perfume.slug}>
                    <Card className="p-0">
                      <Link
                        href={href}
                        className="flex items-start gap-3 p-3 outline-offset-2 focus-visible:outline-2 focus-visible:outline-ring"
                      >
                        <PerfumePhoto perfume={perfume} sizes="thumb" alt="" className="h-16 w-12 shrink-0 rounded-control" />
                        <span className="min-w-0 flex-1 text-start">
                          <span className="block text-title font-semibold">{perfume.nameFa}</span>
                          <span className="mt-1 block text-label text-muted-foreground">{perfume.brand}</span>
                        </span>
                        <ChevronLeft className="mt-1 size-4 shrink-0 text-muted-foreground" strokeWidth={1.5} aria-hidden="true" />
                      </Link>
                    </Card>
                  </li>
                );
              })}
            </ul>
          </section>
        ) : null}

        {others.length > 0 ? (
          <section className="mt-8" aria-labelledby="more-title">
            <h2 id="more-title" className="text-title font-semibold">
              بعد از این
            </h2>
            <Card className="mt-4 px-4 py-1">
              <ul>
                {others.map((item, index) => (
                  <li key={item.slug}>
                    {index > 0 ? <Separator /> : null}
                    <Link
                      href={`/learn/${item.slug}`}
                      className="flex min-h-14 items-center gap-3 py-3 outline-offset-2 focus-visible:outline-2 focus-visible:outline-ring"
                    >
                      <span className="min-w-0 flex-1 text-start">
                        <span className="block text-pretty text-body font-semibold">{item.title}</span>
                        <span className="mt-1 block text-label text-muted-foreground">{item.support}</span>
                      </span>
                      <ChevronLeft className="size-4 shrink-0 text-muted-foreground" strokeWidth={1.5} aria-hidden="true" />
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
          </section>
        ) : null}
      </article>
    </Shell>
  );
}
