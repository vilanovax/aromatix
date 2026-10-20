"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { faNum } from "@/lib/format";
import { useAroma } from "@/lib/store";

export function TasteRow({
  slug,
  name,
  compact = false,
}: {
  slug: string;
  name: string;
  /** روی قفسه: وضعیت فعلی + یک عمل اصلی. */
  compact?: boolean;
}) {
  const { library, setWanted, setDisliked, saveExperience, clearExperience } = useAroma();
  const state = library[slug];
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const experienced = state?.rating != null && !state.disliked;
  const titleId = useId();
  const supportId = useId();
  const rangeRef = useRef<HTMLInputElement>(null);
  const [rating, setRating] = useState(8);
  const [owned, setOwned] = useState(false);
  const fill = `${((rating - 1) / 9) * 100}%`;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    rangeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  function openExperience() {
    setRating(state?.rating ?? 8);
    setOwned(Boolean(state?.owned));
    setOpen(true);
  }

  function closeExperience() {
    setOpen(false);
  }

  const sheet =
    open && mounted
      ? createPortal(
          <div className="vf app fixed inset-0 z-40 flex items-end justify-center bg-transparent">
            <button
              type="button"
              className="absolute inset-0 bg-foreground/40"
              aria-label="بستن ثبت تجربه"
              onClick={closeExperience}
            />
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              aria-describedby={supportId}
              className="vf app sheet-panel scroll-quiet relative z-10 w-full max-w-lg overflow-y-auto overscroll-contain rounded-t-surface border border-border bg-card px-5 pt-3 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-surface"
            >
              <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-border" aria-hidden="true" />
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 id={titleId} className="text-pretty text-title font-semibold">
                    {name}
                  </h2>
                  <p id={supportId} className="mt-1 text-pretty text-body text-muted-foreground">
                    چقدر از این عطر راضی هستی؟
                  </p>
                </div>
                <Button variant="ghost" size="md" onClick={closeExperience} className="min-h-11 shrink-0 px-3">
                  بستن
                </Button>
              </div>

              <div className="mt-5 rounded-surface bg-secondary px-4 py-4 text-center">
                <p className="text-display font-bold tabular-nums" aria-live="polite">
                  {faNum(rating)}
                  <span className="ms-2 text-body font-medium text-muted-foreground">از ۱۰</span>
                </p>
                <p className="mt-2 text-label text-muted-foreground">{ratingPhrase(rating)}</p>
              </div>

              <div className="mt-5">
                <div className="mb-2 flex items-center justify-between gap-3 text-label text-muted-foreground">
                  <span>اصلاً دوست ندارم</span>
                  <span>عاشقشم</span>
                </div>
                <input
                  ref={rangeRef}
                  type="range"
                  min={1}
                  max={10}
                  step={1}
                  value={rating}
                  aria-valuemin={1}
                  aria-valuemax={10}
                  aria-valuenow={rating}
                  aria-valuetext={`${faNum(rating)} از ۱۰، ${ratingPhrase(rating)}`}
                  aria-label="میزان رضایت"
                  onChange={(event) => setRating(Number(event.target.value))}
                  style={{ ["--range-fill" as string]: fill }}
                  className="aroma-range h-11 w-full cursor-pointer"
                />
              </div>

              <Checkbox
                checked={owned}
                onCheckedChange={setOwned}
                label="این عطر را دارم"
                description="اگر شیشه‌اش پیش توست، جدا از امتیاز در قفسه‌ات می‌ماند."
                className="mt-5 min-h-11 items-center rounded-surface border border-border bg-secondary px-4 py-3 text-body"
              />
              <Button
                size="lg"
                className="mt-3 min-h-12 w-full"
                onClick={() => {
                  saveExperience(slug, rating, owned);
                  closeExperience();
                }}
              >
                ثبت تجربه
              </Button>
              {experienced ? (
                <Button
                  variant="ghost"
                  size="md"
                  className="mt-1 min-h-11 w-full font-normal text-muted-foreground"
                  onClick={() => {
                    clearExperience(slug);
                    closeExperience();
                  }}
                >
                  پاک کردن تجربه
                </Button>
              ) : null}
            </div>
          </div>,
          document.body,
        )
      : null;

  if (compact) {
    return (
      <>
        <div className="flex flex-wrap items-center gap-2 py-2">
          <span
            className={
              state?.disliked
                ? "inline-flex min-h-11 items-center text-body font-semibold text-destructive"
                : "inline-flex min-h-11 items-center text-body font-semibold tabular-nums"
            }
          >
            {compactLabel(state, experienced)}
          </span>
          {!experienced && !state?.disliked ? (
            <Button variant="outline" size="md" onClick={openExperience} className="min-h-11 px-3">
              تجربه کردم
            </Button>
          ) : experienced ? (
            <Button variant="ghost" size="md" onClick={openExperience} className="min-h-11 px-3 font-normal text-muted-foreground">
              تغییر امتیاز
            </Button>
          ) : null}
        </div>
        {sheet}
      </>
    );
  }

  return (
    <>
      <div role="group" aria-label="نظر تو" className="grid grid-cols-3 items-end gap-1">
        <Button
          variant={state?.wanted ? "secondary" : "outline"}
          size="md"
          aria-pressed={Boolean(state?.wanted)}
          aria-label={state?.owned ? "می‌خوام؛ چون این عطر را داری غیرفعال است" : "می‌خوام"}
          title={state?.owned ? "چون این عطر را داری، می‌خوام لازم نیست" : undefined}
          disabled={Boolean(state?.owned)}
          onClick={() => setWanted(slug)}
          className="min-h-11 whitespace-normal! px-1 font-normal"
        >
          می‌خوام
        </Button>
        <div className="flex flex-col items-center gap-2">
          {state?.owned ? (
            <Badge variant="secondary" className="rounded-control bg-secondary px-2 text-center">
              در قفسه‌ام
              {experienced && state.rating != null ? (
                <span className="ms-1 font-medium tabular-nums">{faNum(state.rating)}/۱۰</span>
              ) : null}
            </Badge>
          ) : null}
          <Button
            variant={experienced ? "default" : "outline"}
            size="md"
            aria-pressed={Boolean(experienced)}
            onClick={openExperience}
            className="min-h-11 w-full whitespace-normal! px-1 font-normal"
          >
            تجربه کردم
          </Button>
        </div>
        <Button
          variant={state?.disliked ? "destructive" : "outline"}
          size="md"
          aria-pressed={Boolean(state?.disliked)}
          onClick={() => setDisliked(slug)}
          className="min-h-11 whitespace-normal! px-1 font-normal"
        >
          دوست ندارم
        </Button>
      </div>
      {sheet}
    </>
  );
}

function compactLabel(
  state: { owned?: boolean; wanted?: boolean; disliked?: boolean; rating?: number | null } | undefined,
  experienced: boolean,
) {
  if (state?.disliked) return "نپسندیدم";
  if (experienced && state?.rating != null) {
    return state.owned ? `دارم · ${faNum(state.rating)}` : `${faNum(state.rating)} از ۱۰`;
  }
  if (state?.owned) return "دارم";
  if (state?.wanted) return "می‌خوام";
  return "ثبت نشده";
}

function ratingPhrase(rating: number) {
  if (rating <= 3) return "اصلاً دوست ندارم";
  if (rating <= 6) return "معمولی است";
  if (rating <= 8) return "خیلی دوستش دارم";
  return "عاشقشم";
}
