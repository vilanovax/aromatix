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
};

export type DnaProfile = {
  version: number;
  stage: DnaStage;
  validCount: number;
  familyCount: number;
  sentence: string;
  /** خانواده‌های مثبت برای نمایش. نوار درصد فقط در پلهٔ dna. */
  top: FamilyReading[];
  /** همهٔ خانواده‌های دارای تجربه، شامل منفی، برای امتیاز پیشنهاد. */
  all: FamilyReading[];
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
    for (const { perfume, state } of samples) {
      const share = leaningShare(perfume, id);
      if (share <= 0) continue;
      if (share >= PRESENCE) seen = true;
      raw += share * signalWeight(state);
      mass += share;
    }
    if (mass <= 0) continue;
    const affinity = clamp(raw / mass, -1, 1);
    readings.push({
      id,
      label: LEANINGS[id].label,
      color: COLOR[id],
      affinity,
      percent: Math.round(Math.max(0, affinity) * 100),
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
  };
}

function strip(family: FamilyReading & { mass: number; present: boolean }): FamilyReading {
  return {
    id: family.id,
    label: family.label,
    color: family.color,
    affinity: family.affinity,
    percent: family.percent,
  };
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
  return `تا اینجا ${joinFa(top.map((family) => family.label))} را بیشتر می‌پسندی.`;
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
