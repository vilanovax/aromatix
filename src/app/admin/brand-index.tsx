"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { setBrandActive } from "@/app/admin/actions";
import { cn, faNum } from "@/lib/format";

export type BrandRow = {
  slug: string;
  nameFa: string;
  nameEn: string;
  description: string;
  active: boolean;
  perfumeCount: number;
};

export function BrandIndex({ rows }: { rows: BrandRow[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const filtered = needle
      ? rows.filter((row) =>
          [row.nameFa, row.nameEn, row.slug, row.description].some((value) => value.toLowerCase().includes(needle)),
        )
      : rows;
    return [...filtered].sort((a, b) => a.nameFa.localeCompare(b.nameFa, "fa"));
  }, [query, rows]);

  async function toggle(row: BrandRow) {
    const next = !row.active;
    if (!next && !window.confirm("این برند از فهرست عمومی پنهان می‌شود. عطرهایش در مدیریت می‌مانند.")) return;
    setPending(row.slug);
    setError(null);
    const result = await setBrandActive({ slug: row.slug, active: next });
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
        <span className="sr-only">جستجو در برندها</span>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="نام یا توضیح"
          className="min-h-12 w-full rounded-control border border-line bg-card px-3.5 text-body outline-none focus-visible:outline-2 focus-visible:outline-ink"
        />
      </label>
      {error ? (
        <p role="alert" className="mt-3 text-label text-danger">
          {error}
        </p>
      ) : null}
      {visible.length === 0 ? (
        <p className="mt-4 text-body text-muted">با این عبارت برندی نیست.</p>
      ) : (
        <ul className="mt-3 grid gap-2">
          {visible.map((row) => (
            <li key={row.slug} className="flex items-stretch gap-2 rounded-panel border border-line bg-card">
              <Link href={`/admin/brands/${row.slug}`} className="min-w-0 flex-1 px-3.5 py-3 hover:bg-press">
                <span className="flex min-w-0 items-baseline gap-2">
                  <span className="truncate text-body font-medium">{row.nameFa}</span>
                  <span className="truncate text-label text-faint">{row.nameEn}</span>
                </span>
                <span className="mt-1 block text-label text-muted">{faNum(row.perfumeCount)} عطر</span>
                <span className={cn("mt-1 line-clamp-2 block text-label", row.description ? "text-muted" : "text-faint")}>
                  {row.description || "توضیحی نوشته نشده"}
                </span>
              </Link>
              <div className="flex shrink-0 flex-col items-stretch justify-center gap-2 pe-3">
                <Link
                  href={`/admin/perfumes?brand=${encodeURIComponent(row.slug)}`}
                  className="inline-flex min-h-10 items-center justify-center rounded-full border border-line px-3 text-label"
                >
                  لیست عطرها
                </Link>
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
