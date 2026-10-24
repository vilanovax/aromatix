import { leaningShare } from "@/lib/catalog";
import { joinFa } from "@/lib/format";
import type { Perfume } from "@/lib/types";

export type LayerPlan = {
  /** عطری که اول و زیر زده می‌شود. */
  first: Perfume;
  /** عطری که روی اولی می‌آید. */
  second: Perfume;
  sharedBase: string[];
  shared: string[];
  line: string;
  caution: string | null;
};

/** ترتیب زدن دو عطر از روی ماندگاری، پخش و سنگینی آکورد. نمرهٔ ساختگی ندارد. */
export function layerPlan(left: Perfume, right: Perfume): LayerPlan | null {
  if (left.slug === right.slug) return null;
  const first = weight(left) >= weight(right) ? left : right;
  const second = first.slug === left.slug ? right : left;
  const shared = sharedNames(left, right);
  const sharedBase = shared.filter((name) => isBase(left, name) || isBase(right, name));
  return {
    first,
    second,
    sharedBase,
    shared,
    line: planLine(first, second, sharedBase, shared),
    caution: cautionLine(left, right),
  };
}

function weight(perfume: Perfume) {
  const heavy = leaningShare(perfume, "woody") + leaningShare(perfume, "sweet");
  const light = leaningShare(perfume, "citrus") + leaningShare(perfume, "aquatic");
  return (perfume.longevity ?? 3) * 2 + (perfume.sillage ?? 3) + heavy * 4 - light * 3;
}

function sharedNames(left: Perfume, right: Perfume) {
  const names = new Set(left.notes.map((note) => note.name));
  return [...new Set(right.notes.map((note) => note.name).filter((name) => names.has(name)))];
}

function isBase(perfume: Perfume, name: string) {
  return perfume.notes.some((note) => note.layer === "base" && note.name === name);
}

function planLine(first: Perfume, second: Perfume, sharedBase: string[], shared: string[]) {
  const order = `اول ${first.nameFa} را بزن و ${second.nameFa} را رویش.`;
  if (sharedBase.length > 0) {
    return `${order} در پایه هر دو ${joinFa(sharedBase)} دارند؛ همین‌ها لایه‌ها را به هم وصل می‌کند.`;
  }
  if (shared.length > 0) {
    return `${order} نوت مشترک: ${joinFa(shared)}.`;
  }
  return `${order} نوت مشترکی در این داده نیست؛ اول روی کاغذ تست کنار هم بگیر.`;
}

function cautionLine(left: Perfume, right: Perfume) {
  const notes: string[] = [];
  if ((left.sillage ?? 0) >= 4 && (right.sillage ?? 0) >= 4) {
    notes.push("هر دو پخش بوی زیاد دارند؛ در فضای بسته کمتر بزن.");
  }
  if (seasonClash(left, right)) {
    notes.push("یکی بیشتر تابستانی است و دیگری زمستانی؛ ممکن است با هم نخوانند.");
  }
  return notes.length > 0 ? notes.join(" ") : null;
}

function seasonClash(left: Perfume, right: Perfume) {
  const a = seasonPole(left);
  const b = seasonPole(right);
  return (a === "summer" && b === "winter") || (a === "winter" && b === "summer");
}

function seasonPole(perfume: Perfume) {
  if (perfume.seasons.includes("all")) return "all";
  const summer = perfume.seasons.includes("summer");
  const winter = perfume.seasons.includes("winter");
  if (summer && !winter) return "summer";
  if (winter && !summer) return "winter";
  return "mild";
}
