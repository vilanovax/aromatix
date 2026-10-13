import "server-only";
import { cache } from "react";
import { installKnowledge, seedArticles, type ArticleDisplay, type KnowledgeEntry } from "@/lib/knowledge";
import { db } from "@/prisma/db";

export type ArticleStore = "empty" | "ready" | "offline";

function fromRow(row: {
  slug: string;
  title: string;
  active: boolean;
  sort: number;
  display: string;
  publishedOn: string;
  document: string;
}): KnowledgeEntry | null {
  try {
    const value = JSON.parse(row.document) as KnowledgeEntry;
    if (!value || typeof value !== "object" || !Array.isArray(value.body) || !Array.isArray(value.aliases)) return null;
    const display: ArticleDisplay = row.display === "card" ? "card" : "row";
    return {
      ...value,
      slug: row.slug,
      title: row.title,
      active: row.active,
      sort: row.sort,
      display,
      publishedOn: row.publishedOn,
    };
  } catch {
    return null;
  }
}

export const loadArticles = cache(async (): Promise<KnowledgeEntry[]> => {
  try {
    const rows = await db.orm.aroma.LearnArticle.orderBy((row) => row.sort.asc()).all();
    if (rows.length === 0) {
      const seed = seedArticles();
      installKnowledge(seed);
      return seed;
    }
    const entries = rows.flatMap((row) => {
      const entry = fromRow(row);
      return entry ? [entry] : [];
    });
    installKnowledge(entries);
    return entries;
  } catch (error) {
    console.error(error);
    const seed = seedArticles();
    installKnowledge(seed);
    return seed;
  }
});

export const loadArticleDesk = cache(async (): Promise<{ store: ArticleStore; articles: KnowledgeEntry[] }> => {
  try {
    const rows = await db.orm.aroma.LearnArticle.orderBy((row) => row.sort.asc()).all();
    if (rows.length === 0) return { store: "empty", articles: [] };
    const articles = rows.flatMap((row) => {
      const entry = fromRow(row);
      return entry ? [entry] : [];
    });
    installKnowledge(articles);
    return { store: "ready", articles };
  } catch (error) {
    console.error(error);
    return { store: "offline", articles: [] };
  }
});

export const articleStoreStatus = cache(async (): Promise<ArticleStore> => {
  try {
    const rows = await db.orm.aroma.LearnArticle.select("slug").all();
    return rows.length === 0 ? "empty" : "ready";
  } catch (error) {
    console.error(error);
    return "offline";
  }
});

export async function articleViewCounts() {
  const counts = new Map<string, number>();
  try {
    const rows = await db.orm.aroma.UsageEvent.where((row) => row.kind.eq("article_view")).select("subject").all();
    for (const row of rows) counts.set(row.subject, (counts.get(row.subject) ?? 0) + 1);
  } catch (error) {
    console.error(error);
  }
  return counts;
}
