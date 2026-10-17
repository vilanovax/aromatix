import { TermChip } from "@/components/TermSheet";
import { entryForNote } from "@/lib/knowledge";
import type { Note } from "@/lib/types";

const LAYERS = [
  { id: "top", label: "شروع" },
  { id: "middle", label: "میانه" },
  { id: "base", label: "پایه" },
] as const;

export function NoteStack({ notes }: { notes: Note[] }) {
  const layers = LAYERS.map((layer) => ({
    ...layer,
    notes: notes.filter((note) => note.layer === layer.id),
  })).filter((layer) => layer.notes.length > 0);

  if (layers.length === 0) return null;

  return (
    <div className="mt-3 flex flex-col gap-4">
      {layers.map((layer) => (
        <div key={layer.id}>
          <h3 className="text-label text-muted-foreground">{layer.label}</h3>
          <ul className="mt-2 flex flex-wrap gap-2">
            {layer.notes.map((note) => {
              const lesson = entryForNote(note.name);
              return (
                <li key={`${layer.id}-${note.name}`}>
                  {lesson ? (
                    <TermChip slug={lesson.slug}>{note.name}</TermChip>
                  ) : (
                    <span className="inline-flex min-h-11 items-center text-body">{note.name}</span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}
