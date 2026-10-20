"use client";

import { useEffect, useId, useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/format";
import type { Perfume } from "@/lib/types";

export function ScentMark({ perfume, className }: { perfume: Perfume; className?: string }) {
  const total = perfume.accords.reduce((sum, accord) => sum + accord.strength, 0) || 1;
  const last = Math.max(perfume.accords.length - 1, 1);

  return (
    <div className={cn("relative overflow-hidden bg-well", className)} aria-hidden="true">
      <svg viewBox="0 0 160 100" className="h-full w-full" preserveAspectRatio="xMidYMid meet">
        {perfume.accords.map((accord, index) => {
          const share = accord.strength / total;
          const radius = 20 + share * 36;
          const cx = 42 + (index * 76) / last;
          const cy = 50;
          return <circle key={accord.name} cx={cx} cy={cy} r={radius} fill={accord.color} opacity="0.92" />;
        })}
      </svg>
    </div>
  );
}

export function PerfumePhoto({
  perfume,
  className,
  imgClassName,
  sizes = "hero",
  alt = "",
  zoomable = false,
}: {
  perfume: Perfume;
  className?: string;
  imgClassName?: string;
  sizes?: "hero" | "thumb";
  alt?: string;
  /** با ضربه یا کلیک، شیشه تمام‌صفحه باز می‌شود. */
  zoomable?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const [open, setOpen] = useState(false);
  const showImage = Boolean(perfume.image) && !failed;
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      prev?.focus();
    };
  }, [open]);

  if (!showImage) {
    return <ScentMark perfume={perfume} className={className} />;
  }

  // فایل‌های استوریج حاشیهٔ استودیو دارند؛ کمی زوم تا شیشه درشت‌تر دیده شود.
  const imageClass = cn(
    sizes === "hero"
      ? "mx-auto h-full w-auto max-w-none object-contain scale-125 origin-center"
      : "h-full w-full object-cover object-center",
    imgClassName,
  );

  const photo = (
    <img
      src={perfume.image}
      alt={alt}
      loading={sizes === "hero" ? "eager" : "lazy"}
      decoding="async"
      onError={() => setFailed(true)}
      className={imageClass}
    />
  );

  if (!zoomable) {
    return <div className={cn("relative overflow-hidden bg-well", className)}>{photo}</div>;
  }

  const zoomLabel = alt ? `بزرگ‌نمایی ${alt}` : `بزرگ‌نمایی شیشهٔ ${perfume.nameFa}`;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={zoomLabel}
        className={cn(
          "relative block w-full cursor-zoom-in overflow-hidden bg-well outline-offset-2 focus-visible:outline-2 focus-visible:outline-ring",
          className,
        )}
      >
        {photo}
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/70 p-4 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="relative flex max-h-[90dvh] w-full max-w-lg items-center justify-center animate-fade-up [animation-duration:200ms]"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id={titleId} className="sr-only">
              {alt || `شیشهٔ ${perfume.nameFa}`}
            </h2>
            <button
              type="button"
              aria-label="بستن"
              onClick={() => setOpen(false)}
              className="absolute inset-e-0 top-0 z-10 flex size-11 items-center justify-center rounded-full bg-card text-foreground shadow-surface outline-offset-2 focus-visible:outline-2 focus-visible:outline-ring"
            >
              <X strokeWidth={2} className="size-5" aria-hidden="true" />
            </button>
            <img
              src={perfume.image}
              alt={alt || `شیشهٔ ${perfume.nameFa}`}
              className="max-h-[90dvh] w-auto max-w-full object-contain"
            />
          </div>
        </div>
      ) : null}
    </>
  );
}
