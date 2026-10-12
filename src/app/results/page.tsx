"use client";

import { useMemo } from "react";
import { Button, ButtonLink } from "@/components/Button";
import { Card, Note } from "@/components/Card";
import { Chip } from "@/components/Chip";
import { PerfumeCard } from "@/components/PerfumeCard";
import { Shell } from "@/components/Shell";
import { LEANINGS } from "@/lib/catalog";
import { countWord, faNum } from "@/lib/format";
import { matchPerfumes, resultHeading } from "@/lib/match";
import { useAroma } from "@/lib/store";
import type { Leaning, Profile } from "@/lib/types";

export default function ResultsPage() {
  const { ready, profile, setProfile, library } = useAroma();
  const results = useMemo(() => (profile ? matchPerfumes(profile, library) : []), [profile, library]);

  return (
    <Shell composer back={{ href: "/", label: "شروع" }}>
      {!ready ? (
        <div className="px-5 py-8 text-body text-muted" aria-busy="true">
          در حال آماده‌سازی…
        </div>
      ) : !profile ? (
        <div className="px-5 py-8">
          <h1 className="text-headline font-bold">هنوز پیشنهادی نداری</h1>
          <p className="mt-2 max-w-[22rem] text-pretty text-body text-muted">
            از صفحهٔ شروع یک توصیف بنویس، یا با چند سؤال کوتاه راهنمایی شو.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <ButtonLink href="/" size="lg">
              رفتن به شروع
            </ButtonLink>
            <ButtonLink href="/guide" variant="edge" size="lg">
              سؤال‌های کوتاه
            </ButtonLink>
          </div>
        </div>
      ) : (
        <div className="px-4 pt-5 pb-8">
          <header>
            <h1 className="text-balance text-headline font-bold">{resultHeading(profile, results.length)}</h1>
            <p className="mt-2 text-pretty text-body text-muted">
              تا {faNum(profile.budget)} میلیون تومان
              {profile.leaning && profile.leaning !== "any" ? ` · ${LEANINGS[profile.leaning].label}` : ""}
              {results.length > 0 && results.length < 5
                ? ` · فقط ${countWord(results.length)} پیشنهاد مطمئن`
                : ""}
            </p>
            {profile.note ? <Note className="mt-3">{profile.note}</Note> : null}
            {results.length > 0 && profile.leaning == null ? (
              <LeaningQuestion profile={profile} onPick={setProfile} />
            ) : null}
          </header>

          {results.length === 0 ? (
            <Card className="mt-8 p-4">
              <p className="text-pretty text-body">
                با بودجهٔ تا {faNum(profile.budget)} میلیون، برای این موقعیت عطر مطمئنی در این نمونه نیست.
              </p>
              {profile.budget < 8 ? (
                <Button
                  className="mt-4 w-full"
                  onClick={() =>
                    setProfile({
                      ...profile,
                      budget: profile.budget === 2 ? 5 : 8,
                      note: "سقف بودجه بالاتر رفت.",
                    })
                  }
                >
                  بودجه را تا {faNum(profile.budget === 2 ? 5 : 8)} میلیون بالا ببر
                </Button>
              ) : (
                <ButtonLink href="/guide" variant="quiet" size="lg" className="mt-4 font-medium">
                  سؤال‌ها را عوض کن
                </ButtonLink>
              )}
            </Card>
          ) : (
            <ol className="mt-5 flex list-none flex-col gap-3.5 p-0">
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

function LeaningQuestion({ profile, onPick }: { profile: Profile; onPick: (profile: Profile) => void }) {
  const fresh =
    profile.season === "summer" ||
    (profile.occasions.length > 0 && profile.occasions.every((id) => id === "office" || id === "sport"));
  const pair: [Leaning, Leaning] = fresh ? ["citrus", "aquatic"] : ["sweet", "woody"];

  return (
    <div role="group" aria-label="گرایش بو، اختیاری" className="mt-3.5 flex flex-wrap items-center gap-2">
      {pair.map((id) => (
        <Chip key={id} onClick={() => onPick({ ...profile, leaning: id, note: LEANINGS[id].note })}>
          {LEANINGS[id].label}
        </Chip>
      ))}
      <Chip muted onClick={() => onPick({ ...profile, leaning: "any" })}>
        فرقی نمی‌کنه
      </Chip>
    </div>
  );
}
