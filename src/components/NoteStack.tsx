"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/format";
import { noteHref } from "@/lib/notes";
import type { Note } from "@/lib/types";

const LAYERS = [
  { id: "top", label: "شروع" },
  { id: "middle", label: "میانه" },
  { id: "base", label: "پایه" },
] as const;

export function NoteStack({ notes, className }: { notes: Note[]; className?: string }) {
  const pathname = usePathname();
  const search = useSearchParams();
  const query = search.toString();
  const from = query ? `${pathname}?${query}` : pathname;
  const layers = LAYERS.map((layer) => ({
    ...layer,
    notes: notes.filter((note) => note.layer === layer.id),
  })).filter((layer) => layer.notes.length > 0);

  if (layers.length === 0) return null;

  return (
    <ul className={cn("flex flex-col", className)}>
      {layers.map((layer) => (
        <li key={layer.id} className="flex items-center gap-3 border-b border-border py-2 last:border-b-0">
          <h3 className="w-14 shrink-0 text-label text-muted-foreground">{layer.label}</h3>
          <ul className="flex min-w-0 flex-1 flex-wrap gap-2">
            {layer.notes.map((note) => (
              <li key={`${layer.id}-${note.name}`}>
                <Link
                  href={noteHref(note.name, from)}
                  className="inline-flex min-h-11 items-center rounded-full border border-input bg-card px-3 text-body font-medium outline-offset-2 focus-visible:outline-2 focus-visible:outline-ring"
                >
                  {note.name}
                </Link>
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  );
}
