"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Check, ChevronRight } from "lucide-react";
import { Shell } from "@/components/Shell";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { budgetChoices } from "@/lib/budgets";
import { OCCASIONS, REFERENCES, SEASONS } from "@/lib/catalog";
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
      <div className="vf app flex min-h-full flex-col">
        <div className="px-5 pt-5">
          <div
            className="flex items-center gap-3"
            role="group"
            aria-label={`قدم ${faNum(step + 1)} از ${faNum(STEPS.length)}: ${STEP_LABEL[current]}`}
          >
            <div className="flex flex-1 gap-2" aria-hidden="true">
              {STEPS.map((item, index) => (
                <span
                  key={item}
                  title={STEP_LABEL[item]}
                  className={cn(
                    "h-2 flex-1 rounded-full transition-colors duration-300",
                    index <= step ? "bg-primary" : "bg-border",
                  )}
                />
              ))}
            </div>
            <p className="shrink-0 tabular-nums text-label text-muted-foreground">
              {faNum(step + 1)} از {faNum(STEPS.length)}
            </p>
          </div>
        </div>

        <div key={current} className="step-in flex min-h-0 flex-1 flex-col px-5 pt-6 pb-4">
          <h1 className="text-balance text-headline font-bold">{COPY[current].title}</h1>
          <p className="mt-2 text-pretty text-body text-muted-foreground">{COPY[current].support}</p>

          {step > 0 ? (
            <ul className="mt-4 flex flex-wrap gap-2" aria-label="انتخاب‌های تا اینجا">
              {occasions.map((id) => (
                <li key={id}>
                  <Badge className="rounded-full bg-secondary px-3">{OCCASIONS.find((item) => item.id === id)?.label}</Badge>
                </li>
              ))}
              {season ? (
                <li>
                  <Badge className="rounded-full bg-secondary px-3">{SEASONS.find((item) => item.id === season)?.short}</Badge>
                </li>
              ) : null}
              {budget && current === "reference" ? (
                <li>
                  <Badge className="rounded-full bg-secondary px-3">تا {faNum(budget)} میلیون</Badge>
                </li>
              ) : null}
            </ul>
          ) : null}

          {current === "occasion" && occasions.length > 0 ? (
            <p className="mt-4 text-label text-muted-foreground" aria-live="polite">
              {occasions.length === 2
                ? "۲ از ۲ انتخاب شد؛ برای عوض کردن یکی را بردار."
                : `${faNum(occasions.length)} از ۲ — می‌توانی یکی دیگر هم بزنی.`}
            </p>
          ) : null}

          <div
            className={cn(
              step > 0 || (current === "occasion" && occasions.length > 0) ? "mt-4" : "mt-5",
              current === "budget" || current === "season" ? "grid grid-cols-2 gap-3" : "flex flex-col gap-2",
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
              ? budgetChoices().map((item) => (
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
            <Alert variant="destructive" className="mt-4">
              حداکثر دو موقعیت. برای عوض کردن، یکی را بردار.
            </Alert>
          ) : null}

          {current === "season" || current === "budget" || current === "reference" ? (
            <p className="mt-auto pt-5 text-label text-muted-foreground">بعد از انتخاب، خودش می‌رود قدم بعد.</p>
          ) : null}
        </div>

        <div className="sticky bottom-0 border-t border-border bg-background/95 px-5 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-sm">
          {!ready && !optional ? (
            <p className="mb-3 text-start text-label text-muted-foreground">{COPY[current].helper}</p>
          ) : footerSummary && current === "occasion" ? (
            <p className="mb-3 text-start text-label text-muted-foreground">{footerSummary}</p>
          ) : null}
          <div className="flex gap-2">
            {step > 0 ? (
              <Button
                variant="outline"
                size="icon"
                aria-label="سؤال قبلی"
                onClick={() => {
                  if (advanceTimer.current) {
                    clearTimeout(advanceTimer.current);
                    advanceTimer.current = null;
                  }
                  setLimitHit(false);
                  setStep((value) => value - 1);
                }}
                className="min-h-12 min-w-12"
              >
                <ChevronRight strokeWidth={2} />
              </Button>
            ) : null}
            {optional && !reference ? (
              <Button variant="outline" className="min-h-12 flex-1" onClick={() => finish(null)}>
                رد کردن و دیدن پیشنهادها
              </Button>
            ) : (
              <Button disabled={!ready} size="lg" className="min-h-12 flex-1" onClick={goNext}>
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
    <Button
      variant={pressed ? "secondary" : "outline"}
      size="lg"
      aria-pressed={pressed}
      onClick={onClick}
      className={cn(
        "relative w-full !h-auto !whitespace-normal gap-3 font-medium",
        compact ? "min-h-20 !flex-col !items-start !justify-center px-4 py-4 text-start" : "min-h-14 !justify-start px-4 py-3 text-start",
        pressed ? "ring-2 ring-primary" : "!bg-card",
      )}
    >
      {compact ? (
        <>
          {swatch ? <span aria-hidden="true" className="size-2 rounded-full" style={{ background: swatch }} /> : null}
          <span className={cn("text-body leading-snug", pressed ? "font-semibold" : "font-medium")}>{children}</span>
          {hint ? <span className="text-label font-normal text-muted-foreground">{hint}</span> : null}
          <span
            aria-hidden="true"
            className={cn(
              "absolute top-2 end-2 grid size-5 place-items-center rounded-full border",
              pressed ? "border-primary bg-primary text-primary-foreground" : "border-transparent",
            )}
          >
            {pressed ? <Check strokeWidth={2} /> : null}
          </span>
        </>
      ) : (
        <>
          {swatch ? <span aria-hidden="true" className="size-2 shrink-0 rounded-full" style={{ background: swatch }} /> : null}
          <span className="min-w-0 flex-1">
            <span className={cn("block text-body leading-snug", pressed ? "font-semibold" : "font-medium")}>
              {children}
            </span>
            {hint ? <span className="mt-1 block text-label font-normal text-muted-foreground">{hint}</span> : null}
          </span>
          <span
            aria-hidden="true"
            className={cn(
              "grid size-6 shrink-0 place-items-center border",
              multi ? "rounded-md" : "rounded-full",
              pressed ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card",
            )}
          >
            {pressed ? <Check strokeWidth={2} /> : null}
          </span>
        </>
      )}
    </Button>
  );
}
