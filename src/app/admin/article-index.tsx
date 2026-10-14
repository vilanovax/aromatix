"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { moveArticle, setArticleActive } from "@/app/admin/learn-actions";
import { Chip } from "@/components/Chip";
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
type GroupFilter = KnowledgeGroup | "all";

export function ArticleIndex({ rows }: { rows: ArticleRow[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortId>("order");
  const [group, setGroup] = useState<GroupFilter>("all");
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const filtered = rows.filter((row) => {
      if (group !== "all" && row.group !== group) return false;
      if (!needle) return true;
      return `${row.title} ${row.slug} ${groupLabel(row.group)}`.toLowerCase().includes(needle);
    });
    return [...filtered].sort((a, b) => compareRows(a, b, sort));
  }, [group, query, rows, sort]);
  const canReorder = sort === "order" && group === "all" && !query.trim();
  const narrowed = Boolean(query.trim()) || group !== "all";

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
            className="h-11 w-full rounded-field border border-input bg-field shadow-field px-3.5 text-body outline-none focus-visible:outline-2 focus-visible:outline-ring"
          />
        </label>
        <label className="min-w-0 sm:w-36">
          <span className="sr-only">مرتب‌سازی</span>
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value as SortId)}
            className="h-11 w-full rounded-field border border-input bg-field shadow-field px-3 text-label outline-none focus-visible:outline-2 focus-visible:outline-ring"
          >
            {SORTS.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <ul className="mt-3 flex flex-wrap gap-2" aria-label="دسته‌ها">
        <li>
          <Chip selected={group === "all"} onClick={() => setGroup("all")}>
            همه
          </Chip>
        </li>
        {KNOWLEDGE_GROUPS.map((item) => (
          <li key={item.id}>
            <Chip selected={group === item.id} onClick={() => setGroup(item.id)}>
              {item.label}
            </Chip>
          </li>
        ))}
      </ul>

      {narrowed ? (
        <p className="mt-3 text-label text-muted-foreground">
          {faNum(visible.length)} از {faNum(rows.length)}
          {sort === "order" ? ". جابه‌جایی در فهرست کامل است." : ""}
        </p>
      ) : canReorder ? (
        <p className="mt-3 text-label text-muted-foreground">بالا و پایین، ترتیب صفحهٔ عمومی را عوض می‌کند.</p>
      ) : null}

      {error ? (
        <p role="alert" className="mt-3 text-label text-destructive">
          {error}
        </p>
      ) : null}

      {visible.length === 0 ? (
        <p className="mt-4 text-body text-muted-foreground">{group !== "all" && !query.trim() ? "در این دسته مقاله‌ای نیست." : "با این عبارت مقاله‌ای نیست."}</p>
      ) : (
        <ul className="mt-3 overflow-hidden rounded-surface border border-border bg-card">
          {visible.map((row, index) => (
              <li key={row.slug} className={index === 0 ? undefined : "border-t border-border"}>
                <div className="flex flex-col gap-2 px-3 py-2.5 sm:flex-row sm:items-center sm:gap-3 sm:px-3.5">
                  <Link href={`/admin/learn/${row.slug}`} className="min-w-0 flex-1 rounded-control hover:underline">
                    <span className={cn("block text-pretty text-body font-medium", row.active ? "text-foreground" : "text-muted-foreground")}>{row.title}</span>
                    <span className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-label text-muted-foreground">
                      <span>{groupLabel(row.group)}</span>
                      <span aria-hidden>·</span>
                      <span>{row.display === "card" ? "کارت شاخص" : "ردیف"}</span>
                      <span aria-hidden>·</span>
                      <span>{formatShamsi(row.publishedOn)}</span>
                      <span aria-hidden>·</span>
                      <span className={row.views > 0 ? "text-foreground" : undefined}>{faNum(row.views)} بازدید</span>
                    </span>
                  </Link>
                  <div className="flex shrink-0 items-center gap-2">
                    {canReorder ? (
                      <span className="flex gap-1">
                        <button
                          type="button"
                          aria-label="بالاتر"
                          disabled={pending !== null || index === 0}
                          onClick={() => move(row, "up")}
                          className="grid size-9 place-items-center rounded-control border border-border text-muted-foreground disabled:opacity-40"
                        >
                          <Chevron className="rotate-180" />
                        </button>
                        <button
                          type="button"
                          aria-label="پایین‌تر"
                          disabled={pending !== null || index === visible.length - 1}
                          onClick={() => move(row, "down")}
                          className="grid size-9 place-items-center rounded-control border border-border text-muted-foreground disabled:opacity-40"
                        >
                          <Chevron />
                        </button>
                      </span>
                    ) : null}
                    <button
                      type="button"
                      aria-pressed={row.active}
                      disabled={pending === row.slug}
                      onClick={() => toggle(row)}
                      className={cn(
                        "min-h-9 min-w-16 rounded-full border px-3 text-label",
                        row.active ? "border-border text-foreground" : "border-destructive text-destructive",
                      )}
                    >
                      {pending === row.slug ? "…" : row.active ? "فعال" : "پنهان"}
                    </button>
                  </div>
                </div>
              </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Chevron({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={cn("size-4", className)} aria-hidden>
      <path d="M4 6.5 8 10.5 12 6.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
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
