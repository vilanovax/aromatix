export type Season = "summer" | "winter" | "mild" | "all";
/** وضعیت قدیمی قفسه؛ فقط برای خواندن aroma-ui-v1. */
export type LegacyTaste = "like" | "try" | "dislike";
export type BottleShape = "rect" | "slim" | "round";
export type Shift = "none" | "fresh" | "different" | "lasting";
export type Leaning = "sweet" | "woody" | "citrus" | "aquatic";

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
  /** زمان دقیق بررسی؛ برای صف قیمت کهنه در مدیریت. */
  checkedAt?: string;
  stockConfirmed: boolean;
  href: string;
};

export type Perfume = {
  slug: string;
  nameFa: string;
  nameEn: string;
  brand: string;
  /** نام تأییدشدهٔ عطار. تا وقتی در کاتالوگ نیست، در صفحه نشان داده نمی‌شود. */
  perfumer?: string;
  marketGender: "مشترک" | "مردانه" | "زنانه";
  concentration: string;
  volumeMl: number;
  bottle: BottleShape;
  cap: string;
  image?: string;
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
  /** نام‌هایی که دستیار علاوه بر نام فارسی و انگلیسی می‌شناسد. */
  aliases?: string[];
};

export type Profile = {
  occasions: string[];
  season: Season;
  /** null یعنی کاربر سقفی نگفته و نباید بودجه فرض شود. */
  budget: number | null;
  reference: string | null;
  shift: Shift;
  leaning?: Leaning | "any" | null;
  note: string | null;
};

export type UserPerfume = {
  owned: boolean;
  wanted: boolean;
  tried: boolean;
  disliked: boolean;
  rating: number | null;
  ratedAt: string | null;
  /** امتیاز ۸ مهاجرت‌شده از «دوست دارم»؛ تا ثبت دوباره نصف وزن دارد. */
  inferred: boolean;
};

export function emptyUserPerfume(): UserPerfume {
  return {
    owned: false,
    wanted: false,
    tried: false,
    disliked: false,
    rating: null,
    ratedAt: null,
    inferred: false,
  };
}

export function isEmptyUserPerfume(state: UserPerfume) {
  return !state.owned && !state.wanted && !state.tried && !state.disliked && state.rating == null;
}
