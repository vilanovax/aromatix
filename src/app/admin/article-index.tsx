"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { moveArticle, setArticleActive } from "@/app/admin/learn-actions";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { SearchInput } from "@/components/ui/search-input";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
        <div className="min-w-0 flex-1">
          <SearchInput value={query} onChange={setQuery} placeholder="عنوان یا اسلاگ" aria-label="جستجو در دانستنی‌ها" />
        </div>
        <div className="min-w-0 sm:w-36">
          <Select
            aria-label="مرتب‌سازی"
            value={sort}
            onChange={(event) => setSort(event.target.value as SortId)}
            options={SORTS.map((item) => ({ value: item.id, label: item.label }))}
          />
        </div>
      </div>

      <Tabs value={group} defaultValue="all" onValueChange={(next) => setGroup(next as GroupFilter)} className="mt-3">
        <TabsList aria-label="دسته‌ها">
          <TabsTrigger value="all">همه</TabsTrigger>
          {KNOWLEDGE_GROUPS.map((item) => (
            <TabsTrigger key={item.id} value={item.id}>
              {item.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {narrowed ? (
        <p className="mt-3 text-label text-muted-foreground">
          {faNum(visible.length)} از {faNum(rows.length)}
          {sort === "order" ? ". جابه‌جایی در فهرست کامل است." : ""}
        </p>
      ) : canReorder ? (
        <p className="mt-3 text-label text-muted-foreground">بالا و پایین، ترتیب صفحهٔ عمومی را عوض می‌کند.</p>
      ) : null}

      {error ? (
        <Alert variant="destructive" className="mt-3">
          {error}
        </Alert>
      ) : null}

      {visible.length === 0 ? (
        <EmptyState className="mt-4" title={group !== "all" && !query.trim() ? "در این دسته مقاله‌ای نیست" : "با این عبارت مقاله‌ای نیست"} />
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
                        <Button type="button" size="icon" variant="outline" aria-label="بالاتر" disabled={pending !== null || index === 0} onClick={() => move(row, "up")}>
                          <ChevronDown className="rotate-180" />
                        </Button>
                        <Button type="button" size="icon" variant="outline" aria-label="پایین‌تر" disabled={pending !== null || index === visible.length - 1} onClick={() => move(row, "down")}>
                          <ChevronDown />
                        </Button>
                      </span>
                    ) : null}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{pending === row.slug ? "…" : row.active ? "فعال" : "پنهان"}</span>
                      <Switch
                        checked={row.active}
                        disabled={pending === row.slug}
                        aria-label={row.active ? "فعال" : "پنهان"}
                        onCheckedChange={(next) => {
                          if (next === row.active) return;
                          void toggle(row);
                        }}
                      />
                    </div>
                  </div>
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
