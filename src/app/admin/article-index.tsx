"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { moveArticle, setArticleActive } from "@/app/admin/learn-actions";
import { KNOWLEDGE_GROUPS, type ArticleDisplay, type KnowledgeGroup } from "@/lib/knowledge";
import { formatShamsi } from "@/lib/jalali";
import { cn, faNum } from "@/lib/format";

export type ArticleRow = {
  slug: string;
  title: string;
  group: KnowledgeGroup;
  display: ArticleDisplay;
  active: boolean;
  sort: number;
  publishedOn: string;
  views: number;
};

const SORTS = [
  { id: "order", label: "ترتیب" },
  { id: "date", label: "تاریخ" },
  { id: "views", label: "بازدید" },
  { id: "title", label: "عنوان" },
] as const;

type SortId = (typeof SORTS)[number]["id"];

export function ArticleIndex({ rows }: { rows: ArticleRow[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortId>("order");
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const filtered = needle ? rows.filter((row) => `${row.title} ${row.slug}`.toLowerCase().includes(needle)) : rows;
    return [...filtered].sort((a, b) => compareRows(a, b, sort));
  }, [query, rows, sort]);

  async function toggle(row: ArticleRow) {
    const next = !row.active;
    if (!next && !window.confirm("این مقاله از دانستنی‌ها و دستیار پنهان می‌شود.")) return;
    setPending(row.slug);
    setError(null);
    const result = await setArticleActive({ slug: row.slug, active: next });
    setPending(null);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  async function move(row: ArticleRow, direction: "up" | "down") {
    setPending(row.slug);
    setError(null);
    const result = await moveArticle({ slug: row.slug, direction });
    setPending(null);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <div className="mt-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <label className="block min-w-0 flex-1">
          <span className="sr-only">جستجو در دانستنی‌ها</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="عنوان یا اسلاگ"
            className="min-h-12 w-full rounded-control border border-line bg-card px-3.5 text-body outline-none focus-visible:outline-2 focus-visible:outline-ink"
          />
        </label>
        <label className="min-w-0 sm:w-36">
          <span className="sr-only">مرتب‌سازی</span>
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value as SortId)}
            className="min-h-12 w-full rounded-control border border-line bg-card px-3 text-label outline-none focus-visible:outline-2 focus-visible:outline-ink"
          >
            {SORTS.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      {error ? (
        <p role="alert" className="mt-3 text-label text-danger">
          {error}
        </p>
      ) : null}
      {visible.length === 0 ? (
        <p className="mt-4 text-body text-muted">با این عبارت مقاله‌ای نیست.</p>
      ) : (
        <ul className="mt-3 grid gap-2">
          {visible.map((row, index) => (
            <li key={row.slug} className="flex items-stretch gap-2 rounded-panel border border-line bg-card">
              <Link href={`/admin/learn/${row.slug}`} className="min-w-0 flex-1 px-3.5 py-3 hover:bg-press">
                <span className="block text-pretty text-body font-medium">{row.title}</span>
                <span className="mt-1 block text-label text-muted">
                  {groupLabel(row.group)}
                  <span className="mx-1.5 text-faint">·</span>
                  {row.display === "card" ? "کارت شاخص" : "ردیف"}
                  <span className="mx-1.5 text-faint">·</span>
                  {formatShamsi(row.publishedOn)}
                </span>
                <span className="mt-1 block text-label text-faint">{faNum(row.views)} بازدید</span>
              </Link>
              <div className="flex shrink-0 flex-col items-end justify-center gap-2 py-3 pe-3">
                {sort === "order" && !query.trim() ? (
                  <span className="flex gap-1">
                    <button
                      type="button"
                      aria-label="بالاتر"
                      disabled={pending === row.slug || index === 0}
                      onClick={() => move(row, "up")}
                      className="min-h-8 rounded-control border border-line px-2 text-label text-muted disabled:opacity-40"
                    >
                      بالا
                    </button>
                    <button
                      type="button"
                      aria-label="پایین‌تر"
                      disabled={pending === row.slug || index === visible.length - 1}
                      onClick={() => move(row, "down")}
                      className="min-h-8 rounded-control border border-line px-2 text-label text-muted disabled:opacity-40"
                    >
                      پایین
                    </button>
                  </span>
                ) : null}
                <button
                  type="button"
                  aria-pressed={row.active}
                  disabled={pending === row.slug}
                  onClick={() => toggle(row)}
                  className={cn(
                    "min-h-10 rounded-full px-3 text-label",
                    row.active ? "bg-ink font-medium text-paper" : "border border-line text-muted",
                  )}
                >
                  {pending === row.slug ? "…" : row.active ? "فعال" : "غیرفعال"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function groupLabel(id: KnowledgeGroup) {
  return KNOWLEDGE_GROUPS.find((item) => item.id === id)?.label ?? id;
}

function compareRows(a: ArticleRow, b: ArticleRow, sort: SortId) {
  if (sort === "date") return b.publishedOn.localeCompare(a.publishedOn) || a.sort - b.sort;
  if (sort === "views") return b.views - a.views || a.sort - b.sort;
  if (sort === "title") return a.title.localeCompare(b.title, "fa");
  return a.sort - b.sort;
}
