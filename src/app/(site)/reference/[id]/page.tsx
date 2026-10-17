"use client";

import { Suspense, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { SearchX } from "lucide-react";
import { AccordMark } from "@/components/AccordMark";
import { AlternativeGroups } from "@/components/AlternativeGroups";
import { ForYou } from "@/components/ForYou";
import { NoteStack } from "@/components/NoteStack";
import { Shell } from "@/components/Shell";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { occasionLabel, performanceLabel, seasonShort } from "@/lib/catalog";
import { TermChip } from "@/components/TermSheet";
import { contextFit } from "@/lib/personal-fit";
import { rememberVisit } from "@/lib/recent";
import { getReference } from "@/lib/references";
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

  const season = reference.seasons.map((id) => seasonShort(id)).join("، ");
  const places = reference.occasions.map((id) => occasionLabel(id)).join("، ");
  const askedSeason = askedSeasonOf(search.get("season"));
  const budgetRaw = search.get("budget");
  const budget = budgetRaw && Number(budgetRaw) > 0 ? Number(budgetRaw) : null;
  const context = contextFit(reference, { occasion: search.get("occasion"), season: askedSeason });

  return (
    <Shell back={{ href: "/", label: "خانه" }}>
      <article className="vf app step-in px-5 pt-4 pb-[max(2.5rem,env(safe-area-inset-bottom))]">
        <header>
          <p className="text-label text-muted-foreground">حال‌وهوای خانواده</p>
          <h1 className="mt-1 text-balance text-display font-bold">{reference.nameFa}</h1>
          <p className="mt-1 text-body text-muted-foreground">
            <span dir="ltr" className="inline-block">
              {reference.nameEn}
            </span>
          </p>
          <p className="mt-3 text-pretty text-body">{reference.line}</p>
        </header>

        <div className="mt-4">
          <AccordMark accords={reference.accords} names />
        </div>
        <Alert className="mt-4">{reference.why}</Alert>
        <p className="mt-3 text-pretty text-label text-muted-foreground">
          این شناسنامهٔ خانواده است، نه یک شیشهٔ مشخص. نسخه‌ها با هم فرق دارند و اینجا جدا ثبت نشده‌اند. در فروشگاه‌های همین نمونه فروخته نمی‌شود.
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

        <Card className="mt-8 px-4">
          <dl className="divide-y divide-border">
            <Fact label="فصل" value={season} />
            <Fact label="کجا" value={places} />
            <Fact label="ماندگاری" term="longevity-sillage" value={performanceLabel("longevity", reference.longevity)} />
            <Fact label="پخش بو" term="longevity-sillage" value={performanceLabel("sillage", reference.sillage)} />
          </dl>
        </Card>
        <p className="mt-2 text-pretty text-label text-muted-foreground">
          این حس رایج خانواده است، نه اندازهٔ یک شیشه. تجربه‌ها فرق می‌کند.
        </p>

        <section className="mt-8" aria-labelledby="pyramid-title">
          <h2 id="pyramid-title" className="text-title font-semibold">
            هرم بو
          </h2>
          <NoteStack notes={reference.notes} />
        </section>

        <AlternativeGroups reference={reference} from={`/reference/${reference.id}`} budget={budget} />
      </article>
    </Shell>
  );
}

function Fact({ label, value, term }: { label: string; value: string; term?: string }) {
  return (
    <div className="flex items-center justify-between gap-3 py-3 text-body">
      <dt className="shrink-0">
        {term ? <TermChip slug={term}>{label}</TermChip> : <span className="text-label text-muted-foreground">{label}</span>}
      </dt>
      <dd className="min-w-0 text-pretty text-end">{value}</dd>
    </div>
  );
}

function askedSeasonOf(value: string | null): Season | null {
  if (value === "summer" || value === "winter" || value === "mild") return value;
  return null;
}
