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

const COPY: Record<Step, { title: string; support: string; helper: string }> = {
  occasion: {
    title: "کجا می‌خوای بزنی؟",
    support: "یکی یا دو موقعیت را انتخاب کن؛ بر اساس همان، بو را می‌چینیم.",
    helper: "حداقل یک موقعیت لازم است.",
  },
  season: {
    title: "هوا چطوره؟",
    support: "فصل، خانوادهٔ بو را عوض می‌کند؛ یکی کافی است.",
    helper: "یک فصل را انتخاب کن.",
  },
  budget: {
    title: "تا چه قیمتی؟",
    support: "سقف قیمت یک شیشه در فروشگاه‌های معرفی‌شده.",
    helper: "یک سقف بودجه را انتخاب کن.",
  },
  reference: {
    title: "عطر آشنایی هست که دوستش داشته باشی؟",
    support: "اختیاری است. اگر رد کنی هم پیشنهادها می‌آید.",
    helper: "",
  },
};

const OCCASION_META: Record<string, { hint: string; swatch: string }> = {
  night: { hint: "گرم‌تر و ماندگارتر", swatch: "#8C4A32" },
  office: { hint: "سبک؛ فضای مشترک را پر نکند", swatch: "#7FA58A" },
  date: { hint: "نزدیک به پوست و گرم", swatch: "#B5816A" },
  daily: { hint: "بی‌دردسر برای هر روز", swatch: "#6E93A3" },
  sport: { hint: "خنک و تازه", swatch: "#C6B15A" },
};

const SEASON_HINT: Record<string, string> = {
  summer: "تازه و سبک بهتر می‌نشیند",
  winter: "گرم و شیرین جا می‌افتد",
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
    setLimitHit(false);
  }

  return (
    <Shell back={{ href: "/", label: "شروع" }}>
      <div className="flex min-h-full flex-col">
        <div className="px-5 pt-4">
          <div className="flex items-center gap-3">
            <div className="flex flex-1 gap-1.5" aria-hidden="true">
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
            <p className="shrink-0 tabular-nums text-[12px] text-[var(--muted)]">
              {faNum(step + 1)} از {faNum(STEPS.length)}
            </p>
          </div>
        </div>

        <div key={current} className="step-in flex min-h-0 flex-1 flex-col px-5 pt-5 pb-3">
          <h1 className="text-[1.55rem] font-bold leading-snug">{COPY[current].title}</h1>
          <p className="mt-2 max-w-[22rem] text-[14px] leading-7 text-[var(--muted)]">{COPY[current].support}</p>

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
              {budget && (current === "budget" || current === "reference") ? (
                <li className="rounded-full bg-[var(--moss)] px-2.5 py-1 text-[12px]">تا {faNum(budget)} میلیون</li>
              ) : null}
            </ul>
          ) : null}

          {current === "occasion" && occasions.length > 0 ? (
            <p className="mt-4 text-[13px] text-[var(--muted)]" aria-live="polite">
              {occasions.length === 2
                ? "۲ از ۲ انتخاب شد؛ برای عوض کردن یکی را بردار."
                : `${faNum(occasions.length)} از ۲ انتخاب شد.`}
            </p>
          ) : null}

          <div
            className={cn(
              "mt-4",
              current === "budget" ? "grid grid-cols-2 gap-2" : "flex flex-col gap-2",
            )}
            role="group"
            aria-label={COPY[current].title}
          >
            {current === "occasion"
              ? OCCASIONS.map((item) => (
                  <Choice
                    key={item.id}
                    multi
                    pressed={occasions.includes(item.id)}
                    hint={OCCASION_META[item.id].hint}
                    swatch={OCCASION_META[item.id].swatch}
                    onClick={() => toggleOccasion(item.id)}
                  >
                    {item.label}
                  </Choice>
                ))
              : null}
            {current === "season"
              ? SEASONS.map((item) => (
                  <Choice
                    key={item.id}
                    pressed={season === item.id}
                    hint={SEASON_HINT[item.id]}
                    onClick={() => setSeason(item.id)}
                  >
                    {item.label}
                  </Choice>
                ))
              : null}
            {current === "budget"
              ? BUDGETS.map((item) => (
                  <Choice key={item.id} pressed={budget === item.id} compact onClick={() => setBudget(item.id)}>
                    {item.label}
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

        <div className="sticky bottom-0 border-t border-[var(--line)] bg-[var(--paper)]/95 px-5 pt-3 pb-[max(0.85rem,env(safe-area-inset-bottom))] backdrop-blur-sm">
          {!ready && !optional ? (
            <p className="mb-2 text-center text-[12px] text-[var(--muted)]">{COPY[current].helper}</p>
          ) : null}
          <div className="flex gap-2">
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
      </div>
    </Shell>
  );
}

function Choice({
  pressed,
  onClick,
  hint,
  swatch,
  multi = false,
  compact = false,
  children,
}: {
  pressed: boolean;
  onClick: () => void;
  hint?: string;
  swatch?: string;
  multi?: boolean;
  compact?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={cn(
        "pressable relative flex items-center gap-3 rounded-2xl border text-start transition-colors duration-150",
        compact ? "min-h-[4.25rem] justify-center px-3 py-3 text-center" : "min-h-[3.35rem] px-3.5 py-2.5",
        pressed
          ? "border-[var(--ink)] bg-[var(--moss)]"
          : "edge border-[var(--line)] bg-[var(--card)]",
      )}
    >
      {compact ? (
        <>
          <span className={cn("text-[15px] leading-6", pressed ? "font-semibold" : "font-medium")}>{children}</span>
          <span
            aria-hidden="true"
            className={cn(
              "absolute top-2.5 end-2.5 grid size-5 place-items-center rounded-full border",
              pressed ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--paper)]" : "border-transparent",
            )}
          >
            {pressed ? <CheckIcon className="size-3.5" /> : null}
          </span>
        </>
      ) : (
        <>
          {swatch ? (
            <span
              aria-hidden="true"
              className="size-2.5 shrink-0 rounded-full"
              style={{ background: swatch }}
            />
          ) : null}
          <span className="min-w-0 flex-1">
            <span className={cn("block text-[15px] leading-6", pressed && "font-semibold")}>{children}</span>
            {hint ? <span className="mt-0.5 block text-[12px] leading-5 text-[var(--muted)]">{hint}</span> : null}
          </span>
          <span
            aria-hidden="true"
            className={cn(
              "grid size-5 shrink-0 place-items-center border transition-colors duration-150",
              multi ? "rounded-md" : "rounded-full",
              pressed ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--paper)]" : "border-[var(--line)] bg-[var(--paper)]",
            )}
          >
            {pressed ? <CheckIcon className="size-3.5" /> : null}
          </span>
        </>
      )}
    </button>
  );
}
