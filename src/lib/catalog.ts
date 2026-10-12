import type { Leaning, Perfume } from "@/lib/types";

const narsiso = "https://narsiso.com";
const atrarya = "https://atrarya.com";
const liliome = "https://liliome.com";

export const OCCASIONS = [
  { id: "night", label: "مهمانی شب" },
  { id: "office", label: "محل کار" },
  { id: "date", label: "قرار" },
  { id: "daily", label: "هر روز" },
  { id: "sport", label: "ورزش و فضای باز" },
] as const;

export const SEASONS = [
  { id: "summer", label: "تابستان و گرما", short: "تابستان" },
  { id: "winter", label: "زمستان و سرما", short: "زمستان" },
  { id: "mild", label: "هوای معتدل", short: "هوای معتدل" },
  { id: "all", label: "همهٔ فصل‌ها", short: "همهٔ فصل‌ها" },
] as const;

export const BUDGETS = [
  { id: 2, label: "تا ۲ میلیون" },
  { id: 5, label: "تا ۵ میلیون" },
  { id: 8, label: "تا ۸ میلیون" },
  { id: 12, label: "تا ۱۲ میلیون" },
] as const;

export const REFERENCES = [
  { id: "sauvage", label: "ساواج" },
  { id: "aventus", label: "اونتوس" },
  { id: "angels", label: "آنجلز شیر" },
  { id: "none", label: "هیچ‌کدام" },
] as const;

export const perfumes: Perfume[] = [
  {
    slug: "khamrah",
    nameFa: "خمره",
    nameEn: "Lattafa Khamrah",
    brand: "لطافه",
    marketGender: "مشترک",
    concentration: "ادوپرفیوم",
    volumeMl: 100,
    bottle: "rect",
    cap: "#3E342C",
    image: "/perfumes/khamrah.jpg",
    accords: [
      { name: "خرما", color: "#8C4A32", strength: 0.34 },
      { name: "وانیل", color: "#C4A574", strength: 0.28 },
      { name: "دارچین", color: "#A65D3F", strength: 0.22 },
      { name: "مشک", color: "#B7A99A", strength: 0.16 },
    ],
    notes: [
      { layer: "top", name: "دارچین" },
      { layer: "top", name: "جوز هندی" },
      { layer: "middle", name: "خرما" },
      { layer: "middle", name: "گل سرخ" },
      { layer: "base", name: "وانیل" },
      { layer: "base", name: "مشک" },
    ],
    seasons: ["winter"],
    occasions: ["night", "date"],
    tags: ["sweet", "warm"],
    longevity: 5,
    sillage: 4,
    inspiredBy: "angels",
    why: "خرما، دارچین و وانیل گرم است و برای مهمانی شب زمستان جمع می‌شود.",
    similar: ["qahwa", "kismet-angel", "liquid-brun"],
    confidence: 0.92,
    shops: [
      { shop: "نرسیسو", price: 3_650_000, checkedOn: "۱۲ مهر ۱۴۰۴", stockConfirmed: true, href: narsiso },
      { shop: "عطرآریا", price: 3_480_000, checkedOn: "۲ مرداد ۱۴۰۴", stockConfirmed: false, href: atrarya },
    ],
  },
  {
    slug: "kismet-angel",
    nameFa: "کیسمت انجل",
    nameEn: "Kismet Angel",
    brand: "میسون الحمرا",
    marketGender: "مشترک",
    concentration: "ادوپرفیوم",
    volumeMl: 100,
    bottle: "round",
    cap: "#6E6248",
    image: "/perfumes/kismet-angel.jpg",
    accords: [
      { name: "پرالین", color: "#B5816A", strength: 0.36 },
      { name: "وانیل", color: "#C4A574", strength: 0.27 },
      { name: "عنبر", color: "#C47B4A", strength: 0.22 },
      { name: "چوب", color: "#6E5436", strength: 0.15 },
    ],
    notes: [
      { layer: "top", name: "کنیاک" },
      { layer: "middle", name: "پرالین" },
      { layer: "middle", name: "دارچین" },
      { layer: "base", name: "وانیل" },
      { layer: "base", name: "چوب صندل" },
    ],
    seasons: ["winter"],
    occasions: ["night", "date"],
    tags: ["sweet", "warm"],
    longevity: 4,
    sillage: 4,
    inspiredBy: "angels",
    why: "شیرین و کمی الکلی است. اگر خمره را بشناسی، این یکی به آنجلز شیر نزدیک‌تر است.",
    similar: ["khamrah", "liquid-brun", "qahwa"],
    confidence: 0.86,
    shops: [
      { shop: "لیلیوم", price: 4_100_000, checkedOn: "۱۲ مهر ۱۴۰۴", stockConfirmed: true, href: liliome },
    ],
  },
  {
    slug: "liquid-brun",
    nameFa: "لیکویید برون",
    nameEn: "Liquid Brun",
    brand: "فرنچ اونیو",
    marketGender: "مشترک",
    concentration: "ادوپرفیوم",
    volumeMl: 100,
    bottle: "rect",
    cap: "#2C2A28",
    image: "/perfumes/liquid-brun.jpg",
    accords: [
      { name: "وانیل", color: "#C4A574", strength: 0.4 },
      { name: "پرالین", color: "#B5816A", strength: 0.32 },
      { name: "چوب", color: "#6E5436", strength: 0.28 },
    ],
    notes: [
      { layer: "top", name: "هل" },
      { layer: "middle", name: "وانیل" },
      { layer: "middle", name: "پرالین" },
      { layer: "base", name: "چوب صندل" },
      { layer: "base", name: "مشک" },
    ],
    seasons: ["winter"],
    occasions: ["night", "date"],
    tags: ["sweet", "warm"],
    longevity: 5,
    sillage: 4,
    why: "وانیل و پرالین خامه‌ای است؛ شیرین‌تر از خمره و سنگین‌تر از اسد.",
    similar: ["kismet-angel", "khamrah"],
    confidence: 0.8,
    shops: [
      { shop: "نرسیسو", price: 6_900_000, checkedOn: "۹ مهر ۱۴۰۴", stockConfirmed: true, href: narsiso },
    ],
  },
  {
    slug: "qahwa",
    nameFa: "خمره قهوه",
    nameEn: "Khamrah Qahwa",
    brand: "لطافه",
    marketGender: "مشترک",
    concentration: "ادوپرفیوم",
    volumeMl: 100,
    bottle: "rect",
    cap: "#3A2A22",
    image: "/perfumes/qahwa.jpg",
    accords: [
      { name: "قهوه", color: "#6B4636", strength: 0.38 },
      { name: "خرما", color: "#8C4A32", strength: 0.27 },
      { name: "وانیل", color: "#C4A574", strength: 0.2 },
      { name: "هل", color: "#A08B62", strength: 0.15 },
    ],
    notes: [
      { layer: "top", name: "هل" },
      { layer: "top", name: "دارچین" },
      { layer: "middle", name: "قهوه" },
      { layer: "middle", name: "خرما" },
      { layer: "base", name: "وانیل" },
    ],
    seasons: ["winter"],
    occasions: ["night", "daily"],
    tags: ["sweet", "warm"],
    longevity: 4,
    sillage: 4,
    inspiredBy: "angels",
    why: "قهوه و خرماست. نزدیک خمره، با تلخی قهوه که شیرینی را مهار می‌کند.",
    similar: ["khamrah", "kismet-angel"],
    confidence: 0.74,
    shops: [
      { shop: "عطرآریا", price: 4_400_000, checkedOn: "۱۱ مهر ۱۴۰۴", stockConfirmed: true, href: atrarya },
    ],
  },
  {
    slug: "asad",
    nameFa: "اسد",
    nameEn: "Lattafa Asad",
    brand: "لطافه",
    marketGender: "مردانه",
    concentration: "ادوپرفیوم",
    volumeMl: 100,
    bottle: "slim",
    cap: "#1C1C1C",
    image: "/perfumes/asad.jpg",
    accords: [
      { name: "ادویه", color: "#8E3D32", strength: 0.34 },
      { name: "وانیل", color: "#C4A574", strength: 0.26 },
      { name: "چوب", color: "#6E5436", strength: 0.22 },
      { name: "دودی", color: "#5C6164", strength: 0.18 },
    ],
    notes: [
      { layer: "top", name: "فلفل سیاه" },
      { layer: "top", name: "آناناس" },
      { layer: "middle", name: "اسطوخودوس" },
      { layer: "middle", name: "قهوه" },
      { layer: "base", name: "وانیل" },
      { layer: "base", name: "چوب" },
    ],
    seasons: ["all"],
    occasions: ["night", "daily"],
    tags: ["spicy", "warm"],
    longevity: 4,
    sillage: 4,
    inspiredBy: "sauvage",
    why: "ادویه و وانیل تیره دارد. اگر ساواج الکسیر را بشناسی، حال‌وهوای همان خانواده را دارد.",
    similar: ["cdnim", "nine-pm"],
    confidence: 0.88,
    shops: [
      { shop: "نرسیسو", price: 3_200_000, checkedOn: "۱۲ مهر ۱۴۰۴", stockConfirmed: true, href: narsiso },
    ],
  },
  {
    slug: "cdnim",
    nameFa: "کلاب دِ نویت اینتنس",
    nameEn: "Club de Nuit Intense Man",
    brand: "آرماف",
    marketGender: "مردانه",
    concentration: "ادوتویلت",
    volumeMl: 105,
    bottle: "slim",
    cap: "#C5C7C4",
    image: "/perfumes/cdnim.jpg",
    accords: [
      { name: "میوه", color: "#D2B15C", strength: 0.3 },
      { name: "دودی", color: "#5C6164", strength: 0.26 },
      { name: "مرکبات", color: "#C6B15A", strength: 0.24 },
      { name: "مشک", color: "#B7A99A", strength: 0.2 },
    ],
    notes: [
      { layer: "top", name: "ترنج" },
      { layer: "top", name: "آناناس" },
      { layer: "middle", name: "توس" },
      { layer: "middle", name: "یاس" },
      { layer: "base", name: "مشک" },
      { layer: "base", name: "وتیور" },
    ],
    seasons: ["summer", "mild"],
    occasions: ["daily", "sport"],
    tags: ["fresh", "smoky"],
    longevity: 4,
    sillage: 5,
    inspiredBy: "aventus",
    why: "میوه و دود خشک است. اگر اونتوس را دوست داشته باشی، از همین خانواده است.",
    similar: ["asad", "fakhar"],
    confidence: 0.9,
    shops: [
      { shop: "لیلیوم", price: 2_450_000, checkedOn: "۱۰ مهر ۱۴۰۴", stockConfirmed: true, href: liliome },
    ],
  },
  {
    slug: "fakhar",
    nameFa: "فخار",
    nameEn: "Fakhar Black",
    brand: "لطافه",
    marketGender: "مردانه",
    concentration: "ادوپرفیوم",
    volumeMl: 100,
    bottle: "slim",
    cap: "#1F2428",
    image: "/perfumes/fakhar.jpg",
    accords: [
      { name: "آروماتیک", color: "#7FA58A", strength: 0.34 },
      { name: "مرکبات", color: "#C6B15A", strength: 0.26 },
      { name: "چوب", color: "#6E5436", strength: 0.22 },
      { name: "مشک", color: "#B7A99A", strength: 0.18 },
    ],
    notes: [
      { layer: "top", name: "سیب" },
      { layer: "top", name: "زنجبیل" },
      { layer: "middle", name: "اسطوخودوس" },
      { layer: "middle", name: "مریم‌گلی" },
      { layer: "base", name: "وتیور" },
      { layer: "base", name: "چوب" },
    ],
    seasons: ["summer", "mild"],
    occasions: ["office", "daily"],
    tags: ["fresh"],
    longevity: 3,
    sillage: 3,
    why: "تازه و آروماتیک است و برای محل کار در گرما شلوغ نیست.",
    similar: ["hayaati", "milestone", "cdnim"],
    confidence: 0.9,
    shops: [
      { shop: "نرسیسو", price: 1_850_000, checkedOn: "۱۲ مهر ۱۴۰۴", stockConfirmed: true, href: narsiso },
    ],
  },
  {
    slug: "hayaati",
    nameFa: "حیاتی",
    nameEn: "Lattafa Hayaati",
    brand: "لطافه",
    marketGender: "مردانه",
    concentration: "ادوپرفیوم",
    volumeMl: 100,
    bottle: "round",
    cap: "#8AA0A6",
    image: "/perfumes/hayaati.jpg",
    accords: [
      { name: "آبی", color: "#6E93A3", strength: 0.4 },
      { name: "نعنا", color: "#7FA58A", strength: 0.28 },
      { name: "مرکبات", color: "#C6B15A", strength: 0.2 },
      { name: "مشک", color: "#B7A99A", strength: 0.12 },
    ],
    notes: [
      { layer: "top", name: "نعنا" },
      { layer: "top", name: "سیب" },
      { layer: "middle", name: "یاس" },
      { layer: "base", name: "مشک" },
      { layer: "base", name: "چوب" },
    ],
    seasons: ["summer"],
    occasions: ["office", "sport", "daily"],
    tags: ["fresh"],
    longevity: 3,
    sillage: 3,
    why: "آبی و نعنایی است و برای هوای گرم و فضای باز ساخته شده.",
    similar: ["milestone", "fakhar"],
    confidence: 0.84,
    shops: [
      { shop: "عطرآریا", price: 1_980_000, checkedOn: "۸ مهر ۱۴۰۴", stockConfirmed: true, href: atrarya },
    ],
  },
  {
    slug: "milestone",
    nameFa: "مایلستون",
    nameEn: "Armaf Milestone",
    brand: "آرماف",
    marketGender: "مشترک",
    concentration: "ادوپرفیوم",
    volumeMl: 100,
    bottle: "rect",
    cap: "#D5D8D6",
    image: "/perfumes/milestone.jpg",
    accords: [
      { name: "آبی", color: "#6E93A3", strength: 0.36 },
      { name: "نمک", color: "#C5CBD0", strength: 0.24 },
      { name: "مرکبات", color: "#C6B15A", strength: 0.22 },
      { name: "چوب", color: "#6E5436", strength: 0.18 },
    ],
    notes: [
      { layer: "top", name: "ترنج" },
      { layer: "top", name: "فلفل صورتی" },
      { layer: "middle", name: "آب دریا" },
      { layer: "base", name: "چوب" },
      { layer: "base", name: "عنبر" },
    ],
    seasons: ["summer"],
    occasions: ["office", "daily"],
    tags: ["fresh"],
    longevity: null,
    sillage: 3,
    why: "آبی و چوبی سبک است. برای محل کار در گرما جمع‌وجور می‌ماند.",
    similar: ["hayaati", "fakhar"],
    confidence: 0.7,
    shops: [
      { shop: "لیلیوم", price: 1_700_000, checkedOn: "۱۸ خرداد ۱۴۰۴", stockConfirmed: false, href: liliome },
    ],
  },
  {
    slug: "yara",
    nameFa: "یارا",
    nameEn: "Lattafa Yara",
    brand: "لطافه",
    marketGender: "زنانه",
    concentration: "ادوپرفیوم",
    volumeMl: 100,
    bottle: "round",
    cap: "#E4D5D8",
    image: "/perfumes/yara.jpg",
    accords: [
      { name: "گل", color: "#C47B86", strength: 0.34 },
      { name: "وانیل", color: "#C4A574", strength: 0.28 },
      { name: "میوه", color: "#D2A0A8", strength: 0.22 },
      { name: "مشک", color: "#B7A99A", strength: 0.16 },
    ],
    notes: [
      { layer: "top", name: "ارکیده" },
      { layer: "middle", name: "گل سرخ" },
      { layer: "middle", name: "میوه استوایی" },
      { layer: "base", name: "وانیل" },
      { layer: "base", name: "مشک" },
    ],
    seasons: ["mild"],
    occasions: ["daily", "date"],
    tags: ["sweet"],
    longevity: 4,
    sillage: 3,
    why: "شیرین و گلی است و بیشتر به روز و هوای معتدل می‌خورد.",
    similar: ["khamrah", "emeer"],
    confidence: 0.83,
    shops: [
      { shop: "نرسیسو", price: 2_900_000, checkedOn: "۱۲ مهر ۱۴۰۴", stockConfirmed: true, href: narsiso },
    ],
  },
  {
    slug: "nine-pm",
    nameFa: "۹ پی‌ام",
    nameEn: "Afnan 9pm",
    brand: "افنان",
    marketGender: "مردانه",
    concentration: "ادوپرفیوم",
    volumeMl: 100,
    bottle: "slim",
    cap: "#1A1420",
    image: "/perfumes/nine-pm.jpg",
    accords: [
      { name: "وانیل", color: "#C4A574", strength: 0.36 },
      { name: "سیب", color: "#C6B15A", strength: 0.24 },
      { name: "ادویه", color: "#8E3D32", strength: 0.22 },
      { name: "عنبر", color: "#C47B4A", strength: 0.18 },
    ],
    notes: [
      { layer: "top", name: "سیب" },
      { layer: "top", name: "دارچین" },
      { layer: "middle", name: "اسطوخودوس" },
      { layer: "base", name: "وانیل" },
      { layer: "base", name: "تونکا" },
    ],
    seasons: ["winter", "mild"],
    occasions: ["night", "daily"],
    tags: ["sweet", "warm"],
    longevity: 5,
    sillage: 5,
    why: "سیب و وانیل گرم است و برای شب و مهمانی پخش خوبی دارد.",
    similar: ["asad", "khamrah", "liquid-brun"],
    confidence: 0.87,
    shops: [
      { shop: "نرسیسو", price: 2_750_000, checkedOn: "۱۲ مهر ۱۴۰۴", stockConfirmed: true, href: narsiso },
      { shop: "لیلیوم", price: 2_680_000, checkedOn: "۱۰ مهر ۱۴۰۴", stockConfirmed: true, href: liliome },
    ],
  },
  {
    slug: "emeer",
    nameFa: "امیر",
    nameEn: "Lattafa Emeer",
    brand: "لطافه",
    marketGender: "مشترک",
    concentration: "ادوپرفیوم",
    volumeMl: 100,
    bottle: "slim",
    cap: "#B08A6A",
    image: "/perfumes/emeer.jpg",
    accords: [
      { name: "عنبر", color: "#C47B4A", strength: 0.32 },
      { name: "چوب", color: "#6E5436", strength: 0.28 },
      { name: "مرکبات", color: "#C6B15A", strength: 0.22 },
      { name: "وانیل", color: "#C4A574", strength: 0.18 },
    ],
    notes: [
      { layer: "top", name: "ترنج" },
      { layer: "middle", name: "چوب صندل" },
      { layer: "middle", name: "عنبر" },
      { layer: "base", name: "وانیل" },
      { layer: "base", name: "مشک" },
    ],
    seasons: ["mild", "winter"],
    occasions: ["date", "daily", "night"],
    tags: ["warm"],
    longevity: 4,
    sillage: 3,
    why: "عنبر و چوب گرم است؛ برای قرار و هوای معتدل نرم می‌نشیند.",
    similar: ["yara", "khamrah", "asad"],
    confidence: 0.78,
    shops: [
      { shop: "عطرآریا", price: 3_100_000, checkedOn: "۹ مهر ۱۴۰۴", stockConfirmed: true, href: atrarya },
    ],
  },
];

export const perfumeBySlug = Object.fromEntries(perfumes.map((perfume) => [perfume.slug, perfume]));

export type Brand = {
  slug: string;
  nameFa: string;
  nameEn: string;
};

export const brands: Brand[] = [
  { slug: "lattafa", nameFa: "لطافه", nameEn: "Lattafa" },
  { slug: "armaf", nameFa: "آرماف", nameEn: "Armaf" },
  { slug: "afnan", nameFa: "افنان", nameEn: "Afnan" },
  { slug: "maison-alhambra", nameFa: "میسون الحمرا", nameEn: "Maison Alhambra" },
  { slug: "french-avenue", nameFa: "فرنچ اونیو", nameEn: "French Avenue" },
];

export const LEANINGS: Record<Leaning, { label: string; note: string; accords: string[] }> = {
  sweet: { label: "گرم و شیرین", note: "گرم‌تر و شیرین‌تر چیده شد.", accords: ["وانیل", "خرما", "پرالین", "کارامل", "عنبر"] },
  woody: { label: "تلخ و چوبی", note: "تلخ‌تر و چوبی‌تر چیده شد.", accords: ["چوب", "دودی", "ادویه", "قهوه"] },
  citrus: { label: "تازه و مرکباتی", note: "تازه‌تر و مرکباتی‌تر چیده شد.", accords: ["مرکبات", "آروماتیک", "میوه"] },
  aquatic: { label: "آبی و خنک", note: "آبی‌تر و خنک‌تر چیده شد.", accords: ["آبی", "نعنا", "نمک"] },
};

export function leaningShare(perfume: Perfume, leaning: Leaning) {
  const wanted = new Set(LEANINGS[leaning].accords);
  return perfume.accords.reduce((sum, accord) => (wanted.has(accord.name) ? sum + accord.strength : sum), 0);
}

const NAME_ALIASES: Record<string, string[]> = {
  khamrah: ["khamrah"],
  "kismet-angel": ["kismet", "کیسمت"],
  "liquid-brun": ["liquid brun", "لیکوئید برون"],
  qahwa: ["qahwa", "قهوه لطافه"],
  asad: ["asad"],
  cdnim: ["club de nuit", "cdnim", "کلاب دنویت", "کلاب د نویت"],
  fakhar: ["fakhar"],
  hayaati: ["hayaati", "حیاتی"],
  milestone: ["milestone"],
  yara: ["yara"],
  "nine-pm": ["9pm", "۹pm", "افنان", "ناین پی ام", "۹ پی ام"],
  emeer: ["emeer", "امیر لطافه"],
};

const NAME_INDEX = perfumes
  .flatMap((perfume) =>
    [perfume.nameFa, perfume.nameEn, ...(NAME_ALIASES[perfume.slug] ?? [])].map((alias) => ({
      alias: alias.toLowerCase().replace(/[ِ]/g, ""),
      perfume,
    })),
  )
  .sort((a, b) => b.alias.length - a.alias.length);

export function findPerfumeByName(text: string) {
  const haystack = ` ${text.toLowerCase().replace(/[ِ]/g, "")} `;
  const hit = NAME_INDEX.find(({ alias }) => {
    const at = haystack.indexOf(alias);
    if (at < 0) return false;
    return !isLetter(haystack[at - 1]) && !isLetter(haystack[at + alias.length]);
  });
  return hit?.perfume ?? null;
}

function isLetter(char: string | undefined) {
  return Boolean(char && /[\p{L}]/u.test(char));
}

export function getPerfume(slug: string) {
  return perfumeBySlug[slug];
}

export function getBrand(slug: string) {
  return brands.find((brand) => brand.slug === slug);
}

export function brandByName(nameFa: string) {
  return brands.find((brand) => brand.nameFa === nameFa);
}

export function perfumesByBrand(nameFa: string) {
  return perfumes
    .filter((perfume) => perfume.brand === nameFa)
    .sort((a, b) => b.confidence - a.confidence || a.nameFa.localeCompare(b.nameFa, "fa"));
}

const SWEET_TOP = new Set(["وانیل", "خرما", "پرالین", "قهوه", "کارامل"]);
const SWEET_BODY = new Set(["وانیل", "خرما", "پرالین", "کارامل"]);

export function isSweet(perfume: Perfume) {
  return SWEET_TOP.has(perfume.accords[0]?.name ?? "");
}

export function sweetness(perfume: Perfume) {
  return perfume.accords.reduce((sum, accord) => {
    return SWEET_BODY.has(accord.name) ? sum + accord.strength : sum;
  }, 0);
}

export function leadOffer(perfume: Perfume) {
  const confirmed = perfume.shops.filter((shop) => shop.stockConfirmed);
  const pool = confirmed.length > 0 ? confirmed : perfume.shops;
  return pool.reduce((best, shop) => (shop.price < best.price ? shop : best));
}

export function cheaperUnconfirmed(perfume: Perfume) {
  const lead = leadOffer(perfume);
  if (!lead.stockConfirmed) return null;
  return (
    perfume.shops
      .filter((shop) => !shop.stockConfirmed && shop.price < lead.price)
      .sort((a, b) => a.price - b.price)[0] ?? null
  );
}

export function sharedAccordNames(left: Perfume, right: Perfume) {
  const names = new Set(right.accords.map((accord) => accord.name));
  return left.accords.filter((accord) => names.has(accord.name)).map((accord) => accord.name);
}

export function decisionFacts(left: Perfume, right: Perfume) {
  const facts: Array<{ name: string; fact: string }> = [];
  if (left.longevity != null && right.longevity != null && left.longevity !== right.longevity) {
    const winner = left.longevity > right.longevity ? left : right;
    facts.push({ name: winner.nameFa, fact: "ماندگاری بیشتر" });
  }
  const leftPrice = leadOffer(left).price;
  const rightPrice = leadOffer(right).price;
  if (leftPrice !== rightPrice) {
    const cheaper = leftPrice < rightPrice ? left : right;
    facts.push({ name: cheaper.nameFa, fact: "قیمت تأییدشده پایین‌تر" });
  }
  if (left.sillage != null && right.sillage != null && left.sillage !== right.sillage) {
    const winner = left.sillage > right.sillage ? left : right;
    facts.push({ name: winner.nameFa, fact: "پخش بوی بیشتر" });
  }
  const grouped = new Map<string, string[]>();
  for (const item of facts) {
    grouped.set(item.name, [...(grouped.get(item.name) ?? []), item.fact]);
  }
  return [...grouped].map(([name, items]) => ({ name, fact: items.join("، ") }));
}

export function performanceLabel(kind: "longevity" | "sillage", value: number) {
  const scale =
    kind === "longevity"
      ? ["", "کوتاه", "کوتاه", "متوسط", "ماندگار", "خیلی ماندگار"]
      : ["", "چسبیده به پوست", "کم", "متوسط", "زیاد", "خیلی زیاد"];
  return scale[value] ?? "";
}

export function referenceLabel(id: string | null) {
  return REFERENCES.find((item) => item.id === id)?.label ?? null;
}

export function occasionLabel(id: string) {
  return OCCASIONS.find((item) => item.id === id)?.label ?? id;
}

export function seasonShort(id: string) {
  return SEASONS.find((item) => item.id === id)?.short ?? id;
}
