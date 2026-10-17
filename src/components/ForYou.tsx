"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { personalFit, type ScentFace, type TasteLevel } from "@/lib/personal-fit";
import { useAroma } from "@/lib/store";

const LEVEL: Record<TasteLevel, string> = {
  close: "خیلی نزدیک سلیقه‌ات",
  partial: "تا حدی",
  far: "دور از سلیقه‌ات",
};

export function ForYou({ face, context }: { face: ScentFace; context?: string | null }) {
  const { library, ready } = useAroma();
  if (!ready) return <div className="mt-5 min-h-24" aria-busy="true" />;

  const fit = personalFit(face, library);

  return (
    <section className="mt-5" aria-labelledby="for-you-title">
      <h2 id="for-you-title" className="text-title font-semibold">
        برای تو
      </h2>
      <Card className="mt-3 p-4">
        {fit.level ? <Badge className="rounded-full bg-secondary px-3 text-foreground">{LEVEL[fit.level]}</Badge> : null}
        {fit.early && fit.level ? (
          <p className="mt-2 text-pretty text-label text-muted-foreground">بر اساس انتخاب‌های اولیه‌ات.</p>
        ) : null}
        <div className={fit.level ? "mt-2" : ""}>
          {fit.lines.map((line) => (
            <p key={line} className="text-pretty text-body">
              {line}
            </p>
          ))}
        </div>
        {context ? <p className="mt-2 text-pretty text-body">{context}</p> : null}
        {fit.level == null ? (
          <Button href="/shelf" variant="outline" className="mt-3 min-h-11 w-full">
            رفتن به قفسه
          </Button>
        ) : null}
      </Card>
    </section>
  );
}
