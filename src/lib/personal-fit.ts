import { getPerfume, LEANINGS, occasionLabel, seasonShort } from "@/lib/catalog";
import { computeDna } from "@/lib/dna";
import { faNum, joinFa } from "@/lib/format";
import type { Accord, Leaning, Note, Perfume, UserPerfume } from "@/lib/types";

export type ScentFace = {
  nameFa: string;
  slug?: string;
  accords: Accord[];
  notes: Note[];
  seasons: string[];
  occasions: string[];
};

export type TasteLevel = "close" | "partial" | "far";

export type PersonalFit = {
  level: TasteLevel | null;
  lines: string[];
  /** شواهد هنوز کم است؛ جمله را قطعی نگو. */
  early: boolean;
};

const LEVEL_SHARE = 0.2;

export function faceFromPerfume(perfume: Perfume): ScentFace {
  return {
    nameFa: perfume.nameFa,
    slug: perfume.slug,
    accords: perfume.accords,
    notes: perfume.notes,
    seasons: perfume.seasons,
    occasions: perfume.occasions,
  };
}

export function personalFit(face: ScentFace, library: Record<string, UserPerfume | undefined>): PersonalFit {
  const dna = computeDna(library, getPerfume);
  const liked = rated(library, (state) => state.rating != null && state.rating >= 7 && !state.disliked);
  const disliked = rated(library, (state) => state.disliked || (state.rating != null && state.rating <= 3));

  const bestLike = bestOverlap(face, liked);
  const bestDislike = bestOverlap(face, disliked);
  const lines: string[] = [];

  if (bestLike && bestLike.shared.length > 0 && bestLike.state.rating != null) {
    lines.push(
      `با ${bestLike.perfume.nameFa} که ${faNum(bestLike.state.rating)} از ۱۰ دادی، ${joinFa(bestLike.shared)} مشترک است.`,
    );
  }
  if (bestDislike && bestDislike.shared.length > 0) {
    lines.push(`با ${bestDislike.perfume.nameFa} که نپسندیدی، ${joinFa(bestDislike.shared)} مشترک است.`);
  }

  const likeCount = bestLike?.shared.length ?? 0;
  const dislikeCount = bestDislike?.shared.length ?? 0;
  let level: TasteLevel | null = null;

  if (liked.length === 0 && disliked.length === 0) {
    return {
      level: null,
      early: false,
      lines: ["یک عطر که دوست داری و یکی که دوست نداری را در قفسه علامت بزن تا بگویم این به سلیقه‌ات می‌خورد یا نه."],
    };
  }

  if (likeCount >= 2 && likeCount > dislikeCount) level = "close";
  else if (dislikeCount >= 2 && dislikeCount >= likeCount) level = "far";
  else if (likeCount > 0 || dislikeCount > 0) level = "partial";

  if (level == null && (dna.stage === "early" || dna.stage === "dna")) {
    const family = familyReading(face, dna.all);
    if (family && family.affinity >= LEVEL_SHARE) {
      level = "partial";
      lines.push(`با «${family.label}» که از امتیازهات درآمده جور است.`);
    } else if (family && family.affinity <= -LEVEL_SHARE) {
      level = "far";
      lines.push(`به «${family.label}» نزدیک است، همان گرایشی که کمتر پسندیدی.`);
    }
  }

  if (lines.length === 0) {
    lines.push("هنوز وجه مشترک روشنی با عطرهایی که امتیاز دادی پیدا نکردم.");
    level = level ?? "partial";
  }

  return { level, lines, early: dna.stage !== "dna" };
}

export function contextFit(
  face: { seasons: string[]; occasions: string[] },
  asked: { occasion: string | null; season: string | null },
) {
  const parts: string[] = [];
  if (asked.occasion) {
    const label = occasionLabel(asked.occasion);
    parts.push(
      face.occasions.includes(asked.occasion)
        ? `برای ${label} در این خانواده آمده.`
        : `برای ${label} در این خانواده نیامده.`,
    );
  }
  if (asked.season && asked.season !== "all") {
    const label = seasonShort(asked.season);
    const ok = face.seasons.includes(asked.season) || face.seasons.includes("all");
    parts.push(ok ? `${label} با این خانواده جور است.` : `برای ${label} در این داده نیامده.`);
  }
  return parts.length > 0 ? parts.join(" ") : null;
}

function familyReading(face: ScentFace, families: Array<{ id: Leaning; label: string; affinity: number }>) {
  let best: { label: string; affinity: number; weight: number } | null = null;
  for (const family of families) {
    const weight = accordShare(face.accords, family.id) * family.affinity;
    if (!best || Math.abs(weight) > Math.abs(best.weight)) {
      best = { label: family.label, affinity: family.affinity, weight };
    }
  }
  if (!best || best.weight === 0) return null;
  return best;
}

function accordShare(accords: Accord[], leaning: Leaning) {
  const wanted = new Set(LEANINGS[leaning].accords);
  return accords.reduce((sum, accord) => (wanted.has(accord.name) ? sum + accord.strength : sum), 0);
}

function rated(
  library: Record<string, UserPerfume | undefined>,
  accept: (state: UserPerfume) => boolean,
) {
  const rows: Array<{ perfume: Perfume; state: UserPerfume }> = [];
  for (const [slug, state] of Object.entries(library)) {
    if (!state || !accept(state)) continue;
    const perfume = getPerfume(slug);
    if (perfume) rows.push({ perfume, state });
  }
  return rows;
}

function bestOverlap(face: ScentFace, rows: Array<{ perfume: Perfume; state: UserPerfume }>) {
  let best: { perfume: Perfume; state: UserPerfume; shared: string[] } | null = null;
  for (const row of rows) {
    if (face.slug && row.perfume.slug === face.slug) continue;
    const shared = sharedTokens(face, row.perfume);
    if (!best || shared.length > best.shared.length) best = { ...row, shared };
  }
  return best;
}

function sharedTokens(face: ScentFace, perfume: Perfume) {
  const wanted = new Set([...face.notes.map((note) => note.name), ...face.accords.map((accord) => accord.name)]);
  const found = [
    ...perfume.notes.map((note) => note.name),
    ...perfume.accords.map((accord) => accord.name),
  ].filter((name) => wanted.has(name));
  return [...new Set(found)].slice(0, 3);
}
