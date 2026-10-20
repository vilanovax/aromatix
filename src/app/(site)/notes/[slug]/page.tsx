"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, Leaf } from "lucide-react";
import { PerfumePhoto } from "@/components/Bottle";
import { Shell } from "@/components/Shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { listedPrice } from "@/lib/catalog";
import { Select } from "@/components/ui/select";
import { countWord, joinFa, millionToman } from "@/lib/format";
import { entryForNote } from "@/lib/knowledge";
import { perfumeHref, referenceHref, resolvePerfumeBack } from "@/lib/nav";
import { noteEnglish } from "@/lib/note-glossary";
import { LAYER_LABEL, noteHref, noteNameFromSlug, perfumesWithNote, referencesWithNote, type NoteHit } from "@/lib/notes";
import type { Note, Perfume } from "@/lib/types";

export default function NotePage() {
  return (
    <Suspense>
      <NoteScreen />
    </Suspense>
  );
}

const LAYER_ORDER = ["top", "middle", "base"] as const satisfies readonly Note["layer"][];

function NoteScreen() {
  const router = useRouter();
  const params = useParams<{ slug: string }>();
  const search = useSearchParams();
  const name = noteNameFromSlug(params.slug ?? "");
  const english = name ? noteEnglish(name) : null;
  const hits = name ? perfumesWithNote(name) : [];
  const families = name ? referencesWithNote(name) : [];
  const lesson = name ? entryForNote(name) : undefined;
  const known = hits.length > 0 || families.length > 0;
  const byLayer = search.get("view") === "row";
  const brand = search.get("brand") ?? "";
  const rawSort = search.get("sort");
  const sort = rawSort === "cheap" || rawSort === "rich" ? rawSort : "";
  const brands = [...new Set(hits.map((hit) => hit.perfume.brand))].sort((a, b) => a.localeCompare(b, "fa"));
  const activeBrand = brands.includes(brand) ? brand : "";
  const visible = arrangeHits(hits, activeBrand, sort);

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
  const groups = LAYER_ORDER.map((layer) => ({
    layer,
    label: LAYER_LABEL[layer],
    hits: visible.filter((hit) => hit.layers.includes(layer)),
  })).filter((group) => group.hits.length > 0);

  function patchQuery(key: string, value: string) {
    const next = new URLSearchParams(search.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    const suffix = next.toString();
    router.replace(suffix ? `${noteHref(name)}?${suffix}` : noteHref(name));
  }

  function show(next: "any" | "row") {
    patchQuery("view", next === "row" ? "row" : "");
  }

  return (
    <Shell back={back}>
      <article className="vf app step-in px-5 pt-6 pb-[max(2.5rem,env(safe-area-inset-bottom))]">
        <header>
          <h1 className="text-balance text-display font-bold">
            {name}
            {english ? (
              <>
                {" "}
                <bdi dir="ltr" className="font-normal text-muted-foreground">
                  ({english})
                </bdi>
              </>
            ) : null}
          </h1>
          <p className="mt-2 text-pretty text-body text-muted-foreground">{summary(visible.length, activeBrand, byLayer)}</p>
          {hits.length > 0 ? (
            <Card className="mt-4 p-3">
              <div className="grid grid-cols-2 gap-2" role="group" aria-label="مدل نمایش">
                <Button
                  type="button"
                  variant={byLayer ? "outline" : "secondary"}
                  aria-pressed={!byLayer}
                  onClick={() => show("any")}
                  className="min-h-11 px-2 font-medium"
                >
                  یک فهرست
                </Button>
                <Button
                  type="button"
                  variant={byLayer ? "secondary" : "outline"}
                  aria-pressed={byLayer}
                  onClick={() => show("row")}
                  className="min-h-11 px-2 font-medium"
                >
                  تفکیک لایه
                </Button>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <label className="min-w-0">
                  <span className="text-label text-muted-foreground">برند</span>
                  <Select
                    aria-label="فیلتر برند"
                    className="mt-1.5 h-11 min-h-11 text-body"
                    value={activeBrand}
                    onChange={(event) => patchQuery("brand", event.target.value)}
                    options={[
                      { value: "", label: "همه" },
                      ...brands.map((item) => ({ value: item, label: item })),
                    ]}
                  />
                </label>
                <label className="min-w-0">
                  <span className="text-label text-muted-foreground">چینش</span>
                  <Select
                    aria-label="چینش فهرست"
                    className="mt-1.5 h-11 min-h-11 text-body"
                    value={sort}
                    onChange={(event) => patchQuery("sort", event.target.value)}
                    options={[
                      { value: "", label: "به ترتیب نام" },
                      { value: "cheap", label: "ارزان‌تر اول" },
                      { value: "rich", label: "گران‌تر اول" },
                    ]}
                  />
                </label>
              </div>
              {activeBrand || sort ? (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    const next = new URLSearchParams(search.toString());
                    next.delete("brand");
                    next.delete("sort");
                    const suffix = next.toString();
                    router.replace(suffix ? `${noteHref(name)}?${suffix}` : noteHref(name));
                  }}
                  className="mt-2 min-h-11 w-full font-medium text-muted-foreground"
                >
                  پاک کردن فیلتر
                </Button>
              ) : null}
            </Card>
          ) : null}
          {lesson ? (
            <Link
              href={`/learn/${lesson.slug}`}
              className="mt-3 inline-flex min-h-11 items-center text-body font-medium underline-offset-4 outline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-ring"
            >
              {lesson.title} در دانستنی‌ها
            </Link>
          ) : null}
        </header>

        {hits.length > 0 && visible.length === 0 ? (
          <p className="mt-8 text-pretty text-body text-muted-foreground">با این برند عطری با این نت نیست.</p>
        ) : null}

        {visible.length > 0 && !byLayer ? (
          <section className="mt-8" aria-labelledby="note-perfumes">
            <h2 id="note-perfumes" className="text-title font-semibold">
              عطرها
            </h2>
            <HitList hits={visible} here={here} showBrand={!activeBrand} />
          </section>
        ) : null}

        {visible.length > 0 && byLayer ? (
          <div className="mt-6 flex flex-col gap-6">
            {groups.map((group) => (
              <section key={group.layer} aria-labelledby={`layer-${group.layer}`}>
                <h2 id={`layer-${group.layer}`} className="text-title font-semibold">
                  {group.label}
                  <span className="ms-2 text-label font-normal text-muted-foreground">{countWord(group.hits.length)} عطر</span>
                </h2>
                <HitList hits={group.hits} here={here} layer={group.layer} showBrand={!activeBrand} />
              </section>
            ))}
          </div>
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
                    href={referenceHref(reference.id, noteHref(name))}
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

function HitList({
  hits,
  here,
  layer,
  showBrand,
}: {
  hits: NoteHit[];
  here: string;
  layer?: Note["layer"];
  showBrand: boolean;
}) {
  return (
    <ul className="mt-3 flex flex-col gap-2">
      {hits.map(({ perfume, layers }) => (
        <li key={perfume.slug}>
          <PerfumeRow
            perfume={perfume}
            here={here}
            showBrand={showBrand}
            place={joinFa((layer ? [layer] : layers).map((item) => LAYER_LABEL[item]))}
          />
        </li>
      ))}
    </ul>
  );
}

function arrangeHits(hits: NoteHit[], brand: string, sort: string) {
  const filtered = brand ? hits.filter((hit) => hit.perfume.brand === brand) : hits;
  if (sort !== "cheap" && sort !== "rich") return filtered;
  return [...filtered].sort((left, right) => {
    const leftPrice = listedPrice(left.perfume);
    const rightPrice = listedPrice(right.perfume);
    if (leftPrice == null && rightPrice == null) return left.perfume.nameFa.localeCompare(right.perfume.nameFa, "fa");
    if (leftPrice == null) return 1;
    if (rightPrice == null) return -1;
    return sort === "cheap" ? leftPrice - rightPrice : rightPrice - leftPrice;
  });
}

function PerfumeRow({
  perfume,
  here,
  place,
  showBrand,
}: {
  perfume: Perfume;
  here: string;
  place: string;
  showBrand: boolean;
}) {
  const price = listedPrice(perfume);
  return (
    <Card className="p-0">
      <Link
        href={perfumeHref(perfume.slug, here)}
        className="flex items-center gap-3 p-3 outline-offset-2 focus-visible:outline-2 focus-visible:outline-ring"
      >
        <PerfumePhoto perfume={perfume} sizes="thumb" alt="" className="h-14 w-11 shrink-0 rounded-control" />
        <span className="min-w-0 flex-1 text-start">
          <span className="block truncate text-title font-semibold">{perfume.nameFa}</span>
          <span className="mt-1 flex items-baseline justify-between gap-3 text-label text-muted-foreground">
            <span className="min-w-0 truncate">
              {showBrand ? `${perfume.brand}، ` : ""}در {place}
            </span>
            {price ? <span className="shrink-0 font-semibold text-foreground">{millionToman(price)}</span> : null}
          </span>
        </span>
        <ChevronLeft className="size-4 shrink-0 text-muted-foreground" strokeWidth={1.5} aria-hidden="true" />
      </Link>
    </Card>
  );
}

function summary(count: number, brand: string, byLayer: boolean) {
  const base = lead(count, brand);
  return byLayer ? `${base} هر بخش، جای نت در هرم است.` : base;
}

function lead(count: number, brand: string) {
  if (count === 0) return brand ? `از ${brand} عطری با این نت نیست.` : "در نمونه‌های آروما شیشه‌ای با این نت ثبت نشده.";
  if (count === 1) return brand ? `یک عطر از ${brand} این نت را دارد.` : "یک عطر این نت را دارد.";
  return brand ? `${countWord(count)} عطر از ${brand} این نت را دارند.` : `${countWord(count)} عطر این نت را دارند.`;
}
