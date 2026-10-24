"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Shell } from "@/components/Shell";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { budgetChoices } from "@/lib/budgets";
import { OCCASIONS, SEASONS, publishedPerfumes } from "@/lib/catalog";
import { cn, joinFa } from "@/lib/format";
import { useAroma } from "@/lib/store";
import type { Season } from "@/lib/types";

const SEASON_CHOICES = SEASONS.filter((item) => item.id !== "all");

export default function BrowsePage() {
  const router = useRouter();
  const { setProfile } = useAroma();
  const accords = useMemo(() => topAccords(8), []);
  const [occasion, setOccasion] = useState<string | null>(null);
  const [season, setSeason] = useState<Season>("all");
  const [budget, setBudget] = useState<number | null>(null);
  const [picked, setPicked] = useState<string[]>([]);
  const [error, setError] = useState(false);

  function toggleAccord(name: string) {
    setError(false);
    setPicked((current) => {
      if (current.includes(name)) return current.filter((item) => item !== name);
      if (current.length >= 2) return current;
      return [...current, name];
    });
  }

  function submit() {
    const empty = !occasion && season === "all" && budget == null && picked.length === 0;
    if (empty) {
      setError(true);
      return;
    }
    const bits: string[] = [];
    if (occasion) bits.push(OCCASIONS.find((item) => item.id === occasion)?.label ?? "");
    if (season !== "all") bits.push(SEASONS.find((item) => item.id === season)?.short ?? "");
    if (picked.length > 0) bits.push(joinFa(picked));
    setProfile({
      occasions: occasion ? [occasion] : [],
      season,
      budget,
      reference: null,
      shift: "none",
      accords: picked,
      note: bits.filter(Boolean).length > 0 ? `فیلتر: ${bits.filter(Boolean).join("، ")}.` : null,
    });
    router.push("/results");
  }

  return (
    <Shell back={{ href: "/", label: "خانه" }}>
      <div className="vf app flex min-h-full flex-col px-5 pt-6 pb-[max(2rem,env(safe-area-inset-bottom))]">
        <header>
          <h1 className="text-balance text-display font-bold">با فیلتر بگرد</h1>
          <p className="mt-2 text-pretty text-body text-muted-foreground">
            فصل، موقعیت، بودجه و حداکثر دو آکورد. بعدش همان پیشنهادها را می‌بینی.
          </p>
        </header>

        <fieldset className="mt-8">
          <legend className="text-title font-semibold">کجا؟</legend>
          <ul className="mt-3 flex flex-wrap justify-start gap-2">
            {OCCASIONS.map((item) => (
              <li key={item.id}>
                <Button
                  type="button"
                  variant={occasion === item.id ? "default" : "outline"}
                  aria-pressed={occasion === item.id}
                  onClick={() => {
                    setError(false);
                    setOccasion((current) => (current === item.id ? null : item.id));
                  }}
                  className={cn("min-h-11 rounded-full! px-4 font-medium", occasion !== item.id && "bg-card!")}
                >
                  {item.label}
                </Button>
              </li>
            ))}
          </ul>
        </fieldset>

        <fieldset className="mt-8">
          <legend className="text-title font-semibold">فصل</legend>
          <ul className="mt-3 flex flex-wrap justify-start gap-2">
            {SEASON_CHOICES.map((item) => (
              <li key={item.id}>
                <Button
                  type="button"
                  variant={season === item.id ? "default" : "outline"}
                  aria-pressed={season === item.id}
                  onClick={() => {
                    setError(false);
                    setSeason((current) => (current === item.id ? "all" : (item.id as Season)));
                  }}
                  className={cn("min-h-11 rounded-full! px-4 font-medium", season !== item.id && "bg-card!")}
                >
                  {item.short}
                </Button>
              </li>
            ))}
          </ul>
        </fieldset>

        <fieldset className="mt-8">
          <legend className="text-title font-semibold">سقف بودجه</legend>
          <ul className="mt-3 flex flex-wrap justify-start gap-2">
            {budgetChoices().map((item) => (
              <li key={item.id}>
                <Button
                  type="button"
                  variant={budget === item.id ? "default" : "outline"}
                  aria-pressed={budget === item.id}
                  onClick={() => {
                    setError(false);
                    setBudget((current) => (current === item.id ? null : item.id));
                  }}
                  className={cn("min-h-11 rounded-full! px-4 font-medium", budget !== item.id && "bg-card!")}
                >
                  {item.label}
                </Button>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-label text-muted-foreground">اگر چیزی نزنی، سقف بودجه نمی‌گذاریم.</p>
        </fieldset>

        {accords.length > 0 ? (
          <fieldset className="mt-8">
            <legend className="text-title font-semibold">آکورد</legend>
            <p className="mt-1 text-label text-muted-foreground">حداکثر دو تا.</p>
            <ul className="mt-3 flex flex-wrap justify-start gap-2">
              {accords.map((name) => {
                const on = picked.includes(name);
                const blocked = !on && picked.length >= 2;
                return (
                  <li key={name}>
                    <Button
                      type="button"
                      variant={on ? "default" : "outline"}
                      aria-pressed={on}
                      disabled={blocked}
                      onClick={() => toggleAccord(name)}
                      className={cn("min-h-11 rounded-full! px-4 font-medium", !on && "bg-card!")}
                    >
                      {name}
                    </Button>
                  </li>
                );
              })}
            </ul>
          </fieldset>
        ) : null}

        {error ? (
          <Alert variant="destructive" className="mt-6">
            حداقل یک موقعیت، فصل، بودجه یا آکورد را انتخاب کن.
          </Alert>
        ) : null}

        <Button type="button" size="lg" className="mt-8 min-h-12 w-full" onClick={submit}>
          دیدن پیشنهادها
        </Button>
      </div>
    </Shell>
  );
}

function topAccords(limit: number) {
  const counts = new Map<string, number>();
  for (const perfume of publishedPerfumes()) {
    for (const accord of perfume.accords.slice(0, 3)) {
      counts.set(accord.name, (counts.get(accord.name) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "fa"))
    .slice(0, limit)
    .map(([name]) => name);
}
