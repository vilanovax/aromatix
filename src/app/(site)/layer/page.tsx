"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Layers } from "lucide-react";
import { Shell } from "@/components/Shell";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getPerfume, isPublicPerfume, publishedPerfumes } from "@/lib/catalog";
import { cn } from "@/lib/format";
import { layerPlan } from "@/lib/layering";
import { perfumeHref } from "@/lib/nav";
import { shelfBucket } from "@/lib/dna";
import { useAroma } from "@/lib/store";
import type { Perfume } from "@/lib/types";

export default function LayerPage() {
  return (
    <Suspense>
      <LayerScreen />
    </Suspense>
  );
}

function LayerScreen() {
  const search = useSearchParams();
  const { ready, library } = useAroma();
  const preset = [search.get("a"), search.get("b")].filter((slug): slug is string => Boolean(slug));
  const [picked, setPicked] = useState<string[]>(preset.slice(0, 2));
  const [query, setQuery] = useState("");

  const shelf = useMemo(() => {
    return Object.entries(library)
      .map(([slug, state]) => ({ perfume: getPerfume(slug), state }))
      .filter(
        (entry): entry is { perfume: Perfume; state: NonNullable<typeof entry.state> } =>
          Boolean(entry.perfume && entry.state && isPublicPerfume(entry.perfume) && shelfBucket(entry.state) !== "disliked" && shelfBucket(entry.state)),
      )
      .map((entry) => entry.perfume);
  }, [library]);

  const catalog = useMemo(() => {
    const text = query.trim();
    const pool = publishedPerfumes().filter((perfume) => !shelf.some((item) => item.slug === perfume.slug));
    if (!text) return pool.slice(0, 8);
    return pool
      .filter((perfume) =>
        `${perfume.nameFa} ${perfume.nameEn} ${perfume.brand}`.toLowerCase().includes(text.toLowerCase()),
      )
      .slice(0, 8);
  }, [query, shelf]);

  const left = picked[0] ? getPerfume(picked[0]) : undefined;
  const right = picked[1] ? getPerfume(picked[1]) : undefined;
  const plan =
    left && right && isPublicPerfume(left) && isPublicPerfume(right) ? layerPlan(left, right) : null;

  function toggle(slug: string) {
    setPicked((current) => {
      if (current.includes(slug)) return current.filter((item) => item !== slug);
      if (current.length >= 2) return [current[1], slug];
      return [...current, slug];
    });
  }

  return (
    <Shell back={{ href: "/shelf", label: "آرومای من" }}>
      <div className="vf app px-5 pt-6 pb-[max(2.5rem,env(safe-area-inset-bottom))]">
        <header>
          <h1 className="text-balance text-display font-bold">لایه‌کردن دو عطر</h1>
          <p className="mt-2 text-pretty text-body text-muted-foreground">
            دو عطر را انتخاب کن. می‌گوییم کدام را اول بزنی تا بوی سبک زیر سنگین گم نشود.
          </p>
        </header>

        {!ready ? (
          <p className="mt-8 text-body text-muted-foreground" aria-busy="true">
            در حال آماده‌سازی…
          </p>
        ) : (
          <>
            {plan ? <PlanCard plan={plan} /> : null}

            <section className="mt-8" aria-labelledby="pick-title">
              <h2 id="pick-title" className="text-title font-semibold">
                انتخاب
              </h2>
              <p className="mt-1 text-label text-muted-foreground">حداکثر دو عطر. اگر سومی را بزنی، انتخاب دوم عوض می‌شود.</p>
              {shelf.length > 0 ? (
                <Picker title="از قفسه" perfumes={shelf} picked={picked} onToggle={toggle} />
              ) : (
                <p className="mt-3 text-pretty text-body text-muted-foreground">
                  قفسه هنوز عطری ندارد. از کاتالوگ پایین انتخاب کن، یا در صفحهٔ عطر «می‌خوام» را بزن.
                </p>
              )}

              <label className="mt-6 block text-label text-muted-foreground" htmlFor="layer-search">
                جستجو در بقیهٔ کاتالوگ
              </label>
              <Input
                id="layer-search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="مثلاً خمره"
                className="mt-2 min-h-11"
              />
              <Picker title={query.trim() ? "نتیجه" : "از کاتالوگ"} perfumes={catalog} picked={picked} onToggle={toggle} />
            </section>

            <p className="mt-8 text-pretty text-label text-muted-foreground">
              سنگین‌تر را اول می‌زنیم. این از روی ماندگاری، پخش بو و آکورد است، نه تست روی پوست و نه تبلیغ فروشگاه.
            </p>
          </>
        )}
      </div>
    </Shell>
  );
}

function PlanCard({ plan }: { plan: NonNullable<ReturnType<typeof layerPlan>> }) {
  return (
    <Card className="mt-6 p-4">
      <p className="flex items-center gap-2 text-label text-muted-foreground">
        <Layers strokeWidth={1.5} className="size-4" aria-hidden="true" />
        ترتیب زدن
      </p>
      <p className="mt-2 text-pretty text-body font-semibold">{plan.line}</p>
      <ol className="mt-4 flex flex-col gap-2">
        <li>
          <Button href={perfumeHref(plan.first.slug, "/layer")} variant="outline" className="min-h-11 w-full justify-between! bg-card!">
            <span>اول، زیر: {plan.first.nameFa}</span>
          </Button>
        </li>
        <li>
          <Button href={perfumeHref(plan.second.slug, "/layer")} variant="outline" className="min-h-11 w-full justify-between! bg-card!">
            <span>بعد، رو: {plan.second.nameFa}</span>
          </Button>
        </li>
      </ol>
      {plan.caution ? (
        <Alert variant="warning" className="mt-4">
          {plan.caution}
        </Alert>
      ) : null}
    </Card>
  );
}

function Picker({
  title,
  perfumes,
  picked,
  onToggle,
}: {
  title: string;
  perfumes: Perfume[];
  picked: string[];
  onToggle: (slug: string) => void;
}) {
  if (perfumes.length === 0) return null;
  return (
    <div className="mt-4">
      <h3 className="text-label text-muted-foreground">{title}</h3>
      <ul className="mt-2 flex flex-wrap justify-start gap-2">
        {perfumes.map((perfume) => {
          const on = picked.includes(perfume.slug);
          return (
            <li key={perfume.slug}>
              <Button
                type="button"
                variant={on ? "default" : "outline"}
                aria-pressed={on}
                onClick={() => onToggle(perfume.slug)}
                className={cn("min-h-11 rounded-full! px-4 font-medium", !on && "bg-card!")}
              >
                {perfume.nameFa}
              </Button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
