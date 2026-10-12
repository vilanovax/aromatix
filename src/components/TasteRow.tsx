"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/Button";
import { cn, faNum } from "@/lib/format";
import { useAroma } from "@/lib/store";

export function TasteRow({ slug, name }: { slug: string; name: string }) {
  const { library, setWanted, setDisliked, saveExperience, clearExperience } = useAroma();
  const state = library[slug];
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const experienced = state?.rating != null && !state.disliked;
  const titleId = useId();
  const rangeRef = useRef<HTMLInputElement>(null);
  const [rating, setRating] = useState(8);
  const [owned, setOwned] = useState(false);

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

      {open && mounted
        ? createPortal(
        <div className="fixed inset-0 z-40 flex items-end justify-center">
          <button type="button" className="absolute inset-0 bg-ink/40" aria-label="بستن ثبت تجربه" onClick={() => setOpen(false)} />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="sheet-panel relative z-10 w-full max-w-lg rounded-t-sheet bg-card px-5 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))]"
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-line" />
            <h2 id={titleId} className="text-title font-semibold">
              {name}
            </h2>
            <p className="mt-1 text-body text-muted">چقدر از این عطر راضی هستی؟</p>
            <p className="mt-4 text-display font-bold" aria-live="polite">
              {faNum(rating)}
              <span className="ms-1 text-body font-normal text-muted">از ۱۰</span>
            </p>
            <p className="mt-1 text-label text-muted">{ratingPhrase(rating)}</p>
            <div className="mt-4 flex items-center justify-between text-label text-muted">
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
              aria-label="میزان رضایت"
              onChange={(event) => setRating(Number(event.target.value))}
              className="mt-2 h-11 w-full cursor-pointer accent-ink"
            />
            <Button
              variant={owned ? "quiet" : "edge"}
              shape="control"
              size="lg"
              aria-pressed={owned}
              onClick={() => setOwned((current) => !current)}
              className={cn("mt-4 w-full font-medium", owned && "border-transparent bg-moss text-ink")}
            >
              این عطر رو دارم
            </Button>
            <Button
              size="lg"
              className="mt-3 w-full"
              onClick={() => {
                saveExperience(slug, rating, owned);
                setOpen(false);
              }}
            >
              ثبت تجربه
            </Button>
            {experienced ? (
              <Button
                variant="quiet"
                size="md"
                className="mt-1 w-full font-normal text-muted"
                onClick={() => {
                  clearExperience(slug);
                  setOpen(false);
                }}
              >
                پاک کردن تجربه
              </Button>
            ) : null}
          </div>
        </div>,
          document.body,
        )
        : null}
    </>
  );
}

function ratingPhrase(rating: number) {
  if (rating <= 3) return "اصلاً دوست ندارم";
  if (rating <= 6) return "معمولی است";
  if (rating <= 8) return "خیلی دوستش دارم";
  return "عاشقشم";
}
