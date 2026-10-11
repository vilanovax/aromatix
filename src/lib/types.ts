export type Season = "summer" | "winter" | "mild" | "all";
export type Taste = "like" | "try" | "dislike";
export type BottleShape = "rect" | "slim" | "round";
export type Shift = "none" | "fresh" | "different";

export type Accord = {
  name: string;
  color: string;
  strength: number;
};

export type Note = {
  layer: "top" | "middle" | "base";
  name: string;
};

export type ShopOffer = {
  shop: string;
  price: number;
  checkedOn: string;
  stockConfirmed: boolean;
  href: string;
};

export type Perfume = {
  slug: string;
  nameFa: string;
  nameEn: string;
  brand: string;
  marketGender: "مشترک" | "مردانه" | "زنانه";
  concentration: string;
  volumeMl: number;
  bottle: BottleShape;
  cap: string;
  accords: Accord[];
  notes: Note[];
  seasons: Array<Season | "all">;
  occasions: string[];
  tags: string[];
  longevity: number | null;
  sillage: number | null;
  inspiredBy?: string;
  why: string;
  similar: string[];
  shops: ShopOffer[];
  confidence: number;
};

export type Profile = {
  occasions: string[];
  season: Season;
  budget: number;
  reference: string | null;
  shift: Shift;
  note: string | null;
};
