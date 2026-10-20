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

export type OfferStock = "in_stock" | "out_of_stock" | "unknown";

export type ShopOffer = {
  /** نام نمایشی فروشگاه. هویت پیشنهاد `shopSlug` است. */
  shop: string;
  shopSlug?: string;
  price: number;
  checkedOn: string;
  /** زمان دقیق بررسی؛ برای صف قیمت کهنه در مدیریت. */
  checkedAt?: string;
  /** فقط `in_stock` لینک خرید دارد. فیلد قدیمی؛ `stock` دقیق‌تر است. */
  stockConfirmed: boolean;
  stock?: OfferStock;
  href: string;
};

/** لینک «یادآور این عطر» به یک مرجع در `references`. */
export type RemindsOfLink = {
  id: string;
  relation: "similar" | "inspired";
  source?: string;
};

export type Perfume = {
  slug: string;
  nameFa: string;
  nameEn: string;
  brand: string;
  /** نام تأییدشدهٔ عطار. تا وقتی در کاتالوگ نیست، در صفحه نشان داده نمی‌شود. */
  perfumer?: string | null;
  marketGender: "مشترک" | "مردانه" | "زنانه";
  /** خالی یعنی هنوز در کاتالوگ ثبت نشده؛ در UI نشان داده نمی‌شود. */
  concentration: string | null;
  /** خالی یعنی حجم معلوم نیست؛ در UI نشان داده نمی‌شود. */
  volumeMl: number | null;
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
  /** شناسهٔ مرجع در `references`. یک عطر یا چند عطر. */
  inspiredBy?: string | string[] | null;
  /**
   * عطرهایی که این شیشه یادشان می‌اندازد (شبیه / الهام‌گرفته).
   * جدا از `inspiredBy`؛ برای نمایش «یاد این عطر می‌افتد».
   */
  remindsOf?: RemindsOfLink[] | null;
  why: string;
  similar: string[];
  shops: ShopOffer[];
  confidence: number;
  /** نام‌هایی که دستیار علاوه بر نام فارسی و انگلیسی می‌شناسد. */
  aliases?: string[];
  /** خانوادهٔ بویایی (کاتالوگ). */
  family?: string | null;
  /** برآورد قیمت کاتالوگ؛ فروشگاه جداست. */
  priceMin?: number | null;
  priceMax?: number | null;
  /** صفحهٔ فراگرانتیکا؛ اگر باشد به‌صورت آیکون در صفحهٔ عطر باز می‌شود. */
  sourceUrl?: string | null;
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
