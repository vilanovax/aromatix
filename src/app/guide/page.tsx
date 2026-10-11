"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { BackIcon, CheckIcon } from "@/components/Icons";
import { Shell } from "@/components/Shell";
import { BUDGETS, OCCASIONS, REFERENCES, SEASONS } from "@/lib/catalog";
import { cn, faNum } from "@/lib/format";
import { useAroma } from "@/lib/store";
import type { Season } from "@/lib/types";

type Step = "occasion" | "season" | "budget" | "reference";

const STEPS: Step[] = ["occasion", "season", "budget", "reference"];

const COPY: Record<Step, { title: string; hint: string }> = {
  occasion: { title: "کجا می‌خوای بزنی؟", hint: "حداکثر دو موقعیت" },
  season: { title: "هوا چطوره؟", hint: "یک فصل کافی است" },
  budget: { title: "تا چه قیمتی؟", hint: "قیمت یک شیشه در فروشگاه‌ها" },
  reference: { title: "عطر آشنایی هست که دوستش داشته باشی؟", hint: "اختیاری؛ می‌توانی رد کنی" },
};

const OCCASION_HINT: Record<string, string> = {
  night: "گرم‌تر و ماندگارتر",
  office: "سبک، که فضای مشترک را پر نکند",
  date: "نزدیک به پوست و گرم",
  daily: "بی‌دردسر برای هر روز",
  sport: "خنک و تازه",
};

const SEASON_HINT: Record<string, string> = {
  summer: "بوهای تازه و سبک بهتر می‌نشینند",
  winter: "بوهای گرم و شیرین جا می‌افتند",
  mild: "تقریباً هر سبکی",
  all: "یک عطر برای کل سال",
};

const REFERENCE_HINT: Record<string, string> = {
  sauvage: "تازه و تند",
  aventus: "میوه‌ای و دودی",
  angels: "شیرین و گرم",
  none: "از صفر انتخاب کن",
};

export default function GuidePage() {
  const router = useRouter();
  const { setProfile } = useAroma();
  const [step, setStep] = useState(0);
  const [occasions, setOccasions] = useState<string[]>([]);
  const [season, setSeason] = useState<Season | null>(null);
  const [budget, setBudget] = useState<number | null>(null);
  const [reference, setReference] = useState<string | null>(null);
  const [limitHit, setLimitHit] = useState(false);

  const current = STEPS[step];
  const optional = current === "reference";
  const ready =
    (current === "occasion" && occasions.length > 0) ||
    (current === "season" && season !== null) ||
    (current === "budget" && budget !== null) ||
    (current === "reference" && reference !== null);

  function finish(nextReference: string | null) {
    if (!season || !budget || occasions.length === 0) return;
    setProfile({
      occasions,
      season,
      budget,
      reference: nextReference === "none" ? null : nextReference,
      shift: "none",
      note: null,
    });
    router.push("/results");
  }

  function next() {
    if (current === "reference") {
      finish(reference);
      return;
    }
    setLimitHit(false);
    setStep((value) => value + 1);
  }

  function toggleOccasion(id: string) {
    if (occasions.includes(id)) {
      setOccasions(occasions.filter((item) => item !== id));
      setLimitHit(false);
      return;
    }
    if (occasions.length >= 2) {
      setLimitHit(true);
      return;
    }
    setOccasions([...occasions, id]);
  }

  return (
    <Shell back={{ href: "/", label: "شروع" }}>
      <div className="flex min-h-full flex-col px-5 pt-5">
        <div className="flex items-center gap-3">
          <div className="flex flex-1 gap-1" aria-hidden="true">
            {STEPS.map((item, index) => (
              <span
                key={item}
                className={cn(
                  "h-1 flex-1 rounded-full transition-colors duration-300",
                  index <= step ? "bg-[var(--ink)]" : "bg-[var(--line)]",
                )}
              />
            ))}
          </div>
          <p className="shrink-0 text-[12px] text-[var(--muted)]">
            {faNum(step + 1)} از {faNum(STEPS.length)}
          </p>
        </div>

        <div key={current} className="step-in">
          <p className="mt-6 text-[13px] text-[var(--muted)]">{COPY[current].hint}</p>
          <h1 className="mt-1.5 text-[1.6rem] font-bold leading-snug">{COPY[current].title}</h1>

          {(occasions.length > 0 || season || budget) && current !== "occasion" ? (
            <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="انتخاب‌های تا اینجا">
              {occasions.map((id) => (
                <li key={id} className="rounded-full bg-[var(--moss)] px-2.5 py-1 text-[12px]">
                  {OCCASIONS.find((item) => item.id === id)?.label}
                </li>
              ))}
              {season ? (
                <li className="rounded-full bg-[var(--moss)] px-2.5 py-1 text-[12px]">
                  {SEASONS.find((item) => item.id === season)?.short}
                </li>
              ) : null}
              {budget && current === "reference" ? (
                <li className="rounded-full bg-[var(--moss)] px-2.5 py-1 text-[12px]">تا {faNum(budget)} میلیون</li>
              ) : null}
            </ul>
          ) : null}

          <div className="mt-6 flex flex-col gap-2" role="group" aria-label={COPY[current].title}>
            {current === "occasion"
              ? OCCASIONS.map((item) => (
                  <Choice
                    key={item.id}
                    multi
                    pressed={occasions.includes(item.id)}
                    hint={OCCASION_HINT[item.id]}
                    onClick={() => toggleOccasion(item.id)}
                  >
                    {item.label}
                  </Choice>
                ))
              : null}
            {current === "season"
              ? SEASONS.map((item) => (
                  <Choice key={item.id} pressed={season === item.id} hint={SEASON_HINT[item.id]} onClick={() => setSeason(item.id)}>
                    {item.label}
                  </Choice>
                ))
              : null}
            {current === "budget"
              ? BUDGETS.map((item) => (
                  <Choice key={item.id} pressed={budget === item.id} onClick={() => setBudget(item.id)}>
                    {item.label} تومان
                  </Choice>
                ))
              : null}
            {current === "reference"
              ? REFERENCES.map((item) => (
                  <Choice
                    key={item.id}
                    pressed={reference === item.id}
                    hint={REFERENCE_HINT[item.id]}
                    onClick={() => setReference(item.id)}
                  >
                    {item.label}
                  </Choice>
                ))
              : null}
          </div>
          {limitHit ? (
            <p role="status" className="mt-3 text-[13px] text-[var(--danger)]">
              حداکثر دو موقعیت. برای عوض کردن، یکی را بردار.
            </p>
          ) : null}
        </div>

        <div className="sticky bottom-0 mt-auto flex gap-2 bg-[var(--paper)] pt-6 pb-[max(1rem,env(safe-area-inset-bottom))]">
          {step > 0 ? (
            <button
              type="button"
              onClick={() => {
                setLimitHit(false);
                setStep((value) => value - 1);
              }}
              aria-label="سؤال قبلی"
              className="pressable edge grid size-12 shrink-0 place-items-center rounded-2xl border border-[var(--line)] bg-[var(--card)]"
            >
              <BackIcon className="size-5" />
            </button>
          ) : null}
          {optional && !reference ? (
            <button
              type="button"
              onClick={() => finish(null)}
              className="pressable edge min-h-12 flex-1 rounded-2xl border border-[var(--ink)] text-[15px] font-semibold"
            >
              رد کردن و دیدن پیشنهادها
            </button>
          ) : (
            <button
              type="button"
              disabled={!ready}
              onClick={next}
              className="pressable solid min-h-12 flex-1 rounded-2xl bg-[var(--ink)] text-[15px] font-semibold text-[var(--paper)] disabled:bg-[var(--line)] disabled:text-[var(--muted)]"
            >
              {optional ? "دیدن پیشنهادها" : "بعدی"}
            </button>
          )}
        </div>
      </div>
    </Shell>
  );
}

function Choice({
  pressed,
  onClick,
  hint,
  multi = false,
  children,
}: {
  pressed: boolean;
  onClick: () => void;
  hint?: string;
  multi?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={cn(
        "pressable flex min-h-14 items-center gap-3 rounded-2xl border px-4 py-2.5 text-start",
        pressed ? "border-[var(--ink)] bg-[var(--card)] shadow-[inset_0_0_0_1px_var(--ink)]" : "edge border-[var(--line)] bg-[var(--card)]",
      )}
    >
      <span className="min-w-0 flex-1">
        <span className={cn("block text-[15px]", pressed && "font-semibold")}>{children}</span>
        {hint ? <span className="mt-0.5 block text-[13px] text-[var(--muted)]">{hint}</span> : null}
      </span>
      <span
        aria-hidden="true"
        className={cn(
          "grid size-6 shrink-0 place-items-center border transition-colors duration-150",
          multi ? "rounded-md" : "rounded-full",
          pressed ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--paper)]" : "border-[var(--line)] bg-[var(--paper)]",
        )}
      >
        {pressed ? <CheckIcon className="size-4" /> : null}
      </span>
    </button>
  );
}
