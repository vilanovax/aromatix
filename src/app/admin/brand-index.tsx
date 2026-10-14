"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { setBrandActive } from "@/app/admin/actions";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { SearchInput } from "@/components/ui/search-input";
import { Switch } from "@/components/ui/switch";
import { faNum } from "@/lib/format";

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
      <SearchInput value={query} onChange={setQuery} placeholder="نام یا توضیح" aria-label="جستجو در برندها" />
      {error ? (
        <Alert variant="destructive" className="mt-3">
          {error}
        </Alert>
      ) : null}
      {visible.length === 0 ? (
        <EmptyState className="mt-4" title="با این عبارت برندی نیست" />
      ) : (
        <ul className="mt-3 grid gap-2">
          {visible.map((row) => (
            <li key={row.slug} className="flex items-stretch gap-2 rounded-surface border border-border bg-card">
              <Link href={`/admin/brands/${row.slug}`} className="min-w-0 flex-1 px-3.5 py-3 hover:bg-accent">
                <span className="flex min-w-0 items-baseline gap-2">
                  <span className="truncate text-body font-medium">{row.nameFa}</span>
                  <span className="truncate text-label text-muted-foreground">{row.nameEn}</span>
                </span>
                <span className="mt-1 block text-label text-muted-foreground">{faNum(row.perfumeCount)} عطر</span>
                <span className="mt-1 line-clamp-2 block text-label text-muted-foreground">{row.description || "توضیحی نوشته نشده"}</span>
              </Link>
              <div className="flex shrink-0 flex-col items-stretch justify-center gap-2 pe-3">
                <Button href={`/admin/perfumes?brand=${encodeURIComponent(row.slug)}`} variant="outline" size="sm">
                  لیست عطرها
                </Button>
                <div className="flex items-center justify-end gap-2 text-xs text-muted-foreground">
                  <span>{pending === row.slug ? "…" : row.active ? "فعال" : "غیرفعال"}</span>
                  <Switch
                    checked={row.active}
                    disabled={pending === row.slug}
                    aria-label={row.active ? "فعال" : "غیرفعال"}
                    onCheckedChange={(next) => {
                      if (next === row.active) return;
                      void toggle(row);
                    }}
                  />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
