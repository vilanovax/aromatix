import type { Perfume } from "@/lib/types";

export function blankPerfume(brand: string): Perfume {
  return {
    slug: "",
    nameFa: "",
    nameEn: "",
    brand,
    marketGender: "مشترک",
    concentration: "ادوپرفیوم",
    volumeMl: 100,
    bottle: "rect",
    cap: "#3E342C",
    accords: [{ name: "", color: "#C4A574", strength: 0.5 }],
    notes: [{ layer: "top", name: "" }],
    seasons: ["all"],
    occasions: ["daily"],
    tags: [],
    longevity: null,
    sillage: null,
    why: "",
    similar: [],
    shops: [],
    confidence: 0.8,
    aliases: [],
  };
}
