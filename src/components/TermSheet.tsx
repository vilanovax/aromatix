"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { Button, ButtonLink } from "@/components/Button";
import { cn } from "@/lib/format";
import { getEntry } from "@/lib/knowledge";
import { useAroma } from "@/lib/store";

export function TermSheet() {
  const pathname = usePathname();
  const { termFor, closeTerm } = useAroma();
  const closeRef = useRef<HTMLButtonElement>(null);
  const closeTermRef = useRef(closeTerm);
  const entry = termFor ? getEntry(termFor) : undefined;

  closeTermRef.current = closeTerm;

  useEffect(() => {
    closeTermRef.current();
  }, [pathname]);

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
        aria-describedby="term-support"
        className="scroll-quiet sheet-panel relative z-10 max-h-[70dvh] w-full max-w-lg overflow-y-auto overscroll-contain rounded-t-sheet bg-card px-5 pt-3 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-sheet"
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-line" aria-hidden="true" />
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 id="term-title" className="text-pretty text-title font-semibold">
              {entry.title}
            </h2>
            <p id="term-support" className="mt-1 text-label text-muted">
              {entry.support}
            </p>
          </div>
          <Button
            ref={closeRef}
            variant="quiet"
            shape="pill"
            size="sm"
            onClick={closeTerm}
            className="shrink-0 px-3 py-2 text-body outline-offset-2 focus-visible:outline-2 focus-visible:outline-ink"
          >
            بستن
          </Button>
        </div>
        <p className="mt-5 text-pretty text-body">{entry.summary}</p>
        <ButtonLink
          href={`/learn/${entry.slug}`}
          shape="control"
          size="lg"
          className="mt-5 w-full outline-offset-2 focus-visible:outline-2 focus-visible:outline-paper"
        >
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
