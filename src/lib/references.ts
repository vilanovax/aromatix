import { publishedPerfumes } from "@/lib/catalog";
import type { Accord, Note, Season } from "@/lib/types";

export type ReferenceProfile = {
  id: string;
  nameFa: string;
  nameEn: string;
  /** یک خط برای تصور بو، قبل از فهرست مواد. */
  line: string;
  why: string;
  accords: Accord[];
  notes: Note[];
  seasons: Season[];
  occasions: string[];
  longevity: number;
  sillage: number;
  aliases: string[];
};

const REFERENCES: ReferenceProfile[] = [
  {
    id: "sauvage",
    nameFa: "ساواج",
    nameEn: "Sauvage",
    line: "تازه و تند، با ته‌مایهٔ چوبی.",
    why: "فلفل و اسطوخودوس زود حس می‌شوند و چوب در پایه می‌ماند. در گرما جا می‌شود؛ شب سرد می‌تواند سنگین شود.",
    accords: [
      { name: "آروماتیک", color: "#7FA58A", strength: 0.34 },
      { name: "مرکبات", color: "#C6B15A", strength: 0.28 },
      { name: "ادویه", color: "#8E3D32", strength: 0.22 },
      { name: "چوب", color: "#6E5436", strength: 0.16 },
    ],
    notes: [
      { layer: "top", name: "ترنج" },
      { layer: "top", name: "فلفل سیاه" },
      { layer: "middle", name: "اسطوخودوس" },
      { layer: "base", name: "چوب" },
      { layer: "base", name: "عنبر" },
    ],
    seasons: ["summer", "mild"],
    occasions: ["daily", "date"],
    longevity: 4,
    sillage: 4,
    aliases: ["ساواج", "ساواژ", "sauvage", "savage", "سوواژ", "dior sauvage"],
  },
  {
    id: "aventus",
    nameFa: "اونتوس",
    nameEn: "Aventus",
    line: "میوه‌ای و دودی، با پایهٔ چوبی.",
    why: "آناناس و مرکبات اول می‌آیند و دود خشک تهش می‌ماند. برای هوای معتدل و روز ساخته شده، نه شب زمستانی.",
    accords: [
      { name: "میوه", color: "#D2B15C", strength: 0.34 },
      { name: "دودی", color: "#5C6164", strength: 0.28 },
      { name: "مرکبات", color: "#C6B15A", strength: 0.22 },
      { name: "چوب", color: "#6E5436", strength: 0.16 },
    ],
    notes: [
      { layer: "top", name: "ترنج" },
      { layer: "top", name: "آناناس" },
      { layer: "middle", name: "توس" },
      { layer: "base", name: "مشک" },
      { layer: "base", name: "وتیور" },
    ],
    seasons: ["mild", "summer"],
    occasions: ["daily"],
    longevity: 4,
    sillage: 4,
    aliases: ["اونتوس", "aventus", "کرید اونتوس", "creed aventus"],
  },
  {
    id: "angels",
    nameFa: "آنجلز شیر",
    nameEn: "Angels' Share",
    line: "شیرین و گرم، با ادویه.",
    why: "دارچین و شیرینی غلیظ است. شب و هوای سرد جایش است؛ در گرما زود خسته می‌کند.",
    accords: [
      { name: "دارچین", color: "#A65D3F", strength: 0.32 },
      { name: "وانیل", color: "#C4A574", strength: 0.28 },
      { name: "خرما", color: "#8C4A32", strength: 0.22 },
      { name: "عنبر", color: "#C47B4A", strength: 0.18 },
    ],
    notes: [
      { layer: "top", name: "دارچین" },
      { layer: "middle", name: "خرما" },
      { layer: "middle", name: "وانیل" },
      { layer: "base", name: "عنبر" },
      { layer: "base", name: "وانیل" },
    ],
    seasons: ["winter"],
    occasions: ["night", "date"],
    longevity: 5,
    sillage: 4,
    aliases: ["آنجلز شیر", "انجلز شیر", "آنجلز", "آنجل شیر", "angels share", "angel share", "angels"],
  },
];

const byId = Object.fromEntries(REFERENCES.map((item) => [item.id, item]));

export function getReference(id: string) {
  return byId[id];
}

export function referenceList() {
  return REFERENCES;
}

export function referenceBottles(id: string) {
  return publishedPerfumes().filter((perfume) => perfume.inspiredBy === id);
}

export function findReference(input: string) {
  const haystack = ` ${normalizeAsk(input)} `;
  const names = REFERENCES.flatMap((reference) =>
    reference.aliases.map((alias) => ({ alias: normalizeAsk(alias), reference })),
  ).sort((a, b) => b.alias.length - a.alias.length);

  const hit = names.find(({ alias }) => {
    if (!alias) return false;
    const at = haystack.indexOf(alias);
    if (at < 0) return false;
    return !isLetter(haystack[at - 1]) && !isLetter(haystack[at + alias.length]);
  });
  return hit?.reference ?? null;
}

export function normalizeAsk(input: string) {
  return input
    .replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)))
    .replace(/ي/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/\u200c/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function isLetter(char: string | undefined) {
  return Boolean(char && /[\p{L}]/u.test(char));
}
