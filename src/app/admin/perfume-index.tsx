"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AccordMark } from "@/components/AccordMark";
import { cn, faNum } from "@/lib/format";
import type { Accord } from "@/lib/types";

const VIEW_KEY = "aroma-admin-perfume-view";
const SORT_KEY = "aroma-admin-perfume-sort";

const VIEWS = [
  { id: "grid", label: "گرید" },
  { id: "simple", label: "ساده" },
  { id: "expanded", label: "گسترده" },
] as const;

const SORTS = [
  { id: "name", label: "نام" },
  { id: "brand", label: "برند" },
  { id: "price-desc", label: "گران‌تر" },
  { id: "price-asc", label: "ارزان‌تر" },
  { id: "issues", label: "موارد باز" },
] as const;

type View = (typeof VIEWS)[number]["id"];
type Sort = (typeof SORTS)[number]["id"];

export type PerfumeIssue = {
  label: string;
  part: string;
};

export type PerfumeRow = {
  slug: string;
  nameFa: string;
  nameEn: string;
  brand: string;
  price: number | null;
  priceLabel: string | null;
  issues: PerfumeIssue[];
  accords: Accord[];
};

export type PerfumeBrand = {
  slug: string;
  nameFa: string;
};

export function PerfumeIndex({ rows, brands, brand = "" }: { rows: PerfumeRow[]; brands: PerfumeBrand[]; brand?: string }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [view, setView] = useState<View>("grid");
  const [sort, setSort] = useState<Sort>("name");
  const [openOnly, setOpenOnly] = useState(false);
  const [stored, setStored] = useState(false);
  const [picked, setPicked] = useState(brand);
  const openCount = rows.filter((row) => row.issues.length > 0).length;
  const brandName = brands.find((item) => item.slug === picked)?.nameFa ?? "";

  useEffect(() => {
    const storedView = localStorage.getItem(VIEW_KEY);
    const storedSort = localStorage.getItem(SORT_KEY);
    if (storedView === "grid" || storedView === "simple" || storedView === "expanded") setView(storedView);
    if (SORTS.some((item) => item.id === storedSort)) setSort(storedSort as Sort);
    setStored(true);
  }, []);

  useEffect(() => {
    if (!stored) return;
    localStorage.setItem(VIEW_KEY, view);
    localStorage.setItem(SORT_KEY, sort);
  }, [stored, view, sort]);

  useEffect(() => {
    setPicked(brands.some((item) => item.slug === brand) ? brand : "");
  }, [brand, brands]);

  function chooseBrand(next: string) {
    setPicked(next);
    router.replace(next ? `/admin/perfumes?brand=${encodeURIComponent(next)}` : "/admin/perfumes", { scroll: false });
  }

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const filtered = rows.filter((row) => {
      if (brandName && row.brand !== brandName) return false;
      if (openOnly && row.issues.length === 0) return false;
      if (!needle) return true;
      return [row.nameFa, row.nameEn, row.brand, row.slug].some((value) => value.toLowerCase().includes(needle));
    });
    return [...filtered].sort((a, b) => compareRows(a, b, sort));
  }, [brandName, openOnly, query, rows, sort]);

  return (
    <div className="mt-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <label className="block min-w-0 flex-1">
          <span className="sr-only">جستجو در عطرها</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="نام، برند یا اسلاگ"
            className="min-h-12 w-full rounded-control border border-line bg-card px-3.5 text-body outline-none focus-visible:outline-2 focus-visible:outline-ink"
          />
        </label>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-control border border-line bg-card p-1" role="group" aria-label="مدل نمایش">
            {VIEWS.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-pressed={view === item.id}
                onClick={() => setView(item.id)}
                className={cn(
                  "min-h-11 rounded-control px-3 text-label focus-visible:outline-2 focus-visible:outline-ink",
                  view === item.id ? "bg-ink font-medium text-paper" : "text-muted",
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
          {openCount > 0 ? (
            <button
              type="button"
              aria-pressed={openOnly}
              onClick={() => setOpenOnly((value) => !value)}
              className={cn(
                "min-h-11 rounded-control px-3 text-label focus-visible:outline-2 focus-visible:outline-ink",
                openOnly ? "bg-ink font-medium text-paper" : "border border-line bg-card text-ink",
              )}
            >
              موارد باز
            </button>
          ) : null}
          <label className="min-w-0 flex-1 sm:flex-none">
            <span className="sr-only">برند</span>
            <select
              value={brandName ? picked : ""}
              onChange={(event) => chooseBrand(event.target.value)}
              className="min-h-12 w-full rounded-control border border-line bg-card px-3 text-label outline-none focus-visible:outline-2 focus-visible:outline-ink sm:w-40"
            >
              <option value="">همهٔ برندها</option>
              {brands.map((item) => (
                <option key={item.slug} value={item.slug}>
                  {item.nameFa}
                </option>
              ))}
            </select>
          </label>
          <label className="min-w-0 flex-1 sm:flex-none">
            <span className="sr-only">مرتب‌سازی</span>
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as Sort)}
              className="min-h-12 w-full rounded-control border border-line bg-card px-3 text-label outline-none focus-visible:outline-2 focus-visible:outline-ink sm:w-36"
            >
              {SORTS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {query.trim() || openOnly || brandName ? (
        <p className="mt-3 text-label text-muted">
          {faNum(visible.length)} از {faNum(rows.length)}
          {brandName ? ` · ${brandName}` : ""}
        </p>
      ) : null}

      {visible.length === 0 ? (
        <p className="mt-3 text-body text-muted">
          {brandName && !query.trim() && !openOnly
            ? `عطری از ${brandName} در این فهرست نیست.`
            : openOnly && !query.trim()
              ? "مورد بازی در این فهرست نیست."
              : "با این عبارت عطری نیست."}
        </p>
      ) : view === "simple" ? (
        <ul className="mt-3 divide-y divide-line overflow-hidden rounded-panel border border-line bg-card">
          {visible.map((row) => (
            <li key={row.slug}>
              <SimpleRow row={row} />
            </li>
          ))}
        </ul>
      ) : (
        <ul className={view === "grid" ? "mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-4" : "mt-3 grid gap-2 lg:grid-cols-2"}>
          {visible.map((row) => (
            <li key={row.slug} className="min-w-0">
              {view === "grid" ? <GridCard row={row} /> : <ExpandedCard row={row} />}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function GridCard({ row }: { row: PerfumeRow }) {
  return (
    <article className="flex h-full flex-col rounded-panel border border-line bg-card p-3">
      <Link href={`/admin/perfumes/${row.slug}`} className="group flex min-w-0 flex-1 flex-col">
        <AccordMark accords={row.accords} />
        <span className="mt-2 block truncate text-body font-medium group-hover:underline">{row.nameFa}</span>
        <span className="mt-0.5 block truncate text-label text-muted">{row.brand}</span>
        <span className="mt-2 block truncate text-label text-faint">{row.priceLabel ?? "بدون قیمت"}</span>
      </Link>
      <IssueChips slug={row.slug} issues={row.issues} className="mt-2" />
    </article>
  );
}

function ExpandedCard({ row }: { row: PerfumeRow }) {
  return (
    <article className="flex h-full flex-col rounded-panel border border-line bg-card px-3.5 py-3">
      <Link href={`/admin/perfumes/${row.slug}`} className="group min-w-0">
        <span className="block text-body font-medium group-hover:underline">{row.nameFa}</span>
        <span className="mt-0.5 block truncate text-label text-faint">{row.nameEn}</span>
        <span className="mt-0.5 block text-label text-muted">
          {row.brand}
          {row.priceLabel ? ` · ${row.priceLabel}` : " · بدون قیمت"}
        </span>
      </Link>
      <span className="mt-2.5 block">
        <AccordMark accords={row.accords} names />
      </span>
      <IssueChips slug={row.slug} issues={row.issues} className="mt-2.5" />
    </article>
  );
}

function SimpleRow({ row }: { row: PerfumeRow }) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-3.5 py-2.5">
      <Link
        href={`/admin/perfumes/${row.slug}`}
        className="group grid w-full grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-3 gap-y-0.5 sm:w-auto sm:grid-cols-[minmax(11rem,18rem)_8.5rem_10rem] sm:gap-x-6"
      >
        <span className="truncate text-body font-medium group-hover:underline">{row.nameFa}</span>
        <span className="text-label text-muted sm:hidden">{row.priceLabel ?? "بدون قیمت"}</span>
        <span className="col-span-2 truncate text-label text-muted sm:col-span-1">{row.brand}</span>
        <span className="hidden text-label text-muted sm:block">{row.priceLabel ?? "بدون قیمت"}</span>
      </Link>
      <IssueChips slug={row.slug} issues={row.issues} />
    </div>
  );
}

function IssueChips({ slug, issues, className }: { slug: string; issues: PerfumeIssue[]; className?: string }) {
  if (issues.length === 0) return null;
  return (
    <span className={cn("flex flex-wrap gap-1.5", className)}>
      {issues.map((issue) => (
        <Link
          key={`${issue.part}-${issue.label}`}
          href={issue.part === "shops" ? "/admin/shops" : `/admin/perfumes/${slug}#${issue.part}`}
          className="inline-flex min-h-9 items-center rounded-full bg-clay px-3 text-label text-ink hover:underline"
        >
          {issue.label}
        </Link>
      ))}
    </span>
  );
}

function compareRows(a: PerfumeRow, b: PerfumeRow, sort: Sort) {
  if (sort === "brand") {
    return a.brand.localeCompare(b.brand, "fa") || a.nameFa.localeCompare(b.nameFa, "fa");
  }
  if (sort === "price-desc" || sort === "price-asc") {
    const missing = sort === "price-desc" ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY;
    const delta = (a.price ?? missing) - (b.price ?? missing);
    return sort === "price-desc" ? -delta || a.nameFa.localeCompare(b.nameFa, "fa") : delta || a.nameFa.localeCompare(b.nameFa, "fa");
  }
  if (sort === "issues") {
    return b.issues.length - a.issues.length || a.nameFa.localeCompare(b.nameFa, "fa");
  }
  return a.nameFa.localeCompare(b.nameFa, "fa");
}
