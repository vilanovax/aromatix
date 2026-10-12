"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/Button";
import { cn, faNum } from "@/lib/format";
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
          <div className="fixed inset-0 z-40 flex items-end justify-center">
            <button
              type="button"
              className="absolute inset-0 bg-ink/40"
              aria-label="بستن ثبت تجربه"
              onClick={closeExperience}
            />
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              aria-describedby={supportId}
              className="scroll-quiet sheet-panel relative z-10 w-full max-w-lg overflow-y-auto overscroll-contain rounded-t-sheet bg-card px-5 pt-3 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-sheet"
            >
              <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-line" aria-hidden="true" />
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 id={titleId} className="text-pretty text-title font-semibold">
                    {name}
                  </h2>
                  <p id={supportId} className="mt-1 text-pretty text-body text-muted">
                    چقدر از این عطر راضی هستی؟
                  </p>
                </div>
                <Button
                  variant="quiet"
                  shape="pill"
                  size="sm"
                  onClick={closeExperience}
                  className="shrink-0 px-3 py-2 text-body outline-offset-2 focus-visible:outline-2 focus-visible:outline-ink"
                >
                  بستن
                </Button>
              </div>

              <div className="mt-5 rounded-panel bg-paper px-4 py-4 text-center">
                <p className="text-display font-bold tabular-nums" aria-live="polite">
                  {faNum(rating)}
                  <span className="ms-1.5 text-body font-medium text-muted">از ۱۰</span>
                </p>
                <p className="mt-1.5 text-label text-muted">{ratingPhrase(rating)}</p>
              </div>

              <div className="mt-5">
                <div className="mb-2 flex items-center justify-between gap-3 text-label text-muted">
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

              <Button
                variant={owned ? "quiet" : "edge"}
                shape="control"
                size="lg"
                aria-pressed={owned}
                onClick={() => setOwned((current) => !current)}
                className={cn(
                  "mt-5 w-full font-medium outline-offset-2 focus-visible:outline-2 focus-visible:outline-ink",
                  owned && "border-transparent bg-moss text-ink",
                )}
              >
                این عطر رو دارم
              </Button>
              <Button
                size="lg"
                className="mt-2.5 w-full"
                onClick={() => {
                  saveExperience(slug, rating, owned);
                  closeExperience();
                }}
              >
                ثبت تجربه
              </Button>
              {experienced ? (
                <Button
                  variant="quiet"
                  size="md"
                  className="mt-1 w-full font-normal text-muted outline-offset-2 focus-visible:outline-2 focus-visible:outline-ink"
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
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "inline-flex min-h-9 items-center rounded-control px-2.5 text-label font-medium",
              state?.disliked
                ? "bg-clay text-danger"
                : experienced
                  ? "bg-ink text-paper"
                  : state?.wanted
                    ? "bg-moss text-ink"
                    : state?.owned
                      ? "bg-well text-ink"
                      : "bg-well text-muted",
            )}
          >
            {compactLabel(state, experienced)}
          </span>
          {!experienced && !state?.disliked ? (
            <Button
              variant="edge"
              shape="control"
              size="md"
              onClick={openExperience}
              className="min-h-9 flex-1 px-3 text-label font-medium"
            >
              تجربه کردم
            </Button>
          ) : experienced ? (
            <Button
              variant="quiet"
              shape="control"
              size="md"
              onClick={openExperience}
              className="min-h-9 flex-1 px-3 text-label font-normal text-muted"
            >
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
      <div role="group" aria-label="نظر تو" className="grid grid-cols-3 gap-1">
        <Button
          variant={state?.wanted ? "quiet" : "edge"}
          shape="control"
          size="md"
          aria-pressed={Boolean(state?.wanted)}
          aria-label={state?.owned ? "این عطر را داری" : "می‌خوام"}
          disabled={Boolean(state?.owned)}
          onClick={() => setWanted(slug)}
          className={cn(
            "min-h-11 px-1 text-label font-normal disabled:opacity-45",
            state?.wanted && "border-transparent bg-moss font-semibold text-ink",
          )}
        >
          می‌خوام
        </Button>
        <Button
          variant={experienced ? "quiet" : "edge"}
          shape="control"
          size="md"
          aria-pressed={Boolean(experienced)}
          onClick={openExperience}
          className={cn(
            "min-h-11 px-1 text-label font-normal",
            experienced && "border-transparent bg-ink font-semibold text-paper",
          )}
        >
          تجربه کردم
        </Button>
        <Button
          variant={state?.disliked ? "quiet" : "edge"}
          shape="control"
          size="md"
          aria-pressed={Boolean(state?.disliked)}
          onClick={() => setDisliked(slug)}
          className={cn(
            "min-h-11 px-1 text-label font-normal",
            state?.disliked && "border-transparent bg-clay font-semibold text-danger",
          )}
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
