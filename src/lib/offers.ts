import { formatCheckedOn } from "@/lib/admin/health";
import { offerAvailability } from "@/lib/offer-stock";
import type { OfferStock, Perfume, ShopOffer } from "@/lib/types";
import { en, fa } from "@/lib/utils";

export const PRICE_JUMP = 0.4;
const MAX_PRICE = 1_000_000_000;
const MAX_ROWS = 5000;
const MAX_TEXT = 500_000;

export type OfferFeedMode = "patch" | "snapshot";

export type ShopRef = { slug: string; nameFa: string; website: string };

export type HeldOffer = {
  shop: string;
  shopName: string;
  perfume: string;
  perfumeName: string;
  previous: number;
  next: number;
};

export type SkippedOffer = { line: number; reason: string };

export type OfferApplyReport = {
  applied: number;
  unchanged: number;
  unconfirmed: number;
  held: HeldOffer[];
  skipped: SkippedOffer[];
  shops: string[];
};

type FeedRow = {
  line: number;
  shop: string;
  perfume: string;
  price: number;
  stock: OfferStock | null;
  checkedAt: string | null;
  href: string | null;
};

export type OfferFeed = {
  mode: OfferFeedMode;
  shop?: string;
  acceptJumps: boolean;
  accept: string[];
  rows: FeedRow[];
};

export function offerMatchesShop(offer: ShopOffer, shop: { slug: string; nameFa: string }) {
  if (offer.shopSlug) return offer.shopSlug === shop.slug;
  return offer.shop === shop.nameFa;
}

export function parseOfferFeed(input: {
  text?: unknown;
  mode?: unknown;
  shop?: unknown;
  acceptJumps?: unknown;
}): { ok: true; feed: OfferFeed } | { ok: false; error: string } {
  const mode = input.mode === "snapshot" ? "snapshot" : input.mode === "patch" || input.mode == null ? "patch" : null;
  if (!mode) return { ok: false, error: "حالت اعمال باید وصله یا تصویر کامل باشد." };
  const shop = optionalSlug(input.shop);
  if (shop === false) return { ok: false, error: "محدودهٔ فروشگاه شناسهٔ معتبری نیست." };
  const acceptJumps = input.acceptJumps === true;
  const text = typeof input.text === "string" ? input.text.replace(/^\uFEFF/, "").trim() : "";
  if (!text) return { ok: false, error: "فایلی برای اعمال نیست." };
  if (text.length > MAX_TEXT) return { ok: false, error: "فایل بزرگ‌تر از حد اعمال است." };

  const parsed = text.startsWith("{") || text.startsWith("[") ? parseJson(text) : parseCsv(text);
  if (!parsed.ok) return parsed;
  if (parsed.rows.length > MAX_ROWS) return { ok: false, error: "تعداد ردیف‌ها بیشتر از حد اعمال است." };

  const bodyMode = parsed.mode;
  const bodyShop = parsed.shop;
  const bodyJumps = parsed.acceptJumps;
  const accept = parsed.accept;
  return {
    ok: true,
    feed: {
      mode: input.mode == null ? bodyMode : mode,
      shop: input.shop ? shop || undefined : bodyShop,
      acceptJumps: input.acceptJumps == null ? bodyJumps : acceptJumps,
      accept,
      rows: parsed.rows,
    },
  };
}

export function applyOfferFeed(perfumes: Perfume[], shops: ShopRef[], feed: OfferFeed, now = new Date()): { perfumes: Perfume[]; changed: string[]; report: OfferApplyReport } {
  const shopBySlug = new Map(shops.map((shop) => [shop.slug, shop]));
  const perfumeBySlug = new Map(perfumes.map((perfume) => [perfume.slug, perfume]));
  const skipped: SkippedOffer[] = [];
  const ready = new Map<string, FeedRow & { shopName: string; hrefFallback: string }>();

  for (const row of feed.rows) {
    const shopSlug = row.shop || feed.shop || "";
    const perfumeSlug = row.perfume;
    if (!shopSlug || !perfumeSlug) {
      skipped.push({ line: row.line, reason: "فروشگاه یا عطر خالی است." });
      continue;
    }
    if (feed.shop && shopSlug !== feed.shop) {
      skipped.push({ line: row.line, reason: "این ردیف مال فروشگاه انتخاب‌شده نیست." });
      continue;
    }
    const shop = shopBySlug.get(shopSlug);
    if (!shop) {
      skipped.push({ line: row.line, reason: `فروشگاه «${shopSlug}» در فهرست نیست.` });
      continue;
    }
    if (!perfumeBySlug.has(perfumeSlug)) {
      skipped.push({ line: row.line, reason: `عطر «${perfumeSlug}» در کاتالوگ نیست.` });
      continue;
    }
    const key = `${shopSlug}/${perfumeSlug}`;
    const previous = ready.get(key);
    if (previous) skipped.push({ line: previous.line, reason: "ردیف تکراری؛ ردیف بعدی مانده." });
    ready.set(key, { ...row, shop: shopSlug, perfume: perfumeSlug, shopName: shop.nameFa, hrefFallback: shop.website });
  }

  const next = perfumes.map((perfume) => ({ ...perfume, shops: perfume.shops.map((offer) => ({ ...offer })) }));
  const nextBySlug = new Map(next.map((perfume) => [perfume.slug, perfume]));
  const changed = new Set<string>();
  const held: HeldOffer[] = [];
  const covered = new Set<string>();
  const snapshotShops = new Set<string>();
  let applied = 0;
  let unchanged = 0;
  const checkedAtNow = now.toISOString();
  const accept = new Set(feed.accept);
  const latest = now.getTime() + 24 * 60 * 60 * 1000;

  for (const row of ready.values()) {
    const perfume = nextBySlug.get(row.perfume);
    if (!perfume) continue;
    const index = perfume.shops.findIndex((offer) => offerMatchesShop(offer, { slug: row.shop, nameFa: row.shopName }));
    const current = index >= 0 ? perfume.shops[index] : undefined;
    const stock = row.stock ?? (current ? offerAvailability(current) : "unknown");
    const href = row.href ?? current?.href ?? (stock === "in_stock" ? row.hrefFallback : "");
    if (stock === "in_stock" && !/^https:\/\/\S+$/.test(href)) {
      skipped.push({ line: row.line, reason: "برای موجودی تأییدشده لینک باید با https:// شروع شود." });
      continue;
    }
    if (row.checkedAt && Date.parse(row.checkedAt) > latest) {
      skipped.push({ line: row.line, reason: "تاریخ بررسی در آینده است." });
      continue;
    }
    const checkedAt = row.checkedAt ?? current?.checkedAt ?? checkedAtNow;
    snapshotShops.add(row.shop);
    const offer: ShopOffer = {
      shop: row.shopName,
      shopSlug: row.shop,
      price: row.price,
      checkedAt,
      checkedOn: formatCheckedOn(new Date(checkedAt)),
      stock,
      stockConfirmed: stock === "in_stock",
      href,
    };
    const key = `${row.shop}/${row.perfume}`;
    covered.add(key);
    if (current && current.price !== offer.price && isJump(current.price, offer.price) && !feed.acceptJumps && !accept.has(key)) {
      held.push({
        shop: row.shop,
        shopName: row.shopName,
        perfume: row.perfume,
        perfumeName: perfume.nameFa,
        previous: current.price,
        next: offer.price,
      });
      continue;
    }
    if (current && sameOffer(current, offer)) {
      if (!current.shopSlug) {
        perfume.shops[index] = { ...current, shopSlug: row.shop, shop: row.shopName };
        changed.add(perfume.slug);
        applied += 1;
      } else unchanged += 1;
      continue;
    }
    if (index >= 0) perfume.shops[index] = offer;
    else perfume.shops.push(offer);
    changed.add(perfume.slug);
    applied += 1;
  }

  let unconfirmed = 0;
  if (feed.mode === "snapshot") {
    for (const perfume of next) {
      perfume.shops = perfume.shops.map((offer) => {
        const slug = offer.shopSlug ?? shops.find((shop) => shop.nameFa === offer.shop)?.slug;
        if (!slug || !snapshotShops.has(slug)) return offer;
        if (covered.has(`${slug}/${perfume.slug}`)) return offer;
        if (offerAvailability(offer) === "unknown" && offer.shopSlug === slug) return offer;
        unconfirmed += 1;
        changed.add(perfume.slug);
        return { ...offer, shopSlug: slug, stock: "unknown" as const, stockConfirmed: false };
      });
    }
  }

  return {
    perfumes: next,
    changed: [...changed],
    report: {
      applied,
      unchanged,
      unconfirmed,
      held,
      skipped: skipped.sort((a, b) => a.line - b.line),
      shops: [...new Set([...ready.values()].map((row) => row.shop))],
    },
  };
}

export function offersToCsv(perfumes: Perfume[], shops: ShopRef[], shopSlug?: string) {
  const shop = shopSlug ? shops.find((item) => item.slug === shopSlug) : undefined;
  const lines = ["shop,perfume,name,price,stock,checkedAt,href"];
  for (const perfume of perfumes) {
    for (const offer of perfume.shops) {
      const slug = offer.shopSlug ?? shops.find((item) => item.nameFa === offer.shop)?.slug ?? "";
      if (shop && !offerMatchesShop({ ...offer, shopSlug: slug || offer.shopSlug }, shop)) continue;
      lines.push(
        [slug, perfume.slug, perfume.nameFa, String(offer.price), offerAvailability(offer), offer.checkedAt ?? "", offer.href]
          .map(csvCell)
          .join(","),
      );
    }
  }
  return `\uFEFF${lines.join("\n")}\n`;
}

function isJump(previous: number, next: number) {
  if (previous <= 0) return true;
  return Math.abs(next - previous) / previous > PRICE_JUMP;
}

function sameOffer(current: ShopOffer, next: ShopOffer) {
  return (
    current.price === next.price &&
    offerAvailability(current) === offerAvailability(next) &&
    current.href === next.href &&
    current.checkedAt === next.checkedAt &&
    current.shop === next.shop
  );
}

function optionalSlug(value: unknown): string | false | undefined {
  if (value == null || value === "") return undefined;
  if (typeof value !== "string") return false;
  const slug = value.trim().toLowerCase();
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return false;
  return slug;
}

function parseJson(text: string): { ok: true; rows: FeedRow[]; mode: OfferFeedMode; shop?: string; acceptJumps: boolean; accept: string[] } | { ok: false; error: string } {
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch {
    return { ok: false, error: "JSON فایل خوانده نشد." };
  }
  const body = Array.isArray(value) ? { rows: value } : value;
  if (!body || typeof body !== "object") return { ok: false, error: "فایل باید فهرست ردیف‌ها باشد." };
  const record = body as Record<string, unknown>;
  const mode = record.mode === "snapshot" ? "snapshot" : "patch";
  const shop = optionalSlug(record.shop);
  if (shop === false) return { ok: false, error: "شناسهٔ فروشگاه در فایل معتبر نیست." };
  const acceptJumps = record.acceptJumps === true;
  const accept = Array.isArray(record.accept) ? record.accept.filter((item): item is string => typeof item === "string") : [];
  const rows = record.rows;
  if (!Array.isArray(rows)) return { ok: false, error: "فیلد rows در فایل نیست." };
  const parsed: FeedRow[] = [];
  for (let index = 0; index < rows.length; index += 1) {
    const row = rows[index];
    if (!row || typeof row !== "object") return { ok: false, error: `ردیف ${fa(index + 1)} شیء نیست.` };
    const item = row as Record<string, unknown>;
    const built = buildRow(index + 1, {
      shop: item.shop ?? item.shopSlug,
      perfume: item.perfume ?? item.perfumeSlug,
      price: item.price,
      stock: item.stock,
      checkedAt: item.checkedAt ?? item.checked_at,
      href: item.href ?? item.link,
    });
    if (!built.ok) return built;
    parsed.push(built.row);
  }
  return { ok: true, rows: parsed, mode, shop: shop || undefined, acceptJumps, accept };
}

function parseCsv(text: string): { ok: true; rows: FeedRow[]; mode: OfferFeedMode; shop?: string; acceptJumps: boolean; accept: string[] } | { ok: false; error: string } {
  const table = parseCsvTable(text);
  if (table.length === 0) return { ok: false, error: "فایلی برای اعمال نیست." };
  const header = table[0].map((cell) => cell.trim().toLowerCase());
  const column = (names: string[]) => header.findIndex((cell) => names.includes(cell));
  const shopAt = column(["shop", "shopslug", "فروشگاه"]);
  const perfumeAt = column(["perfume", "perfumeslug", "عطر"]);
  const priceAt = column(["price", "قیمت"]);
  const stockAt = column(["stock", "موجودی"]);
  const checkedAt = column(["checkedat", "checked_at", "تاریخ"]);
  const hrefAt = column(["href", "link", "لینک"]);
  if (perfumeAt < 0 || priceAt < 0) return { ok: false, error: "سطر اول باید ستون‌های perfume و price را داشته باشد." };
  const rows: FeedRow[] = [];
  for (let index = 1; index < table.length; index += 1) {
    const cells = table[index];
    const built = buildRow(index + 1, {
      shop: shopAt >= 0 ? cells[shopAt] : "",
      perfume: cells[perfumeAt],
      price: cells[priceAt],
      stock: stockAt >= 0 ? cells[stockAt] : undefined,
      checkedAt: checkedAt >= 0 ? cells[checkedAt] : undefined,
      href: hrefAt >= 0 ? cells[hrefAt] : undefined,
    });
    if (!built.ok) return { ok: false, error: `سطر ${fa(index + 1)}: ${built.error}` };
    rows.push(built.row);
  }
  return { ok: true, rows, mode: "patch", acceptJumps: false, accept: [] };
}

function buildRow(
  line: number,
  input: { shop: unknown; perfume: unknown; price: unknown; stock: unknown; checkedAt: unknown; href: unknown },
): { ok: true; row: FeedRow } | { ok: false; error: string } {
  const shop = cell(input.shop).toLowerCase();
  const perfume = cell(input.perfume).toLowerCase();
  if (shop && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(shop)) return { ok: false, error: "شناسهٔ فروشگاه فقط حرف کوچک، عدد و خط تیره است." };
  if (perfume && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(perfume)) return { ok: false, error: "شناسهٔ عطر فقط حرف کوچک، عدد و خط تیره است." };
  const price = parsePrice(input.price);
  if (price == null) return { ok: false, error: "قیمت باید عدد صحیح تومان باشد." };
  const stockCell = cell(input.stock);
  const stock = stockCell ? parseStock(stockCell) : null;
  if (stockCell && !stock) return { ok: false, error: "موجودی باید in_stock، out_of_stock یا unknown باشد." };
  const checkedCell = cell(input.checkedAt);
  let checkedAt: string | null = null;
  if (checkedCell) {
    const time = Date.parse(checkedCell);
    if (Number.isNaN(time)) return { ok: false, error: "تاریخ بررسی باید ISO باشد یا خالی بماند." };
    checkedAt = new Date(time).toISOString();
  }
  const hrefCell = cell(input.href);
  if (hrefCell && !/^https:\/\/\S+$/.test(hrefCell)) return { ok: false, error: "لینک باید با https:// شروع شود." };
  return { ok: true, row: { line, shop, perfume, price, stock, checkedAt, href: hrefCell || null } };
}

function parsePrice(value: unknown) {
  const raw = en(cell(value)).replace(/[,\s٬]/g, "");
  if (!/^\d+$/.test(raw)) return null;
  const price = Number(raw);
  if (!Number.isSafeInteger(price) || price < 1 || price > MAX_PRICE) return null;
  return price;
}

function parseStock(value: string): OfferStock | null {
  const token = value.trim().toLowerCase().replace(/\s+/g, "_");
  if (["in_stock", "instock", "available", "موجود", "yes", "1"].includes(token)) return "in_stock";
  if (["out_of_stock", "outofstock", "out", "ناموجود", "0"].includes(token)) return "out_of_stock";
  if (["unknown", "نامشخص"].includes(token)) return "unknown";
  return null;
}

function cell(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  if (typeof value !== "string") return "";
  return value.trim();
}

function csvCell(value: string) {
  const safe = /^[=+\-@]/.test(value) ? `'${value}` : value;
  if (/[",\n]/.test(safe)) return `"${safe.replace(/"/g, '""')}"`;
  return safe;
}

function parseCsvTable(text: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (quoted) {
      if (char === '"') {
        if (text[index + 1] === '"') {
          field += '"';
          index += 1;
        } else quoted = false;
      } else field += char;
      continue;
    }
    if (char === '"') quoted = true;
    else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (char !== "\r") field += char;
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((cells) => cells.some((item) => item.trim()));
}
