import { LEANINGS, leaningShare } from "@/lib/catalog";
import { joinFa } from "@/lib/format";
import type { Leaning, Perfume, UserPerfume } from "@/lib/types";

export const FORMULA_VERSION = 1;

const PRESENCE = 0.25;

const COLOR: Record<Leaning, string> = {
  sweet: "#C4A574",
  woody: "#6E5436",
  citrus: "#C6B15A",
  aquatic: "#6E93A3",
};

export type DnaStage = "empty" | "learning" | "early" | "dna";

export type FamilyReading = {
  id: Leaning;
  label: string;
  color: string;
  affinity: number;
  percent: number;
  /** حداکثر دو عطری که این خانواده را بالا کشیده‌اند. */
  from: string[];
};

export type NoteReading = {
  name: string;
  color: string;
  percent: number;
  from: string[];
};

export type DnaProfile = {
  version: number;
  stage: DnaStage;
  validCount: number;
  familyCount: number;
  sentence: string;
  /** خانواده‌های مثبت برای نمایش. نوار از پلهٔ early. */
  top: FamilyReading[];
  /** همهٔ خانواده‌های دارای تجربه، شامل منفی، برای امتیاز پیشنهاد. */
  all: FamilyReading[];
  /** نت‌های با وزن مثبت. در پیشنهاد استفاده نمی‌شود. */
  notes: NoteReading[];
};

const LEARNING = "هنوز در حال شناخت رایحه‌های موردعلاقه‌ات هستیم.";
const UNCLEAR = "هنوز رایحهٔ روشنی از تجربه‌هات درنیامده.";

export function isValidExperience(state: UserPerfume) {
  return state.rating != null || state.disliked;
}

export function computeDna(
  library: Record<string, UserPerfume | undefined>,
  resolve: (slug: string) => Perfume | undefined,
): DnaProfile {
  const samples: Array<{ perfume: Perfume; state: UserPerfume }> = [];
  for (const [slug, state] of Object.entries(library)) {
    if (!state || !isValidExperience(state)) continue;
    const perfume = resolve(slug);
    if (perfume) samples.push({ perfume, state });
  }

  const readings: Array<FamilyReading & { mass: number; present: boolean }> = [];

  for (const id of Object.keys(LEANINGS) as Leaning[]) {
    let raw = 0;
    let mass = 0;
    let seen = false;
    const pulls: Pull[] = [];
    for (const { perfume, state } of samples) {
      const share = leaningShare(perfume, id);
      if (share <= 0) continue;
      if (share >= PRESENCE) seen = true;
      const weight = signalWeight(state);
      raw += share * weight;
      mass += share;
      if (weight > 0) pulls.push({ name: perfume.nameFa, pull: share * weight });
    }
    if (mass <= 0) continue;
    const affinity = clamp(raw / mass, -1, 1);
    readings.push({
      id,
      label: LEANINGS[id].label,
      color: COLOR[id],
      affinity,
      percent: Math.round(Math.max(0, affinity) * 100),
      from: witnesses(pulls),
      mass,
      present: seen,
    });
  }

  const validCount = samples.length;
  const familyCount = readings.filter((family) => family.present).length;
  const stage = stageFor(validCount, familyCount);
  const ranked = readings
    .filter((family) => family.present && family.affinity > 0)
    .sort((a, b) => b.affinity - a.affinity || b.mass - a.mass);
  const top = ranked.slice(0, 3).map(strip);

  return {
    version: FORMULA_VERSION,
    stage,
    validCount,
    familyCount,
    sentence: sentenceFor(stage, ranked.slice(0, 2).map(strip)),
    top,
    all: readings.filter((family) => family.present).map(strip),
    notes: noteReadings(samples, top[0]?.color ?? ""),
  };
}

function strip(family: FamilyReading & { mass: number; present: boolean }): FamilyReading {
  return {
    id: family.id,
    label: family.label,
    color: family.color,
    affinity: family.affinity,
    percent: family.percent,
    from: family.from,
  };
}

type Pull = { name: string; pull: number };

function witnesses(pulls: Pull[]) {
  return pulls
    .filter((item) => item.pull > 0)
    .sort((a, b) => b.pull - a.pull || a.name.localeCompare(b.name, "fa"))
    .slice(0, 2)
    .map((item) => item.name);
}

function noteReadings(samples: Array<{ perfume: Perfume; state: UserPerfume }>, fallback: string): NoteReading[] {
  const bucket = new Map<string, { weight: number; color: string; pulls: Pull[] }>();

  for (const { perfume, state } of samples) {
    const weight = signalWeight(state);
    if (weight <= 0) continue;
    const seen = new Set<string>();
    for (const note of perfume.notes ?? []) {
      const name = note.name.trim();
      if (!name || seen.has(name)) continue;
      seen.add(name);
      const row = bucket.get(name) ?? { weight: 0, color: "", pulls: [] };
      row.weight += weight;
      if (!row.color) row.color = noteColor(perfume, name);
      row.pulls.push({ name: perfume.nameFa, pull: weight });
      bucket.set(name, row);
    }
  }

  const ranked = [...bucket.entries()]
    .filter((entry) => entry[1].weight > 0)
    .sort((a, b) => b[1].weight - a[1].weight || a[0].localeCompare(b[0], "fa"));
  const peak = ranked[0]?.[1].weight ?? 0;
  if (peak <= 0) return [];

  return ranked.slice(0, 5).map(([name, row]) => ({
    name,
    color: row.color || fallback || COLOR.woody,
    percent: Math.round((row.weight / peak) * 100),
    from: witnesses(row.pulls),
  }));
}

function noteColor(perfume: Perfume, name: string) {
  const accord = perfume.accords.find((item) => item.name === name);
  if (accord?.color) return accord.color;
  for (const id of Object.keys(LEANINGS) as Leaning[]) {
    if (LEANINGS[id].accords.includes(name)) return COLOR[id];
  }
  return "";
}

export function shelfBucket(state: UserPerfume): "owned" | "experienced" | "wanted" | "disliked" | null {
  if (state.owned) return "owned";
  if (state.disliked) return "disliked";
  if (state.rating != null) return "experienced";
  if (state.wanted) return "wanted";
  return null;
}

function stageFor(validCount: number, familyCount: number): DnaStage {
  if (validCount === 0) return "empty";
  if (validCount < 4 || familyCount < 1) return "learning";
  if (validCount >= 6 && familyCount >= 3) return "dna";
  return "early";
}

function sentenceFor(stage: DnaStage, top: FamilyReading[]) {
  if (stage === "empty" || stage === "learning") return LEARNING;
  if (top.length === 0) return UNCLEAR;
  const names = joinFa(top.map((family) => family.label));
  if (stage === "early") return `بر اساس انتخاب‌های اولیه‌ات، ${names} را بیشتر می‌پسندی.`;
  return `از عطرهایی که امتیاز دادی، ${names} را بیشتر می‌پسندی.`;
}

function signalWeight(state: UserPerfume) {
  if (state.disliked && state.rating == null) return -1;
  if (state.rating == null) return 0;
  const weight = ratingWeight(state.rating);
  return state.inferred ? weight * 0.5 : weight;
}

function ratingWeight(rating: number) {
  if (rating >= 9) return 1;
  if (rating >= 7) return 0.6;
  if (rating >= 4) return 0;
  return -1;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
