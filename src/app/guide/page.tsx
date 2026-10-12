"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/Button";
import { SoftChip } from "@/components/Chip";
import { BackIcon, CheckIcon } from "@/components/Icons";
import { Shell } from "@/components/Shell";
import { BUDGETS, OCCASIONS, REFERENCES, SEASONS } from "@/lib/catalog";
import { cn, faNum } from "@/lib/format";
import { useAroma } from "@/lib/store";
import type { Season } from "@/lib/types";

type Step = "occasion" | "season" | "budget" | "reference";

const STEPS: Step[] = ["occasion", "season", "budget", "reference"];

const STEP_LABEL: Record<Step, string> = {
  occasion: "موقعیت",
  season: "فصل",
  budget: "بودجه",
  reference: "سلیقه",
};

const COPY: Record<Step, { title: string; support: string; helper: string }> = {
  occasion: {
    title: "کجا می‌خوای بزنی؟",
    support: "یکی یا دو تا را انتخاب کن.",
    helper: "حداقل یک موقعیت لازم است.",
  },
  season: {
    title: "هوا چطوره؟",
    support: "فصل، خانوادهٔ بو را مشخص می‌کند.",
    helper: "یک فصل را انتخاب کن.",
  },
  budget: {
    title: "تا چه قیمتی؟",
    support: "سقف یک شیشه در فروشگاه‌ها.",
    helper: "یک سقف بودجه را انتخاب کن.",
  },
  reference: {
    title: "عطر آشنایی دوست داری؟",
    support: "اختیاری است؛ می‌توانی رد کنی.",
    helper: "",
  },
};

const OCCASION_META: Record<string, { hint: string; swatch: string }> = {
  night: { hint: "گرم و ماندگار", swatch: "#8C4A32" },
  office: { hint: "سبک و جمع‌وجور", swatch: "#7FA58A" },
  date: { hint: "نزدیک پوست", swatch: "#B5816A" },
  daily: { hint: "بی‌دردسر", swatch: "#6E93A3" },
  sport: { hint: "خنک و تازه", swatch: "#C6B15A" },
};

const SEASON_META: Record<string, { hint: string; swatch: string }> = {
  summer: { hint: "تازه و سبک", swatch: "#6E93A3" },
  winter: { hint: "گرم و شیرین", swatch: "#8C4A32" },
  mild: { hint: "تقریباً هر سبک", swatch: "#7FA58A" },
  all: { hint: "برای کل سال", swatch: "#6E5436" },
};

const REFERENCE_META: Record<string, { hint: string; swatch: string }> = {
  sauvage: { hint: "تازه و تند", swatch: "#5C6164" },
  aventus: { hint: "میوه‌ای و دودی", swatch: "#D2B15C" },
  angels: { hint: "شیرین و گرم", swatch: "#C47B4A" },
  none: { hint: "از صفر شروع کن", swatch: "#B7A99A" },
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
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const current = STEPS[step];
  const optional = current === "reference";
  const ready =
    (current === "occasion" && occasions.length > 0) ||
    (current === "season" && season !== null) ||
    (current === "budget" && budget !== null) ||
    (current === "reference" && reference !== null);

  useEffect(() => {
    return () => {
      if (advanceTimer.current) clearTimeout(advanceTimer.current);
    };
  }, []);

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

  function goNext() {
    if (advanceTimer.current) {
      clearTimeout(advanceTimer.current);
      advanceTimer.current = null;
    }
    if (current === "reference") {
      finish(reference);
      return;
    }
    setLimitHit(false);
    setStep((value) => value + 1);
  }

  function scheduleAdvance() {
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    advanceTimer.current = setTimeout(() => {
      advanceTimer.current = null;
      goNext();
    }, 280);
  }

  function toggleOccasion(id: string) {
    if (advanceTimer.current) {
      clearTimeout(advanceTimer.current);
      advanceTimer.current = null;
    }
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

  function pickSeason(id: Season) {
    setSeason(id);
    scheduleAdvance();
  }

  function pickBudget(id: number) {
    setBudget(id);
    scheduleAdvance();
  }

  function pickReference(id: string) {
    setReference(id);
    scheduleAdvance();
  }

  const footerSummary =
    current === "occasion" && occasions.length > 0
      ? occasions.map((id) => OCCASIONS.find((item) => item.id === id)?.label).filter(Boolean).join(" و ")
      : current === "season" && season
        ? SEASONS.find((item) => item.id === season)?.short
        : current === "budget" && budget
          ? `تا ${faNum(budget)} میلیون`
          : current === "reference" && reference
            ? REFERENCES.find((item) => item.id === reference)?.label
            : null;

  return (
    <Shell back={{ href: "/", label: "شروع" }}>
      <div className="flex min-h-full flex-col">
        <div className="px-5 pt-4">
          <div className="flex items-center gap-3">
            <div className="flex flex-1 gap-1.5" aria-hidden="true">
              {STEPS.map((item, index) => (
                <span
                  key={item}
                  title={STEP_LABEL[item]}
                  className={cn(
                    "h-1 flex-1 rounded-full transition-colors duration-300",
                    index <= step ? "bg-ink" : "bg-line",
                  )}
                />
              ))}
            </div>
            <p className="shrink-0 tabular-nums text-label text-muted">
              {faNum(step + 1)} از {faNum(STEPS.length)}
            </p>
          </div>
        </div>

        <div key={current} className="step-in flex min-h-0 flex-1 flex-col px-5 pt-5 pb-4">
          <h1 className="text-headline font-bold">{COPY[current].title}</h1>
          <p className="mt-2 max-w-[20rem] text-body text-muted">{COPY[current].support}</p>

          {step > 0 ? (
            <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="انتخاب‌های تا اینجا">
              {occasions.map((id) => (
                <li key={id}>
                  <SoftChip>{OCCASIONS.find((item) => item.id === id)?.label}</SoftChip>
                </li>
              ))}
              {season ? (
                <li>
                  <SoftChip>{SEASONS.find((item) => item.id === season)?.short}</SoftChip>
                </li>
              ) : null}
              {budget && current === "reference" ? (
                <li>
                  <SoftChip>تا {faNum(budget)} میلیون</SoftChip>
                </li>
              ) : null}
            </ul>
          ) : null}

          {current === "occasion" && occasions.length > 0 ? (
            <p className="mt-3 text-label text-muted" aria-live="polite">
              {occasions.length === 2
                ? "۲ از ۲ انتخاب شد؛ برای عوض کردن یکی را بردار."
                : `${faNum(occasions.length)} از ۲ — می‌توانی یکی دیگر هم بزنی.`}
            </p>
          ) : null}

          <div
            className={cn(
              "mt-4",
              current === "budget" || current === "season" ? "grid grid-cols-2 gap-2" : "flex flex-col gap-2",
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
                    hint={SEASON_META[item.id].hint}
                    swatch={SEASON_META[item.id].swatch}
                    compact
                    onClick={() => pickSeason(item.id)}
                  >
                    {item.short}
                  </Choice>
                ))
              : null}
            {current === "budget"
              ? BUDGETS.map((item) => (
                  <Choice key={item.id} pressed={budget === item.id} compact onClick={() => pickBudget(item.id)}>
                    {item.label}
                  </Choice>
                ))
              : null}
            {current === "reference"
              ? REFERENCES.map((item) => (
                  <Choice
                    key={item.id}
                    pressed={reference === item.id}
                    hint={REFERENCE_META[item.id].hint}
                    swatch={REFERENCE_META[item.id].swatch}
                    onClick={() => pickReference(item.id)}
                  >
                    {item.label}
                  </Choice>
                ))
              : null}
          </div>

          {limitHit ? (
            <p role="status" className="mt-3 text-label text-danger">
              حداکثر دو موقعیت. برای عوض کردن، یکی را بردار.
            </p>
          ) : null}

          {current === "season" || current === "budget" || current === "reference" ? (
            <p className="mt-auto pt-4 text-label text-muted">بعد از انتخاب، خودش می‌رود قدم بعد.</p>
          ) : null}
        </div>

        <div className="sticky bottom-0 border-t border-line bg-paper/95 px-5 pt-3 pb-[max(0.85rem,env(safe-area-inset-bottom))] backdrop-blur-sm">
          {!ready && !optional ? (
            <p className="mb-2 text-center text-label text-muted">{COPY[current].helper}</p>
          ) : footerSummary && current === "occasion" ? (
            <p className="mb-2 text-center text-label text-muted">{footerSummary}</p>
          ) : null}
          <div className="flex gap-2">
            {step > 0 ? (
              <Button
                variant="edge"
                size="icon-panel"
                aria-label="سؤال قبلی"
                onClick={() => {
                  if (advanceTimer.current) {
                    clearTimeout(advanceTimer.current);
                    advanceTimer.current = null;
                  }
                  setLimitHit(false);
                  setStep((value) => value - 1);
                }}
              >
                <BackIcon className="size-5" />
              </Button>
            ) : null}
            {optional && !reference ? (
              <Button variant="edge" className="flex-1 border-ink" onClick={() => finish(null)}>
                رد کردن و دیدن پیشنهادها
              </Button>
            ) : (
              <Button disabled={!ready} className="flex-1" onClick={goNext}>
                {optional ? "دیدن پیشنهادها" : current === "occasion" ? "بعدی" : "ادامه"}
              </Button>
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
        "pressable relative flex items-center gap-3 rounded-panel border text-start transition-colors duration-150",
        compact ? "min-h-[4.5rem] flex-col justify-center gap-1.5 px-3 py-3 text-center" : "min-h-12 px-3.5 py-2.5",
        pressed ? "border-ink bg-moss" : "edge border-line bg-card",
      )}
    >
      {compact ? (
        <>
          {swatch ? (
            <span aria-hidden="true" className="size-2 rounded-full" style={{ background: swatch }} />
          ) : null}
          <span className={cn("text-body leading-none", pressed ? "font-semibold" : "font-medium")}>{children}</span>
          {hint ? <span className="text-label text-muted">{hint}</span> : null}
          <span
            aria-hidden="true"
            className={cn(
              "absolute top-2.5 end-2.5 grid size-5 place-items-center rounded-full border",
              pressed ? "border-ink bg-ink text-paper" : "border-transparent",
            )}
          >
            {pressed ? <CheckIcon className="size-3.5" /> : null}
          </span>
        </>
      ) : (
        <>
          {swatch ? (
            <span aria-hidden="true" className="size-2.5 shrink-0 rounded-full" style={{ background: swatch }} />
          ) : null}
          <span className="min-w-0 flex-1">
            <span className={cn("block text-body leading-none", pressed && "font-semibold")}>{children}</span>
            {hint ? <span className="mt-0.5 block text-label text-muted">{hint}</span> : null}
          </span>
          <span
            aria-hidden="true"
            className={cn(
              "grid size-5 shrink-0 place-items-center border transition-colors duration-150",
              multi ? "rounded-md" : "rounded-full",
              pressed ? "border-ink bg-ink text-paper" : "border-line bg-paper",
            )}
          >
            {pressed ? <CheckIcon className="size-3.5" /> : null}
          </span>
        </>
      )}
    </button>
  );
}
