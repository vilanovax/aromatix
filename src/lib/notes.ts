import { publishedPerfumes } from "@/lib/catalog";
import { referenceList, type ReferenceProfile } from "@/lib/references";
import type { Note, Perfume } from "@/lib/types";

const LAYER_ORDER = ["top", "middle", "base"] as const;

export const LAYER_LABEL: Record<Note["layer"], string> = {
  top: "شروع",
  middle: "میانه",
  base: "پایه",
};

export type NoteHit = {
  perfume: Perfume;
  layers: Note["layer"][];
};

export function noteNameFromSlug(slug: string) {
  try {
    return decodeURIComponent(slug).trim();
  } catch {
    return slug.trim();
  }
}

export function noteHref(name: string, from?: string) {
  const path = `/notes/${encodeURIComponent(name)}`;
  return from ? `${path}?from=${encodeURIComponent(from)}` : path;
}

export function perfumesWithNote(name: string): NoteHit[] {
  return publishedPerfumes()
    .flatMap((perfume) => {
      const layers = LAYER_ORDER.filter((layer) =>
        perfume.notes.some((note) => note.name === name && note.layer === layer),
      );
      return layers.length > 0 ? [{ perfume, layers }] : [];
    })
    .sort((a, b) => a.perfume.nameFa.localeCompare(b.perfume.nameFa, "fa"));
}

export function referencesWithNote(name: string): ReferenceProfile[] {
  return referenceList().filter((reference) => reference.notes.some((note) => note.name === name));
}
