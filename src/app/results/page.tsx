"use client";

import Link from "next/link";
import { useMemo } from "react";
import { PerfumeCard } from "@/components/PerfumeCard";
import { Shell } from "@/components/Shell";
import { countWord, faNum } from "@/lib/format";
import { matchPerfumes, resultHeading } from "@/lib/match";
import { useAroma } from "@/lib/store";

export default function ResultsPage() {
  const { ready, profile, setProfile, taste } = useAroma();
  const results = useMemo(() => (profile ? matchPerfumes(profile, taste) : []), [profile, taste]);

  return (
    <Shell composer back={{ href: "/", label: "شروع" }}>
      {!ready || !profile ? (
        <div className="px-5 py-8 text-[14px] text-[var(--muted)]">{ready ? "از صفحهٔ شروع یک توصیف بنویس." : ""}</div>
      ) : (
        <div className="px-4 pt-5 pb-8">
          <h1 className="text-[1.45rem] font-bold leading-snug">{resultHeading(profile, results.length)}</h1>
          <p className="mt-2 text-[14px] text-[var(--muted)]">تا {faNum(profile.budget)} میلیون تومان</p>
          {profile.note ? <p className="mt-2 text-[14px]">{profile.note}</p> : null}
          {results.length > 0 && results.length < 5 ? (
            <p className="mt-3 text-[14px] leading-7">
              با این سلیقه {countWord(results.length)} عطر به اندازهٔ کافی مطمئن بودند.
            </p>
          ) : null}
          {results.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-[var(--line)] bg-[var(--card)] p-4">
              <p className="text-[15px] leading-7">
                با بودجهٔ تا {faNum(profile.budget)} میلیون، برای این موقعیت عطر مطمئنی در این نمونه نیست.
              </p>
              {profile.budget < 8 ? (
                <button
                  type="button"
                  className="pressable solid mt-4 min-h-12 w-full rounded-2xl bg-[var(--ink)] text-[15px] font-semibold text-[var(--paper)]"
                  onClick={() => setProfile({ ...profile, budget: profile.budget === 2 ? 5 : 8, note: "سقف بودجه بالاتر رفت." })}
                >
                  بودجه را تا {faNum(profile.budget === 2 ? 5 : 8)} میلیون بالا ببر
                </button>
              ) : (
                <Link href="/guide" className="pressable mt-4 inline-flex min-h-12 items-center text-[15px] font-medium">
                  سؤال‌ها را عوض کن
                </Link>
              )}
            </div>
          ) : (
            <div className="mt-5 flex flex-col gap-3">
              {results.map((perfume) => (
                <PerfumeCard key={perfume.slug} perfume={perfume} />
              ))}
            </div>
          )}
        </div>
      )}
    </Shell>
  );
}
