"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Shell } from "@/components/Shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { guidePrice, publicLead } from "@/lib/catalog";
import { cn, millionToman } from "@/lib/format";
import { perfumeHref } from "@/lib/nav";
import { noteHref } from "@/lib/notes";
import { paletteMatches, topNoteNames } from "@/lib/palette";

export default function PalettePage() {
  return (
    <Suspense>
      <PaletteScreen />
    </Suspense>
  );
}

function PaletteScreen() {
  const search = useSearchParams();
  const notes = useMemo(() => topNoteNames(12), []);
  const [picked, setPicked] = useState<string[]>(() => search.getAll("n").filter(Boolean).slice(0, 3));
  const matches = useMemo(() => paletteMatches(picked), [picked]);

  function toggle(name: string) {
    setPicked((current) => {
      if (current.includes(name)) return current.filter((item) => item !== name);
      if (current.length >= 3) return [...current.slice(0, 2), name];
      return [...current, name];
    });
  }

  return (
    <Shell back={{ href: "/", label: "خانه" }}>
      <div className="vf app px-5 pt-6 pb-[max(2.5rem,env(safe-area-inset-bottom))]">
        <header>
          <h1 className="text-balance text-display font-bold">از روی نت</h1>
          <p className="mt-2 text-pretty text-body text-muted-foreground">
            تا سه نت را انتخاب کن. عطرهایی که همان نت‌ها را دارند جلو می‌آیند؛ اگر نت در پایه باشد، کمی جلوتر.
          </p>
        </header>

        <ul className="mt-6 flex flex-wrap justify-start gap-2" aria-label="نت‌ها">
          {notes.map((name) => {
            const on = picked.includes(name);
            return (
              <li key={name}>
                <Button
                  type="button"
                  variant={on ? "default" : "outline"}
                  aria-pressed={on}
                  onClick={() => toggle(name)}
                  className={cn("min-h-11 rounded-full! px-4 font-medium", !on && "bg-card!")}
                >
                  {name}
                </Button>
              </li>
            );
          })}
        </ul>
        <p className="mt-2 text-label text-muted-foreground">حداکثر سه نت. اگر چهارمی را بزنی، سومی عوض می‌شود.</p>

        {picked.length === 0 ? (
          <p className="mt-8 text-pretty text-body text-muted-foreground">هنوز نتی انتخاب نشده.</p>
        ) : matches.length === 0 ? (
          <p className="mt-8 text-pretty text-body text-muted-foreground">با این نت‌ها عطری در نمونه نیست.</p>
        ) : (
          <ul className="mt-8 flex flex-col gap-3">
            {matches.map((hit) => {
              const offer = publicLead(hit.perfume);
              const guide = guidePrice(hit.perfume);
              return (
                <li key={hit.perfume.slug}>
                  <Card className="p-0">
                    <Button
                      href={perfumeHref(hit.perfume.slug, "/palette")}
                      variant="ghost"
                      className="h-auto! min-h-16 w-full justify-between! whitespace-normal! px-4 py-3 text-start font-normal"
                    >
                      <span className="min-w-0">
                        <span className="block text-body font-semibold">{hit.perfume.nameFa}</span>
                        <span className="mt-1 block text-pretty text-label">{hit.reason}</span>
                        <span className="mt-1 block text-label text-muted-foreground">
                          {hit.perfume.brand}
                          {offer ? ` · ${millionToman(offer.price)}` : guide ? ` · حدود ${millionToman(guide)}` : ""}
                        </span>
                      </span>
                      <ChevronLeft strokeWidth={1.5} className="size-4 shrink-0" aria-hidden="true" />
                    </Button>
                  </Card>
                </li>
              );
            })}
          </ul>
        )}

        {picked.length === 1 ? (
          <Button href={noteHref(picked[0], "/palette")} variant="ghost" className="mt-4 min-h-11 px-0! font-medium">
            صفحهٔ نت {picked[0]}
          </Button>
        ) : null}

        <p className="mt-8 text-pretty text-label text-muted-foreground">
          این هم‌پوشانی نت در کاتالوگ است، نه ساخت عطر و نه شباهت کامل بو.
        </p>
      </div>
    </Shell>
  );
}
