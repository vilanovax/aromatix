"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
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
    <div className="vf app fixed inset-0 z-40 flex items-end justify-center bg-transparent">
      <button type="button" className="absolute inset-0 bg-foreground/40" aria-label="بستن توضیح" onClick={closeTerm} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="term-title"
        aria-describedby="term-support"
        className="vf app sheet-panel scroll-quiet relative z-10 max-h-[70dvh] w-full max-w-lg overflow-y-auto overscroll-contain rounded-t-surface border border-border bg-card px-5 pt-3 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-surface"
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-border" aria-hidden="true" />
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 id="term-title" className="text-pretty text-title font-semibold">
              {entry.title}
            </h2>
            <p id="term-support" className="mt-1 text-label text-muted-foreground">
              {entry.support}
            </p>
          </div>
          <Button ref={closeRef} variant="ghost" onClick={closeTerm} className="min-h-11 shrink-0 px-3">
            بستن
          </Button>
        </div>
        <p className="mt-5 text-pretty text-body">{entry.summary}</p>
        <Button href={`/learn/${entry.slug}`} size="lg" className="mt-5 min-h-12 w-full">
          ادامه در دانستنی‌ها
        </Button>
      </div>
    </div>
  );
}

export function TermChip({
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
    <Button
      variant="outline"
      size="md"
      onClick={() => openTerm(slug)}
      className={cn("min-h-11 !rounded-full !bg-card px-3 font-medium", className)}
    >
      {children}
    </Button>
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
  return <TermChip slug={slug} className={className}>{children}</TermChip>;
}
