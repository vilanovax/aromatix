"use client";

import { cn } from "@/lib/format";
import { useAroma } from "@/lib/store";
import type { Taste } from "@/lib/types";

const OPTIONS: Array<{ id: Taste; label: string; on: string }> = [
  { id: "like", label: "دوست دارم", on: "bg-[var(--ink)] text-[var(--paper)]" },
  { id: "try", label: "امتحان کنم", on: "bg-[var(--moss)] text-[var(--ink)]" },
  { id: "dislike", label: "دوست ندارم", on: "bg-[var(--clay)] text-[var(--danger)]" },
];

export function TasteRow({ slug, dense = false }: { slug: string; dense?: boolean }) {
  const { taste, setTaste } = useAroma();
  const current = taste[slug];

  return (
    <div
      role="group"
      aria-label="نظر تو"
      className={cn("grid grid-cols-3", dense ? "gap-1.5" : "gap-1 rounded-2xl bg-[var(--paper)] p-1")}
    >
      {OPTIONS.map((option) => {
        const selected = current === option.id;
        return (
          <button
            key={option.id}
            type="button"
            aria-pressed={selected}
            onClick={() => setTaste(slug, option.id)}
            className={cn(
              "pressable rounded-xl px-1",
              dense ? "min-h-9 border text-[12px]" : "min-h-10 text-[13px]",
              selected
                ? cn(option.on, "border-transparent font-semibold")
                : dense
                  ? "edge border-[var(--line)] text-[var(--muted)]"
                  : "quiet text-[var(--muted)]",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
