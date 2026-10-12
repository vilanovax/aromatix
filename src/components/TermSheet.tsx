"use client";

import { useEffect, useRef } from "react";
import { Button, ButtonLink } from "@/components/Button";
import { cn } from "@/lib/format";
import { getEntry } from "@/lib/knowledge";
import { useAroma } from "@/lib/store";

export function TermSheet() {
  const { termFor, closeTerm } = useAroma();
  const closeRef = useRef<HTMLButtonElement>(null);
  const entry = termFor ? getEntry(termFor) : undefined;

  useEffect(() => {
    if (!entry) return;
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeTerm();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [entry, closeTerm]);

  if (!entry) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center">
      <button type="button" className="absolute inset-0 bg-ink/40" aria-label="بستن توضیح" onClick={closeTerm} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="term-title"
        className="scroll-quiet sheet-panel relative z-10 max-h-[70dvh] w-full max-w-lg overflow-y-auto overscroll-contain rounded-t-sheet bg-card px-5 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))]"
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-line" />
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 id="term-title" className="text-title font-semibold">
              {entry.title}
            </h2>
            <p className="mt-1 text-label text-muted">{entry.support}</p>
          </div>
          <Button ref={closeRef} variant="quiet" shape="pill" size="sm" onClick={closeTerm} className="px-3 py-2 text-body">
            بستن
          </Button>
        </div>
        <p className="mt-4 text-pretty text-body">{entry.summary}</p>
        <ButtonLink href={`/learn/${entry.slug}`} shape="control" size="md" className="mt-4" onClick={closeTerm}>
          ادامه در دانستنی‌ها
        </ButtonLink>
      </div>
    </div>
  );
}

export function TermChip({
  slug,
  children,
}: {
  slug: string;
  children: React.ReactNode;
}) {
  const { openTerm } = useAroma();
  return (
    <button
      type="button"
      onClick={() => openTerm(slug)}
      className="pressable rounded-full border border-line bg-card px-2.5 py-1 text-label text-muted underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
    >
      {children}
    </button>
  );
}

export function TermText({
  slug,
  children,
  className,
}: {
  slug: string;
  children: React.ReactNode;
  className?: string;
}) {
  const { openTerm } = useAroma();
  return (
    <button
      type="button"
      onClick={() => openTerm(slug)}
      className={cn(
        "text-start underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink",
        className,
      )}
    >
      {children}
    </button>
  );
}
