"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { ChevronLeft, Leaf } from "lucide-react";
import { PerfumePhoto } from "@/components/Bottle";
import { Shell } from "@/components/Shell";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { publicLead } from "@/lib/catalog";
import { countWord, joinFa, millionToman } from "@/lib/format";
import { entryForNote } from "@/lib/knowledge";
import { perfumeHref, resolvePerfumeBack } from "@/lib/nav";
import { LAYER_LABEL, noteHref, noteNameFromSlug, perfumesWithNote, referencesWithNote } from "@/lib/notes";

export default function NotePage() {
  return (
    <Suspense>
      <NoteScreen />
    </Suspense>
  );
}

function NoteScreen() {
  const params = useParams<{ slug: string }>();
  const search = useSearchParams();
  const name = noteNameFromSlug(params.slug ?? "");
  const hits = name ? perfumesWithNote(name) : [];
  const families = name ? referencesWithNote(name) : [];
  const lesson = name ? entryForNote(name) : undefined;
  const known = hits.length > 0 || families.length > 0;

  if (!known) {
    return (
      <Shell back={{ href: "/", label: "خانه" }}>
        <EmptyState
          className="vf app mx-5 my-10"
          icon={Leaf}
          title="این نت در آروما نیست"
          description="از هرم بوی یک عطر، نت را باز کن."
        />
      </Shell>
    );
  }

  const back = search.get("from") ? resolvePerfumeBack(search.get("from")) : { href: "/", label: "خانه" };
  const query = search.toString();
  const here = query ? `${noteHref(name)}?${query}` : noteHref(name);

  return (
    <Shell back={back}>
      <article className="vf app step-in px-5 pt-6 pb-[max(2.5rem,env(safe-area-inset-bottom))]">
        <header>
          <h1 className="text-balance text-display font-bold">{name}</h1>
          <p className="mt-2 text-pretty text-body text-muted-foreground">{lead(hits.length)}</p>
          {lesson ? (
            <Link
              href={`/learn/${lesson.slug}`}
              className="mt-3 inline-flex min-h-11 items-center text-body font-medium underline-offset-4 outline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-ring"
            >
              {lesson.title} در دانستنی‌ها
            </Link>
          ) : null}
        </header>

        {hits.length > 0 ? (
          <section className="mt-8" aria-labelledby="note-perfumes">
            <h2 id="note-perfumes" className="text-title font-semibold">
              عطرها
            </h2>
            <ul className="mt-3 flex flex-col gap-3">
              {hits.map(({ perfume, layers }) => {
                const offer = publicLead(perfume);
                const place = joinFa(layers.map((layer) => LAYER_LABEL[layer]));
                return (
                  <li key={perfume.slug}>
                    <Card className="p-0">
                      <Link
                        href={perfumeHref(perfume.slug, here)}
                        className="flex items-start gap-3 p-3 outline-offset-2 focus-visible:outline-2 focus-visible:outline-ring"
                      >
                        <PerfumePhoto perfume={perfume} sizes="thumb" alt="" className="h-16 w-12 shrink-0 rounded-control" />
                        <span className="min-w-0 flex-1 text-start">
                          <span className="block text-title font-semibold">{perfume.nameFa}</span>
                          <span className="mt-1 block text-label text-muted-foreground">
                            {perfume.brand}، در {place}
                          </span>
                          {offer ? (
                            <span className="mt-1 block text-label text-muted-foreground">{millionToman(offer.price)}</span>
                          ) : null}
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

        {families.length > 0 ? (
          <section className="mt-8" aria-labelledby="note-families">
            <h2 id="note-families" className="text-title font-semibold">
              در شناسنامهٔ خانواده
            </h2>
            <p className="mt-1 text-pretty text-label text-muted-foreground">حس رایج خانواده است، نه یک شیشهٔ مشخص.</p>
            <ul className="mt-3 flex flex-col gap-2">
              {families.map((reference) => (
                <li key={reference.id}>
                  <Link
                    href={`/reference/${reference.id}`}
                    className="flex min-h-11 items-center gap-3 rounded-control outline-offset-2 focus-visible:outline-2 focus-visible:outline-ring"
                  >
                    <span className="min-w-0 flex-1 text-start">
                      <span className="block text-body font-semibold">{reference.nameFa}</span>
                      <span className="block text-label text-muted-foreground">
                        <bdi dir="ltr">{reference.nameEn}</bdi>
                      </span>
                    </span>
                    <ChevronLeft className="size-4 shrink-0 text-muted-foreground" strokeWidth={1.5} aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </article>
    </Shell>
  );
}

function lead(count: number) {
  if (count === 0) return "در نمونه‌های آروما شیشه‌ای با این نت ثبت نشده.";
  if (count === 1) return "یک عطر این نت را دارد.";
  return `${countWord(count)} عطر این نت را دارند.`;
}
