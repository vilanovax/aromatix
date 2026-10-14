"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { setShopActive } from "@/app/admin/actions";
import { cn, faNum } from "@/lib/format";

export type ShopRow = {
  slug: string;
  nameFa: string;
  nameEn: string;
  city: string;
  website: string;
  active: boolean;
  offerCount: number;
};

export function ShopIndex({ rows }: { rows: ShopRow[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const filtered = needle
      ? rows.filter((row) => [row.nameFa, row.nameEn, row.slug, row.city].some((value) => value.toLowerCase().includes(needle)))
      : rows;
    return [...filtered].sort((a, b) => a.nameFa.localeCompare(b.nameFa, "fa"));
  }, [query, rows]);

  async function toggle(row: ShopRow) {
    const next = !row.active;
    if (!next && !window.confirm("این فروشگاه از قیمت‌های عمومی کنار می‌رود. قیمت‌هایش در مدیریت می‌مانند.")) return;
    setPending(row.slug);
    setError(null);
    const result = await setShopActive({ slug: row.slug, active: next });
    setPending(null);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <div className="mt-5">
      <label className="block">
        <span className="sr-only">جستجو در فروشگاه‌ها</span>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="نام یا شهر"
          className="h-11 w-full rounded-field border border-input bg-field shadow-field px-3.5 text-body outline-none focus-visible:outline-2 focus-visible:outline-ring"
        />
      </label>
      {error ? (
        <p role="alert" className="mt-3 text-label text-destructive">
          {error}
        </p>
      ) : null}
      {visible.length === 0 ? (
        <p className="mt-4 text-body text-muted-foreground">با این عبارت فروشگاهی نیست.</p>
      ) : (
        <ul className="mt-3 grid gap-2">
          {visible.map((row) => (
            <li key={row.slug} className="flex items-stretch gap-2 rounded-surface border border-border bg-card">
              <Link href={`/admin/shops/${row.slug}`} className="min-w-0 flex-1 px-3.5 py-3 hover:bg-accent">
                <span className="flex min-w-0 items-baseline gap-2">
                  <span className="truncate text-body font-medium">{row.nameFa}</span>
                  <span className="truncate text-label text-muted-foreground">{row.nameEn}</span>
                </span>
                <span className="mt-1 block text-label text-muted-foreground">
                  {faNum(row.offerCount)} قیمت
                  {row.city ? ` · ${row.city}` : ""}
                </span>
                {row.website ? (
                  <span dir="ltr" className="mt-1 block truncate text-start text-label text-muted-foreground">
                    {row.website.replace(/^https:\/\//, "")}
                  </span>
                ) : (
                  <span className="mt-1 block text-label text-muted-foreground">وب‌سایتی نوشته نشده</span>
                )}
              </Link>
              <div className="flex items-center pe-3">
                <button
                  type="button"
                  aria-pressed={row.active}
                  disabled={pending === row.slug}
                  onClick={() => toggle(row)}
                  className={cn(
                    "min-h-11 rounded-full px-3 text-label",
                    row.active ? "bg-primary font-medium text-primary-foreground" : "border border-border text-muted-foreground",
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
