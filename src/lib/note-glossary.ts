import glossary from "@/lib/notes-glossary.json";

type GlossaryNote = {
  nameFa: string;
  nameEn: string | null;
  count: number;
  aliases: string[];
  pair: string;
};

const notes = glossary.notes as GlossaryNote[];

function keyOf(name: string) {
  return name.replace(/\u200c/g, "").replace(/\s+/g, " ").trim();
}

const byName = new Map<string, GlossaryNote>();
for (const note of notes) {
  byName.set(keyOf(note.nameFa), note);
}

const englishByName = new Map<string, string>();
for (const note of notes) {
  if (!note.nameEn) continue;
  englishByName.set(keyOf(note.nameFa), note.nameEn);
}
for (const note of notes) {
  if (!note.nameEn) continue;
  for (const alias of note.aliases) {
    const key = keyOf(alias);
    if (byName.has(key) || englishByName.has(key)) continue;
    englishByName.set(key, note.nameEn);
  }
}

/** نام انگلیسی نت از واژه‌نامه. نام فارسی رکورد عطر عوض نمی‌شود. */
export function noteEnglish(name: string): string | null {
  const key = keyOf(name);
  return englishByName.get(key) ?? null;
}
