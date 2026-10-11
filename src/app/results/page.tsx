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
        <div className="px-5 py-8 text-[14px] text-[var(--muted)]">{ready ? "از صفحهٔ شروع یک توصیف بنویس." : ""}</div>
      ) : (
        <div className="px-4 pt-5 pb-8">
          <header>
            <h1 className="text-[1.45rem] font-bold leading-snug">{resultHeading(profile, results.length)}</h1>
            <p className="mt-2 text-[14px] text-[var(--muted)]">
              تا {faNum(profile.budget)} میلیون تومان
              {profile.leaning && profile.leaning !== "any" ? ` · ${LEANINGS[profile.leaning].label}` : ""}
            </p>
            {profile.note ? (
              <p className="mt-3 rounded-xl bg-[var(--moss)] px-3 py-2.5 text-[14px] leading-7">{profile.note}</p>
            ) : null}
          </header>

          {results.length > 0 && profile.leaning == null ? (
            <LeaningQuestion profile={profile} onPick={setProfile} />
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
                <Link href="/guide" className="pressable mt-4 inline-flex min-h-12 items-center text-[15px] font-medium">
                  سؤال‌ها را عوض کن
                </Link>
              )}
            </div>
          ) : (
            <>
              <p className="mt-4 text-[13px] leading-6 text-[var(--muted)]">
                {results.length < 5
                  ? `فقط ${countWord(results.length)} عطر به اندازهٔ کافی مطمئن بودند؛ فهرست را با حدس پر نکردیم.`
                  : "پنج پیشنهاد مطمئن‌تر؛ برای اصلاحش بپرس خنک‌تر، ارزان‌تر یا ماندگارتر."}
              </p>
              <ol className="mt-4 flex list-none flex-col gap-3 p-0">
                {results.map((perfume, index) => (
                  <li key={perfume.slug}>
                    <PerfumeCard perfume={perfume} rank={index + 1} />
                  </li>
                ))}
              </ol>
              {results.length >= 2 ? (
                <p className="mt-5 text-[13px] leading-6 text-[var(--muted)]">
                  دو تا را با «مقایسه» انتخاب کن، یا پایین بگو ارزان‌تر و ماندگارتر.
                </p>
              ) : null}
            </>
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
  const [first, second] = pair.map((id) => LEANINGS[id].label);

  return (
    <section
      aria-labelledby="leaning-title"
      className="sheet-panel mt-4 rounded-2xl bg-[var(--card)] p-4 shadow-[0_6px_20px_-16px_rgba(28,33,31,0.4)]"
    >
      <h2 id="leaning-title" className="text-[15px] font-semibold leading-7">
        بیشتر {first} دوست داری، یا {second}؟
        <span className="ms-2 text-[12px] font-normal text-[var(--muted)]">اختیاری</span>
      </h2>
      <div className="mt-3 flex flex-wrap gap-2">
        {pair.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => onPick({ ...profile, leaning: id, note: LEANINGS[id].note })}
            className="pressable edge inline-flex min-h-11 items-center rounded-full border border-[var(--line)] bg-[var(--paper)] px-4 text-[14px]"
          >
            {LEANINGS[id].label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => onPick({ ...profile, leaning: "any" })}
          className="pressable quiet inline-flex min-h-11 items-center rounded-full px-3 text-[14px] text-[var(--muted)]"
        >
          فرقی نمی‌کنه
        </button>
      </div>
    </section>
  );
}
