import { leaningShare } from "@/lib/catalog";
import { joinFa } from "@/lib/format";
import type { Perfume } from "@/lib/types";

export type CoupleScene = "party" | "car" | "summer";

export type CouplePlan = {
  /** عطری که پخش و ماندگاری بیشتری دارد. */
  lead: Perfume;
  quiet: Perfume;
  bridge: string;
  scenes: Array<{ id: CoupleScene; title: string; line: string }>;
};

/** دو عطر کنار هم، برای مهمانی و ماشین و تابستان. بدون نمرهٔ ساختگی. */
export function couplePlan(left: Perfume, right: Perfume): CouplePlan | null {
  if (left.slug === right.slug) return null;
  const lead = presence(left) >= presence(right) ? left : right;
  const quiet = lead.slug === left.slug ? right : left;
  return {
    lead,
    quiet,
    bridge: bridgeLine(left, right),
    scenes: [
      { id: "party", title: "مهمانی", line: partyLine(lead, quiet) },
      { id: "car", title: "ماشین", line: carLine(lead, quiet) },
      { id: "summer", title: "تابستان", line: summerLine(left, right) },
    ],
  };
}

function presence(perfume: Perfume) {
  const heavy = leaningShare(perfume, "woody") + leaningShare(perfume, "sweet");
  const light = leaningShare(perfume, "citrus") + leaningShare(perfume, "aquatic");
  return (perfume.sillage ?? 3) * 3 + (perfume.longevity ?? 3) + heavy * 4 - light * 2;
}

function summerFit(perfume: Perfume) {
  const pole = seasonPole(perfume);
  const season = pole === "summer" ? 2 : pole === "winter" ? -2 : pole === "all" ? 1 : 0;
  const light = leaningShare(perfume, "citrus") + leaningShare(perfume, "aquatic");
  return season + light * 3 - (perfume.sillage ?? 3) * 0.15;
}

function partyLine(lead: Perfume, quiet: Perfume) {
  const loud = (lead.sillage ?? 0) >= 4 && (quiet.sillage ?? 0) >= 4;
  if (loud) {
    return `هر دو پخش زیاد دارند. در مهمانی ${lead.nameFa} نقش اصلی را بگیرد و هر دو را یک اسپری کمتر بزن.`;
  }
  return `${lead.nameFa} پرصداتر است و نقش اصلی را می‌گیرد. ${quiet.nameFa} را نزدیک‌تر به پوست بزن.`;
}

function carLine(lead: Perfume, quiet: Perfume) {
  if ((lead.sillage ?? 0) >= 4 && (quiet.sillage ?? 0) >= 4) {
    return "ماشین بسته است. هر دو فضا را پر می‌کنند؛ یکی را بزن، نه هر دو.";
  }
  return `ماشین بسته است. ${lead.nameFa} را کمتر بزن. اگر یکی کافی است، ${quiet.nameFa} جا را کمتر می‌گیرد.`;
}

function summerLine(left: Perfume, right: Perfume) {
  const better = summerFit(left) >= summerFit(right) ? left : right;
  const other = better.slug === left.slug ? right : left;
  const betterPole = seasonPole(better);
  const otherPole = seasonPole(other);
  if (betterPole === "summer" && otherPole === "winter") {
    return `${better.nameFa} به گرما نزدیک‌تر است. ${other.nameFa} زمستانی است؛ در تابستان کمتر بزن یا نزن.`;
  }
  if (betterPole === "winter" && otherPole === "winter") {
    return "هر دو برای سرما سنگین‌ترند. در گرما خیلی کم بزن، یا یکی را کنار بگذار.";
  }
  return `در گرما ${better.nameFa} راحت‌تر می‌نشیند. ${other.nameFa} را کمتر بزن.`;
}

function bridgeLine(left: Perfume, right: Perfume) {
  const shared = sharedNames(left, right);
  const sharedBase = shared.filter((name) => isBase(left, name) || isBase(right, name));
  if (sharedBase.length > 0) return `پایهٔ مشترک: ${joinFa(sharedBase)}.`;
  if (shared.length > 0) return `نوت مشترک: ${joinFa(shared)}.`;
  return "نوت مشترکی در این داده نیست.";
}

function sharedNames(left: Perfume, right: Perfume) {
  const names = new Set(left.notes.map((note) => note.name));
  return [...new Set(right.notes.map((note) => note.name).filter((name) => names.has(name)))];
}

function isBase(perfume: Perfume, name: string) {
  return perfume.notes.some((note) => note.layer === "base" && note.name === name);
}

function seasonPole(perfume: Perfume) {
  if (perfume.seasons.includes("all")) return "all";
  const summer = perfume.seasons.includes("summer");
  const winter = perfume.seasons.includes("winter");
  if (summer && !winter) return "summer";
  if (winter && !summer) return "winter";
  return "mild";
}
