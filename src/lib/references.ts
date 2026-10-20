import { publishedPerfumes } from "@/lib/catalog";
import { inspirationIds } from "@/lib/inspiration";
import { remindsOfFor, THIN_REFERENCE_LINE, thinReferenceRows } from "@/lib/reminds-of";
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
  /** صفحهٔ کوتاه بدون هرم/آکورد کامل؛ بعداً تکمیل می‌شود. */
  thin?: boolean;
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
  {
    id: "bleu",
    nameFa: "بلو د شنل",
    nameEn: "Bleu de Chanel",
    line: "چوبی و تازه، با کمی دود.",
    why: "مرکبات و نعنا اول می‌آیند و چوب و بخور تهش می‌ماند. برای هر روز و هوای معتدل ساخته شده.",
    accords: [
      { name: "چوب", color: "#6E5436", strength: 0.34 },
      { name: "مرکبات", color: "#C6B15A", strength: 0.28 },
      { name: "آروماتیک", color: "#7FA58A", strength: 0.22 },
      { name: "بخور", color: "#8E7348", strength: 0.16 },
    ],
    notes: [
      { layer: "top", name: "گریپ‌فروت" },
      { layer: "top", name: "نعنا" },
      { layer: "middle", name: "زنجبیل" },
      { layer: "base", name: "چوب صندل" },
      { layer: "base", name: "بخور" },
    ],
    seasons: ["mild", "summer"],
    occasions: ["daily", "office"],
    longevity: 4,
    sillage: 3,
    aliases: ["بلو د شنل", "بلو شنل", "bleu de chanel", "bleu", "bdc"],
  },
  {
    id: "ultra-male",
    nameFa: "اولترا میل",
    nameEn: "Ultra Male",
    line: "شیرین و میوه‌ای، برای شب.",
    why: "گلابی و وانیل غلیظ است. شب و هوای خنک جایش است؛ در گرمای ظهر سنگین می‌شود.",
    accords: [
      { name: "گلابی", color: "#C6B15A", strength: 0.34 },
      { name: "وانیل", color: "#C4A574", strength: 0.28 },
      { name: "ادویه", color: "#8E3D32", strength: 0.22 },
      { name: "عنبر", color: "#C47B4A", strength: 0.16 },
    ],
    notes: [
      { layer: "top", name: "گلابی" },
      { layer: "top", name: "اسطوخودوس" },
      { layer: "middle", name: "دارچین" },
      { layer: "base", name: "وانیل" },
      { layer: "base", name: "عنبر" },
    ],
    seasons: ["winter", "mild"],
    occasions: ["night", "date"],
    longevity: 5,
    sillage: 4,
    aliases: ["اولترا میل", "الترا میل", "ultra male", "ultramale"],
  },
  {
    id: "ysl-y",
    nameFa: "وای",
    nameEn: "Y",
    line: "تازه و سیبی، با پایهٔ چوبی.",
    why: "سیب و مریم‌گلی زود حس می‌شوند. برای روز و محل کار مناسب است.",
    accords: [
      { name: "آروماتیک", color: "#7FA58A", strength: 0.34 },
      { name: "سیب", color: "#C6B15A", strength: 0.28 },
      { name: "چوب", color: "#6E5436", strength: 0.22 },
      { name: "عنبر", color: "#C47B4A", strength: 0.16 },
    ],
    notes: [
      { layer: "top", name: "سیب" },
      { layer: "top", name: "ترنج" },
      { layer: "middle", name: "مریم‌گلی" },
      { layer: "base", name: "چوب" },
      { layer: "base", name: "عنبر" },
    ],
    seasons: ["mild", "summer"],
    occasions: ["daily", "office"],
    longevity: 4,
    sillage: 3,
    aliases: ["وای", "ایگرک", "ysl y", "yves saint laurent y", "وای ایسل"],
  },
  {
    id: "invictus",
    nameFa: "اینویکتوس",
    nameEn: "Invictus",
    line: "شیرین و دریایی، با گریپ‌فروت.",
    why: "تازه شروع می‌شود و تهش شیرین می‌ماند. برای گرما و فضای باز مناسب است.",
    accords: [
      { name: "دریایی", color: "#7FA0B0", strength: 0.32 },
      { name: "مرکبات", color: "#C6B15A", strength: 0.28 },
      { name: "شیرین", color: "#C4A574", strength: 0.24 },
      { name: "چوب", color: "#6E5436", strength: 0.16 },
    ],
    notes: [
      { layer: "top", name: "گریپ‌فروت" },
      { layer: "middle", name: "برگ بو" },
      { layer: "base", name: "عنبر" },
      { layer: "base", name: "چوب" },
    ],
    seasons: ["summer", "mild"],
    occasions: ["daily", "sport"],
    longevity: 4,
    sillage: 4,
    aliases: ["اینویکتوس", "invictus", "اینوکتوس"],
  },
  {
    id: "althair",
    nameFa: "الثیر",
    nameEn: "Althair",
    line: "وانیل خامه‌ای، با پرالین.",
    why: "شیرین و نرم است. شب سرد جایش است؛ در گرما زود خسته می‌کند.",
    accords: [
      { name: "وانیل", color: "#C4A574", strength: 0.4 },
      { name: "پرالین", color: "#B5816A", strength: 0.28 },
      { name: "چوب", color: "#6E5436", strength: 0.2 },
      { name: "پرتقال", color: "#C6B15A", strength: 0.12 },
    ],
    notes: [
      { layer: "top", name: "پرتقال" },
      { layer: "middle", name: "وانیل" },
      { layer: "middle", name: "پرالین" },
      { layer: "base", name: "مشک" },
    ],
    seasons: ["winter"],
    occasions: ["night", "date"],
    longevity: 5,
    sillage: 4,
    aliases: ["الثیر", "التایر", "althair", "pdm althair"],
  },
  {
    id: "bianco-latte",
    nameFa: "بیانکو لاته",
    nameEn: "Bianco Latte",
    line: "شیر و وانیل، خیلی شیرین.",
    why: "بوی شیر و کارامل است. برای هوای سرد و کسانی که شیرینی غلیظ می‌خواهند.",
    accords: [
      { name: "وانیل", color: "#C4A574", strength: 0.4 },
      { name: "شیر", color: "#E4D5C4", strength: 0.32 },
      { name: "کارامل", color: "#A65D3F", strength: 0.18 },
      { name: "مشک", color: "#B7A99A", strength: 0.1 },
    ],
    notes: [
      { layer: "top", name: "کارامل" },
      { layer: "middle", name: "شیر" },
      { layer: "middle", name: "وانیل" },
      { layer: "base", name: "مشک" },
    ],
    seasons: ["winter"],
    occasions: ["daily", "date"],
    longevity: 5,
    sillage: 4,
    aliases: ["بیانکو لاته", "بیانکو لته", "bianco latte"],
  },
  {
    id: "irish-tweed",
    nameFa: "گرین آیریش توید",
    nameEn: "Green Irish Tweed",
    line: "سبز و آروماتیک، مثل چمن خیس.",
    why: "بنفشه و برگ تازه اول می‌آید. برای روز و هوای معتدل مناسب است.",
    accords: [
      { name: "سبز", color: "#7FA58A", strength: 0.36 },
      { name: "آروماتیک", color: "#8E9A78", strength: 0.28 },
      { name: "بنفشه", color: "#8E6A8A", strength: 0.2 },
      { name: "چوب", color: "#6E5436", strength: 0.16 },
    ],
    notes: [
      { layer: "top", name: "لیمو" },
      { layer: "middle", name: "بنفشه" },
      { layer: "middle", name: "زنبق" },
      { layer: "base", name: "چوب صندل" },
    ],
    seasons: ["mild", "summer"],
    occasions: ["daily", "office"],
    longevity: 4,
    sillage: 3,
    aliases: ["گرین آیریش توید", "آیریش توید", "green irish tweed", "git"],
  },
  {
    id: "silver-mountain",
    nameFa: "سیلور مانتین واتر",
    nameEn: "Silver Mountain Water",
    line: "تازه و فلزی، با چای.",
    why: "چای و مرکبات سبک است. برای گرما و روز ساخته شده.",
    accords: [
      { name: "مرکبات", color: "#C6B15A", strength: 0.32 },
      { name: "چای", color: "#8E9A78", strength: 0.28 },
      { name: "مشک", color: "#B7A99A", strength: 0.22 },
      { name: "چوب", color: "#6E5436", strength: 0.18 },
    ],
    notes: [
      { layer: "top", name: "ترنج" },
      { layer: "middle", name: "چای" },
      { layer: "base", name: "مشک" },
      { layer: "base", name: "چوب صندل" },
    ],
    seasons: ["summer", "mild"],
    occasions: ["daily", "office"],
    longevity: 3,
    sillage: 3,
    aliases: ["سیلور مانتین واتر", "سیلور مانتین", "silver mountain water", "smw"],
  },
  {
    id: "millesime",
    nameFa: "میلسیم امپریال",
    nameEn: "Millésime Impérial",
    line: "دریایی و شور، با میوه.",
    why: "هندوانه و نمک دریا حس می‌شود. مخصوص گرما و فضای باز است.",
    accords: [
      { name: "دریایی", color: "#7FA0B0", strength: 0.36 },
      { name: "میوه", color: "#D2B15C", strength: 0.28 },
      { name: "مشک", color: "#B7A99A", strength: 0.2 },
      { name: "چوب", color: "#6E5436", strength: 0.16 },
    ],
    notes: [
      { layer: "top", name: "ترنج" },
      { layer: "middle", name: "هندوانه" },
      { layer: "base", name: "مشک" },
      { layer: "base", name: "چوب" },
    ],
    seasons: ["summer"],
    occasions: ["daily", "sport"],
    longevity: 3,
    sillage: 3,
    aliases: ["میلسیم امپریال", "میلسیم", "millesime imperial", "millesime"],
  },
  {
    id: "baccarat",
    nameFa: "باکارات رژ",
    nameEn: "Baccarat Rouge 540",
    line: "شیرین و هوایی، با زعفران.",
    why: "زعفران و شکر سوخته تهش می‌ماند. شب و هوای خنک جایش است.",
    accords: [
      { name: "زعفران", color: "#A65D3F", strength: 0.32 },
      { name: "شیرین", color: "#C4A574", strength: 0.28 },
      { name: "عنبر", color: "#C47B4A", strength: 0.22 },
      { name: "چوبی", color: "#6E5436", strength: 0.18 },
    ],
    notes: [
      { layer: "top", name: "زعفران" },
      { layer: "middle", name: "یاس" },
      { layer: "base", name: "عنبر" },
      { layer: "base", name: "چوب" },
    ],
    seasons: ["winter", "mild"],
    occasions: ["night", "date"],
    longevity: 5,
    sillage: 5,
    aliases: ["باکارات", "باکارات رژ", "baccarat", "br540", "baccarat rouge"],
  },
  {
    id: "fireplace",
    nameFa: "بای د فایرپلیس",
    nameEn: "By the Fireplace",
    line: "دود چوب و شاه‌بلوط.",
    why: "بوی بخاری و شیرینی ملایم است. برای شب سرد ساخته شده.",
    accords: [
      { name: "دودی", color: "#5C6164", strength: 0.34 },
      { name: "وانیل", color: "#C4A574", strength: 0.28 },
      { name: "چوب", color: "#6E5436", strength: 0.22 },
      { name: "شاه‌بلوط", color: "#8C4A32", strength: 0.16 },
    ],
    notes: [
      { layer: "top", name: "فلفل صورتی" },
      { layer: "middle", name: "شاه‌بلوط" },
      { layer: "base", name: "وانیل" },
      { layer: "base", name: "چوب" },
    ],
    seasons: ["winter"],
    occasions: ["night", "daily"],
    longevity: 4,
    sillage: 4,
    aliases: ["بای د فایرپلیس", "فایرپلیس", "by the fireplace", "fireplace"],
  },
  {
    id: "oud-greatness",
    nameFa: "عود فور گریتنس",
    nameEn: "Oud for Greatness",
    line: "عود و زعفران، تند و رسمی.",
    why: "زعفران و اسطوخودوس روی عود می‌نشیند. برای شب و هوای خنک مناسب است.",
    accords: [
      { name: "عود", color: "#5C4030", strength: 0.36 },
      { name: "زعفران", color: "#A65D3F", strength: 0.28 },
      { name: "اسطوخودوس", color: "#7A6A90", strength: 0.2 },
      { name: "چوب", color: "#6E5436", strength: 0.16 },
    ],
    notes: [
      { layer: "top", name: "زعفران" },
      { layer: "top", name: "اسطوخودوس" },
      { layer: "middle", name: "عود" },
      { layer: "base", name: "چوب" },
      { layer: "base", name: "مشک" },
    ],
    seasons: ["winter", "mild"],
    occasions: ["night", "date"],
    longevity: 5,
    sillage: 5,
    aliases: ["عود فور گریتنس", "oud for greatness", "ofg"],
  },
  {
    id: "le-beau",
    nameFa: "له بو",
    nameEn: "Le Beau",
    line: "نارگیل و تونکا، شیرینِ تابستانی.",
    why: "نارگیل و آناناس تازه است و تهش شیرین می‌ماند. برای گرما و قرار مناسب است.",
    accords: [
      { name: "نارگیل", color: "#E4D5C4", strength: 0.34 },
      { name: "میوه", color: "#D2B15C", strength: 0.28 },
      { name: "تونکا", color: "#C4A574", strength: 0.22 },
      { name: "چوب", color: "#6E5436", strength: 0.16 },
    ],
    notes: [
      { layer: "top", name: "آناناس" },
      { layer: "top", name: "نارگیل" },
      { layer: "middle", name: "تونکا" },
      { layer: "base", name: "چوب صندل" },
    ],
    seasons: ["summer", "mild"],
    occasions: ["date", "daily"],
    longevity: 4,
    sillage: 4,
    aliases: ["له بو", "لِ بو", "le beau", "le beau le parfum"],
  },
  {
    id: "erba-pura",
    nameFa: "اربا پورا",
    nameEn: "Erba Pura",
    line: "آناناس و مشک، شیرین و تمیز.",
    why: "میوهٔ شیرین با مشک سفید. برای روز و هوای معتدل تا گرم مناسب است.",
    accords: [
      { name: "میوه", color: "#D2B15C", strength: 0.36 },
      { name: "مشک", color: "#B7A99A", strength: 0.28 },
      { name: "مرکبات", color: "#C6B15A", strength: 0.2 },
      { name: "وانیل", color: "#C4A574", strength: 0.16 },
    ],
    notes: [
      { layer: "top", name: "آناناس" },
      { layer: "top", name: "پرتقال" },
      { layer: "middle", name: "میوه" },
      { layer: "base", name: "مشک" },
      { layer: "base", name: "وانیل" },
    ],
    seasons: ["summer", "mild"],
    occasions: ["daily", "date"],
    longevity: 5,
    sillage: 5,
    aliases: ["اربا پورا", "erba pura", "اربا"],
  },
  {
    id: "goddess",
    nameFa: "گادس",
    nameEn: "Goddess",
    line: "وانیل و اسطوخودوس.",
    why: "وانیل نرم با اسطوخودوس. برای روز و هوای معتدل مناسب است.",
    accords: [
      { name: "وانیل", color: "#C4A574", strength: 0.36 },
      { name: "اسطوخودوس", color: "#7A6A90", strength: 0.28 },
      { name: "کاکائو", color: "#6B4636", strength: 0.2 },
      { name: "مشک", color: "#B7A99A", strength: 0.16 },
    ],
    notes: [
      { layer: "top", name: "اسطوخودوس" },
      { layer: "middle", name: "کاکائو" },
      { layer: "base", name: "وانیل" },
    ],
    seasons: ["mild", "winter"],
    occasions: ["daily", "office"],
    longevity: 4,
    sillage: 3,
    aliases: ["گادس", "گادِس", "goddess", "burberry goddess"],
  },
  {
    id: "paragon",
    nameFa: "پاراگون",
    nameEn: "Paragon",
    line: "آلو و چوب، کمی دودی.",
    why: "آلو و اسطوخودوس روی چوب می‌نشیند. برای هوای معتدل و شب ملایم مناسب است.",
    accords: [
      { name: "میوه", color: "#8C4A32", strength: 0.32 },
      { name: "چوب", color: "#6E5436", strength: 0.28 },
      { name: "اسطوخودوس", color: "#7A6A90", strength: 0.22 },
      { name: "دودی", color: "#5C6164", strength: 0.18 },
    ],
    notes: [
      { layer: "top", name: "آلو" },
      { layer: "middle", name: "اسطوخودوس" },
      { layer: "base", name: "چوب صندل" },
      { layer: "base", name: "چوب" },
    ],
    seasons: ["mild", "winter"],
    occasions: ["daily", "date"],
    longevity: 4,
    sillage: 3,
    aliases: ["پاراگون", "paragon", "initio paragon"],
  },
  {
    id: "ani",
    nameFa: "آنی",
    nameEn: "Ani",
    line: "وانیل و زنجبیل و هل.",
    why: "ادویهٔ تازه با وانیل. شب و هوای خنک جایش است.",
    accords: [
      { name: "وانیل", color: "#C4A574", strength: 0.34 },
      { name: "ادویه", color: "#8E3D32", strength: 0.28 },
      { name: "هل", color: "#A08B62", strength: 0.22 },
      { name: "چوب", color: "#6E5436", strength: 0.16 },
    ],
    notes: [
      { layer: "top", name: "زنجبیل" },
      { layer: "top", name: "هل" },
      { layer: "middle", name: "وانیل" },
      { layer: "base", name: "چوب صندل" },
    ],
    seasons: ["winter", "mild"],
    occasions: ["night", "date"],
    longevity: 5,
    sillage: 4,
    aliases: ["آنی", "انی", "nishane ani", "ani"],
  },
  {
    id: "profondo",
    nameFa: "پروفوندو",
    nameEn: "Acqua di Gio Profondo",
    line: "دریایی و آروماتیک، عمیق‌تر از آکوا دی جیو.",
    why: "رزماری و معدنیِ دریا حس می‌شود. برای گرما و هر روز مناسب است.",
    accords: [
      { name: "دریایی", color: "#7FA0B0", strength: 0.34 },
      { name: "آروماتیک", color: "#7FA58A", strength: 0.28 },
      { name: "مرکبات", color: "#C6B15A", strength: 0.22 },
      { name: "مشک", color: "#B7A99A", strength: 0.16 },
    ],
    notes: [
      { layer: "top", name: "ترنج" },
      { layer: "middle", name: "رزماری" },
      { layer: "base", name: "مشک" },
      { layer: "base", name: "چوب" },
    ],
    seasons: ["summer", "mild"],
    occasions: ["daily", "office"],
    longevity: 4,
    sillage: 3,
    aliases: ["پروفوندو", "آکوا دی جیو پروفوندو", "profondo", "acqua di gio profondo"],
  },
  {
    id: "layton",
    nameFa: "لیتون",
    nameEn: "Layton",
    line: "سیب و وانیل، با ادویه.",
    why: "سیب و نعنا اول می‌آید و وانیل تهش می‌ماند. برای شب و هوای خنک مناسب است.",
    accords: [
      { name: "وانیل", color: "#C4A574", strength: 0.32 },
      { name: "سیب", color: "#C6B15A", strength: 0.28 },
      { name: "ادویه", color: "#8E3D32", strength: 0.22 },
      { name: "چوب", color: "#6E5436", strength: 0.18 },
    ],
    notes: [
      { layer: "top", name: "سیب" },
      { layer: "top", name: "نعنا" },
      { layer: "middle", name: "اسطوخودوس" },
      { layer: "base", name: "وانیل" },
      { layer: "base", name: "چوب صندل" },
    ],
    seasons: ["winter", "mild"],
    occasions: ["night", "date"],
    longevity: 5,
    sillage: 4,
    aliases: ["لیتون", "layton", "pdm layton"],
  },
  {
    id: "lost-cherry",
    nameFa: "لاست چری",
    nameEn: "Lost Cherry",
    line: "گیلاس و بادام تلخ.",
    why: "گیلاس شیرین با بادام. شب و هوای خنک جایش است.",
    accords: [
      { name: "گیلاس", color: "#8E3D32", strength: 0.38 },
      { name: "بادام", color: "#C4A574", strength: 0.28 },
      { name: "گل", color: "#C48A9A", strength: 0.18 },
      { name: "چوب", color: "#6E5436", strength: 0.16 },
    ],
    notes: [
      { layer: "top", name: "گیلاس" },
      { layer: "middle", name: "بادام" },
      { layer: "middle", name: "گل سرخ" },
      { layer: "base", name: "تونکا" },
    ],
    seasons: ["winter", "mild"],
    occasions: ["night", "date"],
    longevity: 4,
    sillage: 3,
    aliases: ["لاست چری", "lost cherry", "لاست‌چری"],
  },
];

const THIN_REFERENCES: ReferenceProfile[] = thinReferenceRows().map((row) => ({
  id: row.id,
  nameFa: row.nameFa,
  nameEn: row.nameEn,
  line: THIN_REFERENCE_LINE,
  why: "",
  accords: [],
  notes: [],
  seasons: [],
  occasions: [],
  longevity: 0,
  sillage: 0,
  aliases: [row.nameFa, row.nameEn, row.id],
  thin: true,
}));

const ALL_REFERENCES: ReferenceProfile[] = [...REFERENCES, ...THIN_REFERENCES];
const byId = Object.fromEntries(ALL_REFERENCES.map((item) => [item.id, item]));

export function getReference(id: string) {
  return byId[id];
}

export function referenceList() {
  return ALL_REFERENCES;
}

export function referenceBottles(id: string) {
  return publishedPerfumes().filter((perfume) => {
    if (inspirationIds(perfume.inspiredBy).includes(id)) return true;
    const links = perfume.remindsOf?.length ? perfume.remindsOf : remindsOfFor(perfume.slug);
    return links.some((link) => link.id === id);
  });
}

/** مرجع‌های بخش «یاد این عطر می‌افتد»: inspiredBy سپس remindsOf. */
export function echoesFor(perfume: { slug: string; inspiredBy?: string | string[] | null; remindsOf?: { id: string }[] | null }) {
  const seen = new Set<string>();
  const out: ReferenceProfile[] = [];
  for (const id of inspirationIds(perfume.inspiredBy)) {
    const ref = byId[id];
    if (!ref || seen.has(ref.id)) continue;
    seen.add(ref.id);
    out.push(ref);
  }
  const links = perfume.remindsOf?.length ? perfume.remindsOf : remindsOfFor(perfume.slug);
  for (const link of links) {
    const ref = byId[link.id];
    if (!ref || seen.has(ref.id)) continue;
    seen.add(ref.id);
    out.push(ref);
  }
  return out;
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
