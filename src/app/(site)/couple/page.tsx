"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Users } from "lucide-react";
import { Shell } from "@/components/Shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { couplePlan } from "@/lib/couple";
import { getPerfume, isPublicPerfume, publishedPerfumes } from "@/lib/catalog";
import { shelfBucket } from "@/lib/dna";
import { cn } from "@/lib/format";
import { perfumeHref } from "@/lib/nav";
import { useAroma } from "@/lib/store";
import type { Perfume } from "@/lib/types";

export default function CouplePage() {
  return (
    <Suspense>
      <CoupleScreen />
    </Suspense>
  );
}

function CoupleScreen() {
  const search = useSearchParams();
  const { ready, library } = useAroma();
  const preset = [search.get("a"), search.get("b")].filter((slug): slug is string => Boolean(slug));
  const [picked, setPicked] = useState<string[]>(preset.slice(0, 2));
  const [query, setQuery] = useState("");

  const shelf = useMemo(() => {
    return Object.entries(library)
      .map(([slug, state]) => ({ perfume: getPerfume(slug), state }))
      .filter(
        (entry): entry is { perfume: Perfume; state: NonNullable<(typeof entry)["state"]> } =>
          Boolean(
            entry.perfume &&
              entry.state &&
              isPublicPerfume(entry.perfume) &&
              shelfBucket(entry.state) &&
              shelfBucket(entry.state) !== "disliked",
          ),
      )
      .map((entry) => entry.perfume);
  }, [library]);

  const catalog = useMemo(() => {
    const text = query.trim().toLowerCase();
    const pool = publishedPerfumes().filter((perfume) => !shelf.some((item) => item.slug === perfume.slug));
    if (!text) return pool.slice(0, 8);
    return pool
      .filter((perfume) => `${perfume.nameFa} ${perfume.nameEn} ${perfume.brand}`.toLowerCase().includes(text))
      .slice(0, 8);
  }, [query, shelf]);

  const left = picked[0] ? getPerfume(picked[0]) : undefined;
  const right = picked[1] ? getPerfume(picked[1]) : undefined;
  const plan = left && right && isPublicPerfume(left) && isPublicPerfume(right) ? couplePlan(left, right) : null;

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
          <h1 className="text-balance text-display font-bold">ست دونفره</h1>
          <p className="mt-2 text-pretty text-body text-muted-foreground">
            عطر خودت و همراهت را انتخاب کن. برای مهمانی، ماشین و تابستان می‌گوییم کدام پرصداتر است و کجا کمتر بزنی.
          </p>
        </header>

        {!ready ? (
          <p className="mt-8 text-body text-muted-foreground" aria-busy="true">
            در حال آماده‌سازی…
          </p>
        ) : (
          <>
            {plan ? (
              <Card className="mt-6 p-4">
                <p className="flex items-center gap-2 text-label text-muted-foreground">
                  <Users strokeWidth={1.5} className="size-4" aria-hidden="true" />
                  کنار هم
                </p>
                <p className="mt-2 text-pretty text-body font-semibold">{plan.bridge}</p>
                <div className="mt-4 flex flex-col gap-2">
                  <Button
                    href={perfumeHref(plan.lead.slug, "/couple")}
                    variant="outline"
                    className="min-h-11 w-full justify-start! bg-card!"
                  >
                    پرصداتر: {plan.lead.nameFa}
                  </Button>
                  <Button
                    href={perfumeHref(plan.quiet.slug, "/couple")}
                    variant="outline"
                    className="min-h-11 w-full justify-start! bg-card!"
                  >
                    آرام‌تر: {plan.quiet.nameFa}
                  </Button>
                </div>
                <ul className="mt-4 flex flex-col gap-3">
                  {plan.scenes.map((scene) => (
                    <li key={scene.id}>
                      <p className="text-label text-muted-foreground">{scene.title}</p>
                      <p className="mt-1 text-pretty text-body">{scene.line}</p>
                    </li>
                  ))}
                </ul>
              </Card>
            ) : null}

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
              <label className="mt-6 block text-label text-muted-foreground" htmlFor="couple-search">
                جستجو در بقیهٔ کاتالوگ
              </label>
              <Input
                id="couple-search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="مثلاً خمره"
                className="mt-2 min-h-11"
              />
              <Picker title={query.trim() ? "نتیجه" : "از کاتالوگ"} perfumes={catalog} picked={picked} onToggle={toggle} />
            </section>

            <p className="mt-8 text-pretty text-label text-muted-foreground">
              این از روی پخش بو، ماندگاری، فصل و نوت است، نه تست روی پوست و نه تبلیغ فروشگاه.
            </p>
          </>
        )}
      </div>
    </Shell>
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
