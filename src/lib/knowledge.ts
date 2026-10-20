import { publishedPerfumes } from "@/lib/catalog";
import type { Perfume } from "@/lib/types";

export type KnowledgeGroup = "basics" | "wear" | "buy";
export type ArticleDisplay = "card" | "row";

export type KnowledgeEntry = {
  slug: string;
  title: string;
  support: string;
  /** چیپ کوتاه دستیار؛ باید با aliases جور شود. */
  ask: string;
  aliases: string[];
  group: KnowledgeGroup;
  minutes: number;
  featured?: boolean;
  summary: string;
  body: string[];
  myth?: { claim: string; reality: string };
  compare?: Array<{ label: string; range: string }>;
  related: string[];
  noteNames?: string[];
  accordNames?: string[];
  concentrationLabels?: string[];
  mark?: string;
  active: boolean;
  sort: number;
  display: ArticleDisplay;
  publishedOn: string;
};

export const KNOWLEDGE_GROUPS: Array<{ id: KnowledgeGroup; label: string; support: string }> = [
  { id: "basics", label: "مبانی", support: "غلظت، هرم، مواد" },
  { id: "wear", label: "استفاده", support: "اسپری، تست، نگهداری" },
  { id: "buy", label: "خرید", support: "بچ‌کد، تستر، دوپ" },
];

type KnowledgeSource = Omit<KnowledgeEntry, "active" | "sort" | "display" | "publishedOn">;

const PUBLISHED_ON: Record<string, string> = {
  "edp-vs-edt": "2025-11-02",
  "notes-accords": "2025-11-20",
  "longevity-sillage": "2025-12-08",
  "how-to-spray": "2025-12-26",
  "skin-test": "2026-01-14",
  storage: "2026-02-02",
  "batch-code": "2026-02-20",
  "testers-decants-dupes": "2026-03-10",
  vetiver: "2026-03-28",
  musk: "2026-04-16",
  amber: "2026-05-04",
  "natural-vs-synthetic": "2026-05-22",
};

const knowledge: KnowledgeSource[] = [
  {
    slug: "edp-vs-edt",
    title: "فرق ادوتویلت و ادوپرفیوم چیست؟",
    support: "EDT · EDP · اکستریت",
    ask: "فرق EDP و EDT چیه؟",
    aliases: [
      "edp",
      "edt",
      "extrait",
      "ادوپرفیوم",
      "ادو پرفیوم",
      "ادوتویلت",
      "ادو تویلت",
      "اکستریت",
      "غلظت",
      "eau de parfum",
      "eau de toilette",
    ],
    group: "basics",
    minutes: 3,
    featured: true,
    concentrationLabels: ["ادوپرفیوم", "ادوتویلت", "اکستریت"],
    summary:
      "ادوپرفیوم معمولاً غلیظ‌تر از ادوتویلت است، اما لزوماً ماندگارتر یا پخش‌دارتر نیست. این برچسب‌ها غلظت‌اند، نه نردبان کیفیت.",
    body: [
      "روی شیشه معمولاً یکی از این‌ها نوشته می‌شود: ادکلن، ادوتویلت، ادوپرفیوم، اکستریت. معنایش درصد روغن معطر در الکل و آب است، نه اینکه کدام «بهتر» است.",
      "دو ادوپرفیوم می‌توانند کاملاً متفاوت بمانند و پخش کنند. حتی نسخه‌های EDT و EDP یک اسم گاهی فرمول جدا دارند، نه فقط غلیظ‌تر همان بو.",
      "برای انتخاب، به موقعیت و پوستت نگاه کن؛ نه به این‌که حروف روی جعبه انگلیسی‌ترند.",
    ],
    compare: [
      { label: "ادوتویلت", range: "حدود ۵ تا ۱۵٪" },
      { label: "ادوپرفیوم", range: "حدود ۱۰ تا ۲۰٪" },
      { label: "اکستریت", range: "حدود ۱۵ تا ۴۰٪" },
    ],
    myth: {
      claim: "EDP همیشه از EDT ماندگارتر است.",
      reality: "غلظت یکی از عامل‌هاست. فرمول، پوست، هوا و تعداد اسپری معمولاً بیشتر اثر دارند.",
    },
    related: ["longevity-sillage", "testers-decants-dupes"],
  },
  {
    slug: "notes-accords",
    title: "نت، آکورد و هرم بو",
    support: "شروع، میانه، پایه",
    ask: "نت و آکورد یعنی چی؟",
    aliases: ["نت", "نوت", "آکورد", "هرم", "هرم بویایی", "note", "accord", "pyramid", "تاپ نوت"],
    group: "basics",
    minutes: 3,
    summary:
      "نت یک ماده یا رایحهٔ نام‌گذاری‌شده است. آکورد چند نت است که با هم یک حس می‌سازند. هرم می‌گوید بو از شروع تا پایه چطور عوض می‌شود.",
    body: [
      "شروع همان دقایق اول است؛ اغلب مرکبات و چیزهای سبک. میانه شخصیت اصلی را می‌سازد. پایه دیرتر می‌آید و روی پوست می‌ماند.",
      "اگر بوی شیشه با بوی پوست بعد از بیست دقیقه فرق دارد، معمولاً هرم کار خودش را می‌کند؛ تقلب نیست.",
      "نوار رنگ روی کارت‌های آروما آکورد است: نسبت حس‌ها، نه فهرست مواد تشکیل‌دهنده.",
    ],
    related: ["vetiver", "longevity-sillage"],
  },
  {
    slug: "longevity-sillage",
    title: "ماندگاری و پخش بو",
    support: "چقدر می‌ماند، تا کجا می‌رود",
    ask: "ماندگاری و پخش بو؟",
    aliases: ["ماندگاری", "پخش", "پخش بو", "سیاژ", "sillage", "longevity", "عملکرد"],
    group: "basics",
    minutes: 3,
    summary:
      "ماندگاری این است که بو روی پوستت تا کی حس می‌شود. پخش بو این است که اطرافیان از چه فاصله‌ای متوجه می‌شوند. هیچ‌کدام به‌تنهایی کیفیت نیستند.",
    body: [
      "در آروما این دو را فقط وقتی عدد داریم نشان می‌دهیم. اگر خالی است، حدس نمی‌زنیم.",
      "پوست خشک، گرما، و مالش بعد از اسپری می‌تواند هر دو را کوتاه کند. لباس معمولاً دیرتر بو را نگه می‌دارد، ولی رنگ و بافت پارچه فرق دارد.",
      "برای محل کار پخش زیاد امتیاز نیست. برای مهمانی شب، ماندگاری بدون suffocating اطرافیان معمولاً مفیدتر است.",
    ],
    myth: {
      claim: "هرچه پخش بیشتر، عطر باکیفیت‌تر.",
      reality: "پخش یک ویژگی عملکرد است. عطر آرام و نزدیک پوست می‌تواند دقیق و گران‌قیمت باشد.",
    },
    related: ["how-to-spray", "edp-vs-edt"],
  },
  {
    slug: "how-to-spray",
    title: "عطر را کجا و چند بار بزنیم؟",
    support: "فاصله، تعداد، مالش نده",
    ask: "عطر رو کجا بزنم؟",
    aliases: ["اسپری", "چطور بزنم", "کجا بزنم", "تعداد پاشش", "زدن عطر"],
    group: "wear",
    minutes: 3,
    featured: true,
    summary:
      "از فاصلهٔ حدود یک وجب روی پوست تمیز بزن. نمال. برای کار دو اسپری کافی است؛ برای شب می‌توانی یکی دو تا اضافه کنی.",
    body: [
      "نقاط رایج: دو طرف گردن و داخل مچ. اگر پخش زیاد می‌خواهی، یکی هم روی لباس تیرهٔ محکم — اول روی تکهٔ کوچک امتحان کن.",
      "مالیدن مچ‌ها مولکول‌های سبک را می‌شکند و شروع بو را کوتاه می‌کند.",
      "در گرما و فضای بسته کمتر بزن. عطری که در اتاق سرد ملایم است، در مترو می‌تواند زیاد باشد.",
    ],
    related: ["skin-test", "longevity-sillage"],
  },
  {
    slug: "skin-test",
    title: "عطر را چطور تست کنیم؟",
    support: "کاغذ کافی نیست",
    ask: "عطر رو چطور تست کنم؟",
    aliases: ["تست عطر", "تستر روی پوست", "بلاتر", "نمونه"],
    group: "wear",
    minutes: 3,
    summary:
      "کاغذ شروع را نشان می‌دهد، نه نشستن روی پوست تو. روی پوست بزن، بیست دقیقه صبر کن، و در یک روز بیش از دو سه تا قاطی نکن.",
    body: [
      "اگر چند تا را پشت سر هم روی یک دست بزنی، بینی قاطی می‌کند. بین تست‌ها قهوه یا هوای تازه بهتر از مالیدن بینی به قهوهٔ فروشگاه است — همان هم کمکی نسبی است.",
      "خرید سریع بر اساس بوی درِ شیشه معمولاً پشیمانی می‌آورد. هرم هنوز باز نشده.",
      "اگر پوستت حساس است، اول روی قسمت کوچکی از داخل آرنج تست کن و چند ساعت صبر کن.",
    ],
    related: ["how-to-spray", "storage"],
  },
  {
    slug: "storage",
    title: "عطر را چطور نگه داریم؟",
    support: "نور، گرما، حمام",
    ask: "عطر رو چطور نگه دارم؟",
    aliases: ["نگهداری", "خراب شدن عطر", "تاریخ عطر", "انبار"],
    group: "wear",
    minutes: 2,
    summary:
      "جای خنک، تاریک و خشک. حمام و پشت شیشهٔ ماشین شیشه را زود عوض می‌کنند. یخچال لازم نیست مگر گرمای شدید خانه.",
    body: [
      "درِ شیشه را ببند، از نور مستقیم و نوسان دما دورش کن. جعبه کمک می‌کند ولی معجزه نیست.",
      "تغییر رنگ یا بوی تند فلزی/سرکه می‌تواند نشانهٔ اکسید شدن باشد. این برای همهٔ عطرها و همهٔ سال‌ها یکسان نیست.",
      "این قاعده که «همهٔ عطرها باید چند ماه در خانه بمانند تا بهتر شوند» عمومی و ثابت‌شده نیست.",
    ],
    related: ["batch-code", "how-to-spray"],
  },
  {
    slug: "batch-code",
    title: "بچ‌کد چه چیزی را ثابت می‌کند؟",
    support: "کد تولید، نه مدرک اصل بودن",
    ask: "بچ‌کد یعنی چی؟",
    aliases: ["بچ کد", "بچ‌کد", "بچکد", "batch code", "batchcode", "کد تولید"],
    group: "buy",
    minutes: 4,
    featured: true,
    summary:
      "بچ‌کد معمولاً کد تولید و تاریخ ساخت است. به‌تنهایی اصل بودن را ثابت نمی‌کند و نمرهٔ کیفیت هم نیست.",
    body: [
      "از روی کد می‌توان حدس زد شیشه کی پر شده. تفاوت بچ واقعی است: مواد، انبار، و زمان می‌توانند بو را کمی جابه‌جا کنند.",
      "شکار «بهترین بچ» اغلب بزرگ‌تر از خودِ تفاوت بو شده. برای بیشتر خریدها، فروشندهٔ قابل‌پیگیری و قیمت منطقی مهم‌تر است.",
      "جعل‌کننده هم می‌تواند کد روی جعبه بزند. بچ‌کد را با فاکتور، پلمب، و سابقهٔ فروشنده بسنج؛ نه به‌جای آن‌ها.",
    ],
    myth: {
      claim: "بچ‌کد معتبر یعنی عطر اصل است.",
      reality: "کد یک نشانه است، مدرک نیست. بدون مسیر خرید روشن، کد به‌تنهایی کافی نیست.",
    },
    related: ["testers-decants-dupes", "storage"],
  },
  {
    slug: "testers-decants-dupes",
    title: "تستر، دکانت و دوپ",
    support: "قبل از شیشهٔ کامل",
    ask: "تستر و دوپ چیه؟",
    aliases: ["تستر", "دکانت", "دوپ", "کپی", "شرکتی", "dupe", "decant", "tester"],
    group: "buy",
    minutes: 4,
    summary:
      "تستر همان عطر با بسته‌بندی ساده‌تر است. دکانت مقدار کم برای امتحان است. دوپ عطر الهام‌گرفته است، نه همان محصول برند اصلی.",
    body: [
      "تستر اگر از مسیر معتبر بیاید معمولاً همان مایع است؛ جعبه و درپوش ممکن است فرق داشته باشد. «بدون جعبه» به‌تنهایی تقلبی نیست و به‌تنهایی اصل هم نیست.",
      "دکانت برای این است که قبل از خرید ۱۰۰ میل، روی پوست خودت زندگی کنی. از کسی بخر که شیشهٔ مادر را نشان می‌دهد.",
      "در آروما اگر عطری «نزدیک به» یک مرجع آمده، شباهت بر اساس نوت‌های ثبت‌شده است، نه ادعای اینکه همان عطر است.",
    ],
    related: ["batch-code", "edp-vs-edt"],
  },
  {
    slug: "vetiver",
    title: "وتیور",
    support: "Vetiver",
    ask: "وتیور چه بویی دارد؟",
    aliases: ["وتیور", "vetiver", "vetivert"],
    group: "basics",
    minutes: 2,
    noteNames: ["وتیور"],
    accordNames: ["وتیور"],
    mark: "#6E5436",
    summary: "بوی خاک تمیز، ریشهٔ خشک و کمی دودی است. شیرین نیست و معمولاً خودش را در پایه نشان می‌دهد.",
    body: [
      "وتیور از ریشهٔ یک گیاه علفی می‌آید. در عطرهای تازه و چوبی زیاد است؛ حس زمین بعد از باران، نه گل.",
      "اگر عطری زود از روی پوستت می‌رود، بودن وتیور در پایه یکی از نشانه‌هایی است که بو دیرتر می‌نشیند. این قاعده همیشگی نیست.",
    ],
    related: ["notes-accords", "musk"],
  },
  {
    slug: "musk",
    title: "مشک",
    support: "Musk",
    ask: "مشک چه بویی دارد؟",
    aliases: ["مشک", "musk", "ماسک"],
    group: "basics",
    minutes: 2,
    noteNames: ["مشک"],
    accordNames: ["مشک"],
    mark: "#B7A99A",
    summary: "مشک امروز تقریباً همیشه ساختگیِ تمیز است: پودری، پوستی، و نرم. بو را به پوست می‌چسباند.",
    body: [
      "مشک حیوانی تاریخی دیگر در عطرسازی رایج مصرف نمی‌شود. آنچه روی برچسب می‌بینی معمولاً مولکول‌های سفید و نرم است.",
      "گاهی «تمیز» حس می‌شود، گاهی کمی شیرین و لباس‌شویی. بستگی به این دارد کنار چه نت‌هایی آمده.",
    ],
    related: ["notes-accords", "amber"],
  },
  {
    slug: "amber",
    title: "عنبر",
    support: "Amber",
    ask: "عنبر چه بویی دارد؟",
    aliases: ["عنبر", "amber", "امبر"],
    group: "basics",
    minutes: 2,
    noteNames: ["عنبر"],
    accordNames: ["عنبر"],
    mark: "#C47B4A",
    summary: "عنبر در عطر معمولاً یک آکورد گرم است: رزین، شیرینی ملایم، گاهی وانیل. سنگ کهربا نیست.",
    body: [
      "آکورد عنبر را عطار می‌سازد؛ یک مادهٔ واحد با بوی ثابت نیست. برای همین دو عطر عنبری می‌توانند خیلی فرق داشته باشند.",
      "در زمستان و شب زیاد دیده می‌شود، چون گرما و ماندگاری می‌دهد. در گرما ممکن است سنگین شود.",
    ],
    related: ["notes-accords", "musk"],
  },
  {
    slug: "natural-vs-synthetic",
    title: "طبیعی و سنتتیک",
    support: "مواد اولیه",
    ask: "طبیعی بهتره یا سنتتیک؟",
    aliases: ["طبیعی", "سنتتیک", "مصنوعی", "مواد اولیه", "synthetic", "natural"],
    group: "basics",
    minutes: 3,
    summary:
      "طبیعی بودن به‌تنهایی سالم‌تر یا باکیفیت‌تر نیست. خیلی از رایحه‌های تمیز و پایدار فقط با مواد ساختگی ممکن‌اند.",
    body: [
      "اسانس طبیعی دستهٔ پیچیده‌ای از مولکول‌هاست. سنتتیک می‌تواند یک مولکول مشخص باشد. هیچ‌کدام به‌خودی‌خود «خالص‌تر» نیستند.",
      "حساسیت به مواد معطر به منبع طبیعی یا ساختگی گره نخورده. اگر پوستت واکنش می‌دهد، منبع را حدس نزن؛ مصرف را کم کن و در صورت نیاز با پزشک حرف بزن.",
      "آروما روی برچسب ایمنی یا اصالت مواد ادعایی نمی‌کند. انتخاب بو را از برچسب «۱۰۰٪ طبیعی» جدا نگه دار.",
    ],
    myth: {
      claim: "عطر طبیعی همیشه سالم‌تر است.",
      reality: "خیلی از آلرژن‌های معروف از گیاهان می‌آیند. ایمنی به دوز، ترکیب و پوست تو بستگی دارد.",
    },
    related: ["musk", "amber"],
  },
];

function normalize(entry: KnowledgeSource, index: number): KnowledgeEntry {
  return {
    ...entry,
    active: true,
    sort: index,
    display: entry.featured ? "card" : "row",
    publishedOn: PUBLISHED_ON[entry.slug] ?? "2026-01-01",
  };
}

export function seedArticles(): KnowledgeEntry[] {
  return knowledge.map((entry, index) => normalize(entry, index));
}

let live = seedArticles();
let bySlug = Object.fromEntries(live.map((entry) => [entry.slug, entry]));

export function installKnowledge(entries: KnowledgeEntry[]) {
  live = [...entries].sort(byEditorial);
  bySlug = Object.fromEntries(live.map((entry) => [entry.slug, entry]));
}

export function allEntries() {
  return live;
}

export function publishedEntries() {
  return live.filter((entry) => entry.active);
}

function byEditorial(a: KnowledgeEntry, b: KnowledgeEntry) {
  return a.sort - b.sort || a.title.localeCompare(b.title, "fa");
}

export function getEntry(slug: string) {
  const entry = bySlug[slug];
  if (!entry?.active) return undefined;
  return entry;
}

export function featuredEntries() {
  return publishedEntries()
    .filter((entry) => entry.display === "card")
    .sort(byEditorial);
}

export function entriesInGroup(group: KnowledgeGroup) {
  return publishedEntries()
    .filter((entry) => entry.group === group)
    .sort(byEditorial);
}

export function findKnowledge(input: string) {
  const haystack = ` ${normalizeTerm(input)} `;
  const ranked = publishedEntries()
    .flatMap((entry) =>
      [entry.title, entry.slug.replaceAll("-", " "), ...entry.aliases].map((alias) => ({
        alias: normalizeTerm(alias),
        entry,
      })),
    )
    .sort((a, b) => b.alias.length - a.alias.length);

  const hit = ranked.find(({ alias }) => {
    if (!alias) return false;
    const at = haystack.indexOf(alias);
    if (at < 0) return false;
    return !isLetter(haystack[at - 1]) && !isLetter(haystack[at + alias.length]);
  });
  return hit?.entry ?? null;
}

export function entryForNote(name: string) {
  return publishedEntries().find((entry) => entry.noteNames?.includes(name));
}

export function entryForAccord(name: string) {
  return publishedEntries().find((entry) => entry.accordNames?.includes(name));
}

export function entryForConcentration(label: string | null | undefined) {
  if (!label) return undefined;
  return publishedEntries().find((entry) => entry.concentrationLabels?.includes(label));
}

export function relatedPerfumes(entry: KnowledgeEntry, limit = 5): Perfume[] {
  const matches = publishedPerfumes().filter((perfume) => {
    if (entry.slug === "testers-decants-dupes") return Boolean(perfume.inspiredBy);
    if (perfume.concentration && entry.concentrationLabels?.includes(perfume.concentration)) return true;
    if (entry.noteNames?.some((name) => perfume.notes.some((note) => note.name === name))) return true;
    if (entry.accordNames?.some((name) => perfume.accords.some((accord) => accord.name === name))) return true;
    return false;
  });
  return matches.slice(0, limit);
}

export function relatedEntries(entry: KnowledgeEntry) {
  return entry.related.map((slug) => getEntry(slug)).filter((item): item is KnowledgeEntry => Boolean(item));
}

function normalizeTerm(input: string) {
  return input
    .replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)))
    .replace(/ي/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/‌/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function isLetter(char: string | undefined) {
  return Boolean(char && /[\p{L}]/u.test(char));
}
