"use client";

import { Suspense, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { SearchX } from "lucide-react";
import { AccordMark } from "@/components/AccordMark";
import { AlternativeGroups } from "@/components/AlternativeGroups";
import { ForYou } from "@/components/ForYou";
import { NoteStack } from "@/components/NoteStack";
import { Shell } from "@/components/Shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { occasionLabel, performanceLabel, seasonShort } from "@/lib/catalog";
import { cn } from "@/lib/format";
import { contextFit } from "@/lib/personal-fit";
import { rememberVisit } from "@/lib/recent";
import { getReference } from "@/lib/references";
import { useAroma } from "@/lib/store";
import type { Season } from "@/lib/types";

export default function ReferencePage() {
  return (
    <Suspense>
      <ReferenceScreen />
    </Suspense>
  );
}

function ReferenceScreen() {
  const params = useParams<{ id: string }>();
  const search = useSearchParams();
  const reference = getReference(params.id);

  useEffect(() => {
    if (!reference) return;
    rememberVisit({ href: `/reference/${reference.id}`, label: reference.nameFa });
  }, [reference]);

  if (!reference) {
    return (
      <Shell back={{ href: "/", label: "خانه" }}>
        <EmptyState
          className="vf app mx-5 my-10"
          icon={SearchX}
          title="این خانواده در نمونه نیست"
          description="اسم عطر را دوباره بنویس، یا از پیشنهادها یکی را باز کن."
          action={
            <Button href="/" className="min-h-11">
              برگشت به خانه
            </Button>
          }
        />
      </Shell>
    );
  }

  const season = reference.seasons.map((id) => (id === "mild" ? "معتدل" : seasonShort(id))).join("، ");
  const places = reference.occasions.map((id) => occasionLabel(id)).join("، ");
  const askedSeason = askedSeasonOf(search.get("season"));
  const budgetRaw = search.get("budget");
  const budget = budgetRaw && Number(budgetRaw) > 0 ? Number(budgetRaw) : null;
  const context = contextFit(reference, { occasion: search.get("occasion"), season: askedSeason });

  return (
    <Shell back={{ href: "/", label: "خانه" }}>
      <article className="vf app step-in px-5 pt-4 pb-[max(2.5rem,env(safe-area-inset-bottom))]">
        <header>
          <h1 className="text-balance text-display font-bold">{reference.nameFa}</h1>
          <p className="mt-1 text-label text-muted-foreground">
            <bdi dir="ltr">{reference.nameEn}</bdi>
          </p>
          <p className="mt-3 text-pretty text-body">{reference.line}</p>
        </header>

        <div className="mt-4">
          <AccordMark accords={reference.accords} names />
        </div>
        <p className="mt-3 text-pretty text-body">{reference.why}</p>

        <Card className="mt-4 grid grid-cols-2 p-0">
          <Stat label="فصل" value={season} className="border-b border-e border-border" />
          <Stat label="کجا" value={places} className="border-b border-border" />
          <Stat
            label="ماندگاری"
            term="longevity-sillage"
            value={performanceLabel("longevity", reference.longevity)}
            className="border-e border-border"
          />
          <Stat label="پخش بو" term="longevity-sillage" value={performanceLabel("sillage", reference.sillage)} />
        </Card>
        <p className="mt-2 text-pretty text-label text-muted-foreground">
          حس رایج خانواده است، نه یک شیشهٔ مشخص. نسخه‌ها فرق دارند و اینجا فروخته نمی‌شود.
        </p>

        <ForYou
          face={{
            nameFa: reference.nameFa,
            accords: reference.accords,
            notes: reference.notes,
            seasons: reference.seasons,
            occasions: reference.occasions,
          }}
          context={context}
        />

        <section className="mt-8" aria-labelledby="pyramid-title">
          <h2 id="pyramid-title" className="text-title font-semibold">
            هرم بو
          </h2>
          <Card className="mt-3 px-4">
            <NoteStack notes={reference.notes} />
          </Card>
        </section>

        <AlternativeGroups reference={reference} from={`/reference/${reference.id}`} budget={budget} />
      </article>
    </Shell>
  );
}

function Stat({
  label,
  value,
  term,
  className,
}: {
  label: string;
  value: string;
  term?: string;
  className?: string;
}) {
  const { openTerm } = useAroma();
  const body = (
    <>
      <span className="block text-label text-muted-foreground">{label}</span>
      <span className="mt-1 block text-pretty text-body font-semibold">{value}</span>
    </>
  );
  if (!term) {
    return <div className={cn("flex min-h-16 flex-col justify-center px-4 py-3", className)}>{body}</div>;
  }
  return (
    <button
      type="button"
      onClick={() => openTerm(term)}
      className={cn(
        "flex h-full min-h-16 w-full flex-col justify-center px-4 py-3 text-start outline-offset-2 transition-colors hover:bg-press focus-visible:outline-2 focus-visible:outline-ring",
        className,
      )}
    >
      {body}
    </button>
  );
}

function askedSeasonOf(value: string | null): Season | null {
  if (value === "summer" || value === "winter" || value === "mild") return value;
  return null;
}
