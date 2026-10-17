"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { personalFit, type FitLink, type ScentFace, type TasteLevel } from "@/lib/personal-fit";
import { useAroma } from "@/lib/store";

const LEVEL: Record<TasteLevel, string> = {
  close: "خیلی نزدیک سلیقه‌ات",
  partial: "تا حدی",
  far: "دور از سلیقه‌ات",
};

const TONE: Record<FitLink["tone"], string> = {
  like: "دوست داشتی",
  dislike: "نپسندیدی",
};

export function ForYou({ face, context }: { face: ScentFace; context?: string | null }) {
  const { library, ready } = useAroma();
  if (!ready) return <div className="mt-8 min-h-24" aria-busy="true" />;

  const fit = personalFit(face, library);

  return (
    <section className="mt-8" aria-labelledby="for-you-title">
      <div className="flex flex-wrap items-center gap-2">
        <h2 id="for-you-title" className="text-title font-semibold">
          برای تو
        </h2>
        {fit.level ? <Badge className="rounded-full bg-secondary px-3 text-foreground">{LEVEL[fit.level]}</Badge> : null}
      </div>
      {fit.early && fit.level ? (
        <p className="mt-1 text-label text-muted-foreground">بر اساس انتخاب‌های اولیه‌ات.</p>
      ) : null}
      <Card className="mt-3 divide-y divide-border p-0">
        {fit.links.length > 0
          ? fit.links.map((link) => (
              <div key={link.tone} className="px-4 py-3">
                <p className="text-label text-muted-foreground">{TONE[link.tone]}</p>
                <p className="mt-1 text-body font-semibold">
                  {link.name}
                  {link.tone === "like" ? (
                    <span className="ms-2 font-normal text-muted-foreground">{link.mark}</span>
                  ) : null}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="text-label text-muted-foreground">مشترک</span>
                  <ul className="flex flex-wrap gap-2" aria-label="وجه‌های مشترک">
                    {link.shared.map((name) => (
                      <li key={name} className="rounded-full bg-secondary px-3 py-1 text-label text-foreground">
                        {name}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))
          : fit.lines.map((line) => (
              <p key={line} className="px-4 py-3 text-pretty text-body">
                {line}
              </p>
            ))}
        {context ? <p className="px-4 py-3 text-pretty text-body">{context}</p> : null}
        {fit.level == null ? (
          <div className="px-4 py-3">
            <Button href="/shelf" variant="outline" className="min-h-11 w-full">
              رفتن به قفسه
            </Button>
          </div>
        ) : null}
      </Card>
    </section>
  );
}
