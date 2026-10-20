"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Pin } from "lucide-react";
import { setBrandActive, setBrandPinned } from "@/app/admin/actions";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { SearchInput } from "@/components/ui/search-input";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { faNum } from "@/lib/format";
import { cn } from "@/lib/utils";

export type BrandRow = {
  slug: string;
  nameFa: string;
  nameEn: string;
  description: string;
  active: boolean;
  perfumeCount: number;
};

const VIEW_KEY = "aroma-admin-brands-view";
const SORT_KEY = "aroma-admin-brands-sort";
const HIDE_KEY = "aroma-admin-brands-hide-inactive";

const VIEWS = [
  { id: "grid", label: "گرید" },
  { id: "list", label: "فهرست" },
] as const;

const SORTS = [
  { id: "name-asc", label: "نام، از الف" },
  { id: "name-desc", label: "نام، از ی" },
  { id: "count-desc", label: "بیشترین عطر" },
  { id: "count-asc", label: "کمترین عطر" },
] as const;

type View = (typeof VIEWS)[number]["id"];
type Sort = (typeof SORTS)[number]["id"];

export function BrandIndex({ rows, pins }: { rows: BrandRow[]; pins: string[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [view, setView] = useState<View>("grid");
  const [sort, setSort] = useState<Sort>("name-asc");
  const [stored, setStored] = useState(false);
  const [hideInactive, setHideInactive] = useState(false);
  const [pinned, setPinned] = useState(pins);
  const [activeBySlug, setActiveBySlug] = useState<Record<string, boolean>>({});
  const [pending, setPending] = useState<string | null>(null);
  const [pinPending, setPinPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const pinKey = pins.join("\n");
  const rowKey = rows.map((row) => `${row.slug}:${row.active ? "1" : "0"}`).join("\n");

  useEffect(() => {
    setPinned(pinKey ? pinKey.split("\n") : []);
  }, [pinKey]);

  useEffect(() => {
    setActiveBySlug((current) => {
      const server = new Map(rowKey.split("\n").filter(Boolean).map((item) => {
        const split = item.lastIndexOf(":");
        return [item.slice(0, split), item.slice(split + 1) === "1"] as const;
      }));
      const next: Record<string, boolean> = {};
      let changed = false;
      for (const [slug, value] of Object.entries(current)) {
        if (server.get(slug) === value) {
          changed = true;
          continue;
        }
        next[slug] = value;
      }
      return changed ? next : current;
    });
  }, [rowKey]);

  useEffect(() => {
    const storedView = localStorage.getItem(VIEW_KEY);
    const storedSort = localStorage.getItem(SORT_KEY);
    if (storedView === "grid" || storedView === "list") setView(storedView);
    if (SORTS.some((item) => item.id === storedSort)) setSort(storedSort as Sort);
    if (localStorage.getItem(HIDE_KEY) === "1") setHideInactive(true);
    setStored(true);
  }, []);

  useEffect(() => {
    if (!stored) return;
    localStorage.setItem(VIEW_KEY, view);
    localStorage.setItem(SORT_KEY, sort);
    localStorage.setItem(HIDE_KEY, hideInactive ? "1" : "0");
  }, [hideInactive, stored, sort, view]);

  const liveRows = useMemo(
    () => rows.map((row) => (row.slug in activeBySlug ? { ...row, active: activeBySlug[row.slug] } : row)),
    [activeBySlug, rows],
  );
  const activeCount = liveRows.filter((row) => row.active).length;

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const filtered = liveRows.filter((row) => {
      if (hideInactive && !row.active) return false;
      if (!needle) return true;
      return [row.nameFa, row.nameEn, row.slug, row.description].some((value) => value.toLowerCase().includes(needle));
    });
    const stuck = new Set(pinned);
    const compare = bySort(sort);
    return [...filtered.filter((row) => stuck.has(row.slug)).sort(compare), ...filtered.filter((row) => !stuck.has(row.slug)).sort(compare)];
  }, [hideInactive, liveRows, pinned, query, sort]);

  async function toggle(row: BrandRow) {
    const next = !row.active;
    if (!next && !window.confirm("این برند از فهرست عمومی پنهان می‌شود. عطرهایش در مدیریت می‌مانند.")) return;
    setActiveBySlug((current) => ({ ...current, [row.slug]: next }));
    setPending(row.slug);
    setError(null);
    const result = await setBrandActive({ slug: row.slug, active: next });
    setPending(null);
    if (!result.ok) {
      setActiveBySlug((current) => ({ ...current, [row.slug]: !next }));
      setError(result.error);
      return;
    }
    router.refresh();
  }

  async function pin(row: BrandRow) {
    const next = !pinned.includes(row.slug);
    const previous = pinned;
    setPinned(next ? [row.slug, ...pinned.filter((slug) => slug !== row.slug)] : pinned.filter((slug) => slug !== row.slug));
    setPinPending(row.slug);
    setError(null);
    const result = await setBrandPinned({ slug: row.slug, pinned: next });
    setPinPending(null);
    if (!result.ok) {
      setPinned(previous);
      setError(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <div className="mt-1">
      <p className="text-label text-muted-foreground">
        {faNum(rows.length)} برند، {faNum(activeCount)} فعال
      </p>
      <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="min-w-0 flex-1">
          <SearchInput value={query} onChange={setQuery} placeholder="نام" aria-label="جستجو در برندها" />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Tabs value={view} defaultValue="grid" onValueChange={(next) => setView(next as View)}>
            <TabsList aria-label="نوع نمایش">
              {VIEWS.map((item) => (
                <TabsTrigger key={item.id} value={item.id} className="min-h-11">
                  {item.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <button
            type="button"
            aria-pressed={hideInactive}
            onClick={() => setHideInactive((value) => !value)}
            className={cn(
              "inline-flex min-h-11 items-center rounded-control px-3 text-label font-medium",
              hideInactive ? "bg-primary text-primary-foreground" : "border border-input bg-card text-foreground hover:bg-accent",
            )}
          >
            پنهان کردن غیرفعال
          </button>
          <div className="min-w-0 flex-1 sm:w-44 sm:flex-none">
            <Select
              aria-label="مرتب‌سازی"
              value={sort}
              onChange={(event) => {
                const next = event.target.value;
                if (SORTS.some((item) => item.id === next)) setSort(next as Sort);
              }}
              options={SORTS.map((item) => ({ value: item.id, label: item.label }))}
            />
          </div>
        </div>
      </div>
      {pinned.length > 0 ? <p className="mt-2 text-label text-muted-foreground">پین‌شده‌ها بالای بقیه می‌مانند.</p> : null}
      {error ? (
        <Alert variant="destructive" className="mt-3">
          {error}
        </Alert>
      ) : null}
      {visible.length === 0 ? (
        <EmptyState className="mt-4" title={query.trim() ? "با این عبارت برندی نیست" : "برند فعالی در این نما نیست"} />
      ) : (
        <ul className={view === "grid" ? "mt-3 grid grid-cols-2 gap-2 lg:grid-cols-3" : "mt-3 grid gap-2"}>
          {visible.map((row) => (
            <li key={row.slug} className="min-w-0">
              <BrandCard
                row={row}
                view={view}
                pinned={pinned.includes(row.slug)}
                pinPending={pinPending === row.slug}
                activePending={pending === row.slug}
                onPin={() => void pin(row)}
                onToggle={() => void toggle(row)}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function bySort(sort: Sort) {
  return (a: BrandRow, b: BrandRow) => {
    if (sort === "count-asc" || sort === "count-desc") {
      const diff = a.perfumeCount - b.perfumeCount;
      if (diff !== 0) return sort === "count-asc" ? diff : -diff;
    }
    const byName = a.nameFa.localeCompare(b.nameFa, "fa") || a.nameEn.localeCompare(b.nameEn, "en") || a.slug.localeCompare(b.slug);
    return sort === "name-desc" ? -byName : byName;
  };
}

function BrandCard({
  row,
  view,
  pinned,
  pinPending,
  activePending,
  onPin,
  onToggle,
}: {
  row: BrandRow;
  view: View;
  pinned: boolean;
  pinPending: boolean;
  activePending: boolean;
  onPin: () => void;
  onToggle: () => void;
}) {
  const grid = view === "grid";
  return (
    <article className={cn("flex h-full rounded-surface border bg-card", pinned ? "border-brand" : "border-border", grid ? "flex-col" : "items-stretch")}>
      <Link href={`/admin/brands/${row.slug}`} className="group min-w-0 flex-1 px-3 py-3 hover:bg-accent">
        <span className="flex min-w-0 items-baseline gap-2">
          <span className="truncate text-body font-medium group-hover:underline">{row.nameFa}</span>
          {grid ? null : <bdi className="truncate text-label text-muted-foreground">{row.nameEn}</bdi>}
        </span>
        {grid ? <bdi className="mt-0.5 block truncate text-label text-muted-foreground">{row.nameEn}</bdi> : null}
        {grid ? null : <span className="mt-1 block text-label text-muted-foreground">{faNum(row.perfumeCount)} عطر</span>}
      </Link>
      <div className={cn("flex shrink-0 items-center gap-1", grid ? "justify-between border-t border-border px-1.5 py-1" : "pe-2")}>
        <PinButton name={row.nameFa} pinned={pinned} pending={pinPending} onPin={onPin} />
        {grid ? (
          <Link
            href={`/admin/perfumes?brand=${encodeURIComponent(row.slug)}`}
            className="inline-flex min-h-11 min-w-0 items-center truncate px-1 text-label text-muted-foreground hover:text-foreground"
          >
            {faNum(row.perfumeCount)} عطر
          </Link>
        ) : (
          <Button href={`/admin/perfumes?brand=${encodeURIComponent(row.slug)}`} variant="outline" size="sm">
            لیست عطرها
          </Button>
        )}
        <div className="flex items-center gap-1.5">
          {grid ? null : <span className="text-label text-muted-foreground">{row.active ? "فعال" : "غیرفعال"}</span>}
          <Switch
            checked={row.active}
            disabled={activePending}
            aria-label={row.active ? `${row.nameFa}، فعال` : `${row.nameFa}، غیرفعال`}
            onCheckedChange={() => onToggle()}
          />
        </div>
      </div>
    </article>
  );
}

function PinButton({ name, pinned, pending, onPin }: { name: string; pinned: boolean; pending: boolean; onPin: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={pinned}
      aria-label={pinned ? `برداشتن پین ${name}` : `پین کردن ${name}`}
      disabled={pending}
      onClick={onPin}
      className={cn(
        "inline-flex size-11 shrink-0 items-center justify-center rounded-control hover:bg-accent disabled:opacity-50",
        pinned ? "text-brand" : "text-muted-foreground",
      )}
    >
      <Pin className="size-4" strokeWidth={pinned ? 2 : 1.5} fill={pinned ? "currentColor" : "none"} aria-hidden="true" />
    </button>
  );
}
