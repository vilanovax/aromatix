"use client";

import { useState } from "react";
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
}: {
  perfume: Perfume;
  className?: string;
  imgClassName?: string;
  sizes?: "hero" | "thumb";
}) {
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(perfume.image) && !failed;

  if (!showImage) {
    return <ScentMark perfume={perfume} className={className} />;
  }

  return (
    <div className={cn("relative overflow-hidden bg-well", className)}>
      <img
        src={perfume.image}
        alt=""
        loading={sizes === "hero" ? "eager" : "lazy"}
        decoding="async"
        onError={() => setFailed(true)}
        className={cn(
          sizes === "hero"
            ? "mx-auto h-full w-auto max-w-full object-contain"
            : "mx-auto h-full w-auto max-h-full object-contain p-1",
          imgClassName,
        )}
      />
    </div>
  );
}
