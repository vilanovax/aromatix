"use client";

import { useEffect, useMemo, useState } from "react";
import { PerfumeCard } from "@/components/PerfumeCard";
import { Shell } from "@/components/Shell";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { higherBudget } from "@/lib/budgets";
import { LEANINGS, getPerfume } from "@/lib/catalog";
import { computeDna } from "@/lib/dna";
import { countWord, faNum } from "@/lib/format";
import { matchPerfumes, resultHeading, suggestForTaste } from "@/lib/match";
import { perfumeHref } from "@/lib/nav";
import { useAroma } from "@/lib/store";
import { recordUsages } from "@/lib/usage";
import type { Leaning, Profile } from "@/lib/types";

export default function ResultsPage() {
  const { ready, profile, setProfile, library } = useAroma();
  const results = useMemo(() => (profile ? matchPerfumes(profile, library) : []), [profile, library]);
  const dna = useMemo(() => computeDna(library, getPerfume), [library]);
  const taste = useMemo(
    () => (dna.stage === "early" || dna.stage === "dna" ? suggestForTaste(library, 3) : []),
    [dna.stage, library],
  );
  useEffect(() => {
    if (results.length === 0) return;
    recordUsages(
      "recommendation",
      results.map((perfume) => perfume.slug),
    );
  }, [results]);

  return (
    <Shell composer back={{ href: "/", label: "شروع" }}>
      {!ready ? (
        <div className="vf app px-5 py-8 text-body text-muted-foreground" aria-busy="true">
          در حال آماده‌سازی…
        </div>
      ) : !profile ? (
        <EmptyState
          className="vf app mx-5 my-8"
          title="هنوز پیشنهادی نداری"
          description="از صفحهٔ شروع یک توصیف بنویس، یا با چند سؤال کوتاه راهنمایی شو."
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <Button href="/" className="min-h-11">
                رفتن به شروع
              </Button>
              <Button href="/guide" variant="outline" className="min-h-11">
                سؤال‌های کوتاه
              </Button>
              <Button href="/browse" variant="outline" className="min-h-11">
                فیلتر
              </Button>
            </div>
          }
        />
      ) : (
        <div className="vf app px-4 pt-5 pb-8">
          <header>
            <h1 className="text-balance text-headline font-bold">{resultHeading(profile, results.length)}</h1>
            <p className="mt-2 text-pretty text-body text-muted-foreground">
              {profile.budget != null ? `تا ${faNum(profile.budget)} میلیون تومان` : "بدون سقف بودجه"}
              {profile.leaning && profile.leaning !== "any" ? ` · ${LEANINGS[profile.leaning].label}` : ""}
              {results.length > 0 && results.length < 5
                ? ` · فقط ${countWord(results.length)} پیشنهاد مطمئن`
                : ""}
            </p>
            {profile.note ? <Alert className="mt-3">{profile.note}</Alert> : null}
            {dna.stage === "early" || dna.stage === "dna" ? (
              <Card className="mt-4 p-4">
                <p className="text-label text-muted-foreground">سلیقهٔ تو</p>
                <p className="mt-2 text-pretty text-body">{dna.sentence}</p>
                {taste.length > 0 ? (
                  <ul className="mt-3 flex flex-col gap-2">
                    {taste.map((perfume) => (
                      <li key={perfume.slug}>
                        <Button
                          href={perfumeHref(perfume.slug, "/results")}
                          variant="ghost"
                          className="min-h-11 w-full justify-start! px-0! font-medium"
                        >
                          {perfume.nameFa}
                        </Button>
                      </li>
                    ))}
                  </ul>
                ) : null}
                <CopyLine text={dna.sentence} />
              </Card>
            ) : null}
            {results.length > 0 && profile.leaning == null ? (
              <LeaningQuestion profile={profile} onPick={setProfile} />
            ) : null}
          </header>

          {results.length === 0 ? (
            <Card className="mt-8 p-4">
              <p className="text-pretty text-body">
                {profile.budget != null
                  ? `با بودجهٔ تا ${faNum(profile.budget)} میلیون، برای این موقعیت عطر مطمئنی در این نمونه نیست.`
                  : "برای این موقعیت عطر مطمئنی در این نمونه نیست."}
              </p>
              {profile.budget != null && higherBudget(profile.budget) != null ? (
                <Button
                  className="mt-4 min-h-12 w-full"
                  onClick={() =>
                    setProfile({
                      ...profile,
                      budget: higherBudget(profile.budget!),
                      note: "سقف بودجه بالاتر رفت.",
                    })
                  }
                >
                  بودجه را تا {faNum(higherBudget(profile.budget)!)} میلیون بالا ببر
                </Button>
              ) : (
                <Button href="/guide" variant="ghost" className="mt-4 min-h-12 w-full">
                  سؤال‌ها را عوض کن
                </Button>
              )}
            </Card>
          ) : (
            <ol className="mt-5 flex list-none flex-col gap-4 p-0">
              {results.map((perfume, index) => (
                <li key={perfume.slug}>
                  <PerfumeCard perfume={perfume} rank={index + 1} />
                </li>
              ))}
            </ol>
          )}
        </div>
      )}
    </Shell>
  );
}

function CopyLine({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      type="button"
      variant="outline"
      className="mt-3 min-h-11 w-full bg-card!"
      onClick={() => {
        void navigator.clipboard.writeText(text).then(
          () => setCopied(true),
          () => setCopied(false),
        );
      }}
    >
      {copied ? "جمله کپی شد" : "کپی جملهٔ سلیقه"}
    </Button>
  );
}

function LeaningQuestion({ profile, onPick }: { profile: Profile; onPick: (profile: Profile) => void }) {
  const fresh =
    profile.season === "summer" ||
    (profile.occasions.length > 0 && profile.occasions.every((id) => id === "office" || id === "sport"));
  const pair: [Leaning, Leaning] = fresh ? ["citrus", "aquatic"] : ["sweet", "woody"];

  return (
    <div role="group" aria-label="گرایش بو، اختیاری" className="mt-4 flex flex-wrap justify-start gap-2">
      {pair.map((id) => (
        <Button
          key={id}
          type="button"
          variant="outline"
          size="md"
          onClick={() => onPick({ ...profile, leaning: id, note: LEANINGS[id].note })}
          className="min-h-11 !rounded-full !bg-card px-4 font-medium"
        >
          {LEANINGS[id].label}
        </Button>
      ))}
      <Button
        type="button"
        variant="ghost"
        size="md"
        onClick={() => onPick({ ...profile, leaning: "any" })}
        className="min-h-11 !rounded-full px-4 font-normal text-muted-foreground"
      >
        فرقی نمی‌کنه
      </Button>
    </div>
  );
}
