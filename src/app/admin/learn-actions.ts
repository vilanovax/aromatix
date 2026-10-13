"use server";

import { revalidatePath } from "next/cache";
import { requireSection } from "@/lib/auth/admin";
import { jalaliToIso } from "@/lib/jalali";
import { loadArticles, articleStoreStatus } from "@/lib/knowledge-server";
import {
  seedArticles,
  type ArticleDisplay,
  type KnowledgeEntry,
  type KnowledgeGroup,
} from "@/lib/knowledge";
import { db } from "@/prisma/db";

export type ActionResult = { ok: true; slug?: string } | { ok: false; error: string };

function denied(): ActionResult {
  return { ok: false, error: "به مدیریت دسترسی نداری." };
}

function publish() {
  revalidatePath("/", "layout");
}

function list(value: string) {
  return value
    .split(/[،,]/)
    .map((item) => item.trim().replace(/\s+/g, " "))
    .filter(Boolean);
}

function paragraphs(value: string) {
  return value
    .split(/\n\s*\n/)
    .map((item) => item.trim().replace(/\s+/g, " "))
    .filter(Boolean);
}

export async function publishLearnSeed(): Promise<ActionResult> {
  if (!(await requireSection("learn"))) return denied();
  if ((await articleStoreStatus()) === "ready") return { ok: false, error: "دانستنی‌ها قبلاً منتشر شده." };
  try {
    const now = new Date().toISOString();
    for (const entry of seedArticles()) {
      await db.orm.aroma.LearnArticle.create(rowOf(entry, now));
    }
    publish();
    return { ok: true };
  } catch (error) {
    console.error(error);
    return { ok: false, error: "انتشار دانستنی‌ها نشد." };
  }
}

export async function saveArticle(input: {
  mode?: unknown;
  originalSlug?: unknown;
  slug?: unknown;
  title?: unknown;
  support?: unknown;
  ask?: unknown;
  aliases?: unknown;
  group?: unknown;
  minutes?: unknown;
  summary?: unknown;
  body?: unknown;
  mythClaim?: unknown;
  mythReality?: unknown;
  compare?: unknown;
  related?: unknown;
  noteNames?: unknown;
  accordNames?: unknown;
  concentrationLabels?: unknown;
  mark?: unknown;
  active?: unknown;
  sort?: unknown;
  display?: unknown;
  year?: unknown;
  month?: unknown;
  day?: unknown;
}): Promise<ActionResult> {
  if (!(await requireSection("learn"))) return denied();
  if ((await articleStoreStatus()) !== "ready") return { ok: false, error: "اول دانستنی‌های اولیه را منتشر کن." };
  const mode = input.mode === "create" ? "create" : "edit";
  const slug = typeof input.slug === "string" ? input.slug.trim().toLowerCase() : "";
  const original = typeof input.originalSlug === "string" ? input.originalSlug : slug;
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return { ok: false, error: "اسلاگ فقط حرف کوچک، عدد و خط تیره باشد." };
  const title = text(input.title);
  const support = text(input.support);
  const ask = text(input.ask);
  const summary = text(input.summary);
  const body = paragraphs(typeof input.body === "string" ? input.body : "");
  if (title.length < 4 || title.length > 120) return { ok: false, error: "عنوان را کوتاه و روشن بنویس." };
  if (support.length < 2 || support.length > 40) return { ok: false, error: "خط زیر عنوان را بنویس." };
  if (ask.length < 2 || ask.length > 80) return { ok: false, error: "سؤال کوتاه دستیار را بنویس." };
  if (summary.length < 8 || summary.length > 400) return { ok: false, error: "خلاصه را در چند جمله بنویس." };
  if (body.length === 0 || body.some((item) => item.length > 800)) return { ok: false, error: "متن را با یک خط خالی بین بندها بنویس." };
  const group = input.group;
  if (group !== "basics" && group !== "wear" && group !== "buy") return { ok: false, error: "دسته را انتخاب کن." };
  const minutes = Number(input.minutes);
  if (!Number.isInteger(minutes) || minutes < 1 || minutes > 30) return { ok: false, error: "زمان خواندن بین ۱ تا ۳۰ دقیقه باشد." };
  const sort = Number(input.sort);
  if (!Number.isInteger(sort) || sort < 0 || sort > 999) return { ok: false, error: "ترتیب یک عدد از ۰ تا ۹۹۹ باشد." };
  const display: ArticleDisplay = input.display === "card" ? "card" : "row";
  const publishedOn = jalaliToIso(Number(input.year), Number(input.month), Number(input.day));
  if (!publishedOn) return { ok: false, error: "تاریخ شمسی معتبر نیست." };
  const mythClaim = text(input.mythClaim);
  const mythReality = text(input.mythReality);
  if ((mythClaim && !mythReality) || (!mythClaim && mythReality)) {
    return { ok: false, error: "باور و واقعیت را با هم بنویس، یا هر دو را خالی بگذار." };
  }
  const compare = (typeof input.compare === "string" ? input.compare : "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [label, range] = line.split("|").map((part) => part?.trim() ?? "");
      return { label, range };
    });
  if (compare.some((row) => !row.label || !row.range)) return { ok: false, error: "هر سطر مقایسه باید «برچسب | بازه» باشد." };
  const mark = typeof input.mark === "string" ? input.mark.trim() : "";
  if (mark && !/^#[0-9a-fA-F]{6}$/.test(mark)) return { ok: false, error: "رنگ نشانه باید مثل #1A1420 باشد." };

  const articles = await loadArticles();
  if (mode === "create" && articles.some((entry) => entry.slug === slug)) return { ok: false, error: "این اسلاگ قبلاً هست." };
  if (mode === "edit" && !articles.some((entry) => entry.slug === original)) return { ok: false, error: "این مدخل در فهرست نیست." };
  if (slug !== original) return { ok: false, error: "اسلاگ بعد از انتشار عوض نمی‌شود." };

  const entry: KnowledgeEntry = {
    slug,
    title,
    support,
    ask,
    aliases: list(typeof input.aliases === "string" ? input.aliases : ""),
    group: group as KnowledgeGroup,
    minutes,
    summary,
    body,
    related: list(typeof input.related === "string" ? input.related : ""),
    active: input.active !== false,
    sort,
    display,
    publishedOn,
    ...(mythClaim ? { myth: { claim: mythClaim, reality: mythReality } } : {}),
    ...(compare.length > 0 ? { compare } : {}),
    ...(list(typeof input.noteNames === "string" ? input.noteNames : "").length
      ? { noteNames: list(String(input.noteNames)) }
      : {}),
    ...(list(typeof input.accordNames === "string" ? input.accordNames : "").length
      ? { accordNames: list(String(input.accordNames)) }
      : {}),
    ...(list(typeof input.concentrationLabels === "string" ? input.concentrationLabels : "").length
      ? { concentrationLabels: list(String(input.concentrationLabels)) }
      : {}),
    ...(mark ? { mark } : {}),
  };

  try {
    const now = new Date().toISOString();
    const data = rowOf(entry, now);
    if (mode === "create") await db.orm.aroma.LearnArticle.create(data);
    else await db.orm.aroma.LearnArticle.where((row) => row.slug.eq(slug)).update(data);
    publish();
    return { ok: true, slug };
  } catch (error) {
    console.error(error);
    return { ok: false, error: "مقاله ذخیره نشد." };
  }
}

export async function setArticleActive(input: { slug?: unknown; active?: unknown }): Promise<ActionResult> {
  if (!(await requireSection("learn"))) return denied();
  const slug = typeof input.slug === "string" ? input.slug : "";
  const active = input.active === true;
  const current = (await loadArticles()).find((entry) => entry.slug === slug);
  if (!current) return { ok: false, error: "این مدخل در فهرست نیست." };
  try {
    await db.orm.aroma.LearnArticle.where((row) => row.slug.eq(slug)).update({
      active,
      document: JSON.stringify({ ...current, active }),
      updatedAt: new Date().toISOString(),
    });
    publish();
    return { ok: true, slug };
  } catch (error) {
    console.error(error);
    return { ok: false, error: "وضعیت مقاله عوض نشد." };
  }
}

export async function moveArticle(input: { slug?: unknown; direction?: unknown }): Promise<ActionResult> {
  if (!(await requireSection("learn"))) return denied();
  const slug = typeof input.slug === "string" ? input.slug : "";
  const direction = input.direction === "up" ? -1 : 1;
  const articles = [...(await loadArticles())].sort((a, b) => a.sort - b.sort);
  const index = articles.findIndex((entry) => entry.slug === slug);
  const swap = index + direction;
  if (index < 0 || swap < 0 || swap >= articles.length) return { ok: true, slug };
  const next = articles.slice();
  const [item] = next.splice(index, 1);
  next.splice(swap, 0, item);
  try {
    const now = new Date().toISOString();
    for (const [order, entry] of next.entries()) {
      if (entry.sort === order) continue;
      await db.orm.aroma.LearnArticle.where((row) => row.slug.eq(entry.slug)).update({
        sort: order,
        document: JSON.stringify({ ...entry, sort: order }),
        updatedAt: now,
      });
    }
    publish();
    return { ok: true, slug };
  } catch (error) {
    console.error(error);
    return { ok: false, error: "ترتیب ذخیره نشد." };
  }
}

function text(value: unknown) {
  return typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";
}

function rowOf(entry: KnowledgeEntry, updatedAt: string) {
  return {
    slug: entry.slug,
    title: entry.title,
    active: entry.active,
    sort: entry.sort,
    display: entry.display,
    publishedOn: entry.publishedOn,
    document: JSON.stringify(entry),
    updatedAt,
  };
}
