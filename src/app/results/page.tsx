"use client";

import Link from "next/link";
import { useMemo } from "react";
import { PerfumeCard } from "@/components/PerfumeCard";
import { Shell } from "@/components/Shell";
import { LEANINGS } from "@/lib/catalog";
import { countWord, faNum } from "@/lib/format";
import { matchPerfumes, resultHeading } from "@/lib/match";
import { useAroma } from "@/lib/store";
import type { Leaning, Profile } from "@/lib/types";

export default function ResultsPage() {
  const { ready, profile, setProfile, taste } = useAroma();
  const results = useMemo(() => (profile ? matchPerfumes(profile, taste) : []), [profile, taste]);

  return (
    <Shell composer back={{ href: "/", label: "شروع" }}>
      {!ready || !profile ? (
        <div className="px-5 py-8 text-body text-muted">{ready ? "از صفحهٔ شروع یک توصیف بنویس." : ""}</div>
      ) : (
        <div className="px-4 pt-5 pb-8">
          <header>
            <h1 className="text-headline font-bold">{resultHeading(profile, results.length)}</h1>
            <p className="mt-2 text-label text-muted">
              تا {faNum(profile.budget)} میلیون تومان
              {profile.leaning && profile.leaning !== "any" ? ` · ${LEANINGS[profile.leaning].label}` : ""}
              {results.length > 0 && results.length < 5
                ? ` · فقط ${countWord(results.length)} پیشنهاد مطمئن`
                : ""}
            </p>
            {profile.note ? (
              <p className="mt-3 rounded-control bg-moss px-3 py-2.5 text-body">{profile.note}</p>
            ) : null}
            {results.length > 0 && profile.leaning == null ? (
              <LeaningQuestion profile={profile} onPick={setProfile} />
            ) : null}
          </header>

          {results.length === 0 ? (
            <div className="mt-8 rounded-panel border border-line bg-card p-4">
              <p className="text-body">
                با بودجهٔ تا {faNum(profile.budget)} میلیون، برای این موقعیت عطر مطمئنی در این نمونه نیست.
              </p>
              {profile.budget < 8 ? (
                <button
                  type="button"
                  className="pressable solid mt-4 min-h-12 w-full rounded-panel bg-ink text-body leading-none font-semibold text-paper"
                  onClick={() =>
                    setProfile({
                      ...profile,
                      budget: profile.budget === 2 ? 5 : 8,
                      note: "سقف بودجه بالاتر رفت.",
                    })
                  }
                >
                  بودجه را تا {faNum(profile.budget === 2 ? 5 : 8)} میلیون بالا ببر
                </button>
              ) : (
                <Link href="/guide" className="pressable mt-4 inline-flex min-h-12 items-center text-body leading-none font-medium">
                  سؤال‌ها را عوض کن
                </Link>
              )}
            </div>
          ) : (
            <ol className="mt-4 flex list-none flex-col gap-3 p-0">
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
    <div
      role="group"
      aria-label="گرایش بو، اختیاری"
      className="mt-3 flex flex-wrap items-center gap-1.5"
    >
      {pair.map((id) => (
        <button
          key={id}
          type="button"
          onClick={() => onPick({ ...profile, leaning: id, note: LEANINGS[id].note })}
          className="pressable edge inline-flex min-h-9 items-center rounded-full border border-line bg-card px-3 text-label leading-none"
        >
          {LEANINGS[id].label}
        </button>
      ))}
      <button
        type="button"
        onClick={() => onPick({ ...profile, leaning: "any" })}
        className="pressable quiet inline-flex min-h-9 items-center rounded-full px-2.5 text-label leading-none text-muted"
      >
        فرقی نمی‌کنه
      </button>
    </div>
  );
}
