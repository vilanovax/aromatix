"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { revokeUserSessions, setUserActive, setUserRole, updateUserName } from "@/app/admin/user-actions";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { SearchInput } from "@/components/ui/search-input";
import { Switch } from "@/components/ui/switch";
import { cn, faNum } from "@/lib/format";

export type ManagedUser = {
  id: number;
  name: string;
  phone: string;
  role: "admin" | "member";
  active: boolean;
  joined: string;
  joinedAt: number;
  sessions: number;
  self: boolean;
};

type SortId = "date" | "name";
type Direction = "asc" | "desc";

export function UserIndex({ rows, canGrant }: { rows: ManagedUser[]; canGrant: boolean }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortId>("date");
  const [direction, setDirection] = useState<Direction>("desc");
  const [pendingId, setPendingId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const filtered = needle
      ? rows.filter((row) =>
          [row.name, row.phone, row.role === "admin" ? "مدیر" : "عضو", row.active ? "فعال" : "غیرفعال"].some((value) =>
            value.toLowerCase().includes(needle),
          ),
        )
      : rows;
    return [...filtered].sort((a, b) => compareUsers(a, b, sort, direction));
  }, [direction, query, rows, sort]);

  function chooseSort(next: SortId) {
    if (next === sort) {
      setDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }
    setSort(next);
    setDirection(next === "name" ? "asc" : "desc");
  }

  async function run(id: number, task: () => Promise<{ ok: true } | { ok: false; error: string }>) {
    setPendingId(id);
    setError(null);
    const result = await task();
    setPendingId(null);
    if (!result.ok) {
      setError(result.error);
      return false;
    }
    router.refresh();
    return true;
  }

  return (
    <div className="mt-5">
      <SearchInput value={query} onChange={setQuery} placeholder="نام، شماره یا نقش" aria-label="جستجو در کاربران" />
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Button type="button" size="sm" variant={sort === "date" ? "default" : "outline"} onClick={() => chooseSort("date")}>
          تاریخ
        </Button>
        <Button type="button" size="sm" variant={sort === "name" ? "default" : "outline"} onClick={() => chooseSort("name")}>
          حروف
        </Button>
        <p className="text-sm text-muted-foreground">{sortHint(sort, direction)}</p>
      </div>
      {error ? (
        <Alert variant="destructive" className="mt-3">
          {error}
        </Alert>
      ) : null}
      {visible.length === 0 ? (
        <EmptyState className="mt-4" title={query.trim() ? "با این عبارت حسابی نیست" : "حسابی نیست"} />
      ) : (
        <ul className="mt-3 divide-y divide-border overflow-hidden rounded-surface border border-border bg-card">
          {visible.map((row) => {
            const busy = pendingId === row.id;
            const editing = editingId === row.id;
            return (
              <li key={row.id} className="px-3.5 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    {editing ? (
                      <Input value={draft} onChange={(event) => setDraft(event.target.value)} aria-label="نام" />
                    ) : (
                      <p className={cn("truncate text-body font-medium", row.active ? "text-foreground" : "text-muted-foreground")}>{row.name}</p>
                    )}
                    <p className="mt-0.5 text-label text-muted-foreground">
                      <bdi dir="ltr">{row.phone}</bdi>
                      <span> · {row.joined}</span>
                      <span> · {row.sessions > 0 ? `${faNum(row.sessions)} نشست باز` : "نشست باز ندارد"}</span>
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Badge variant={row.self ? "outline" : row.role === "admin" ? "brand" : "secondary"}>
                      {row.self ? "خودت" : row.role === "admin" ? "مدیر" : "عضو"}
                    </Badge>
                    {row.self ? null : (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{busy ? "…" : row.active ? "فعال" : "غیرفعال"}</span>
                        <Switch
                          checked={row.active}
                          disabled={busy}
                          aria-label={row.active ? "فعال" : "غیرفعال"}
                          onCheckedChange={(next) => {
                            if (next === row.active) return;
                            if (!next && !window.confirm(`«${row.name}» غیرفعال شود؟ دیگر وارد نمی‌شود و نشست‌هایش بسته می‌شود.`)) return;
                            void run(row.id, () => setUserActive(row.id, next));
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {editing ? (
                    <>
                      <Button
                        type="button"
                        size="sm"
                        disabled={busy || draft.trim() === row.name}
                        onClick={() => {
                          void run(row.id, () => updateUserName(row.id, draft)).then((ok) => {
                            if (ok) setEditingId(null);
                          });
                        }}
                      >
                        ذخیره
                      </Button>
                      <Button type="button" variant="outline" size="sm" disabled={busy} onClick={() => setEditingId(null)}>
                        انصراف
                      </Button>
                    </>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={busy}
                      onClick={() => {
                        setEditingId(row.id);
                        setDraft(row.name);
                        setError(null);
                      }}
                    >
                      ویرایش
                    </Button>
                  )}
                  {row.self || !canGrant ? null : (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={busy || editing}
                      onClick={() => {
                        const next = row.role === "admin" ? "member" : "admin";
                        const ask = next === "member" ? `«${row.name}» دیگر مدیر نباشد؟` : `«${row.name}» مدیر کامل شود؟`;
                        if (!window.confirm(ask)) return;
                        void run(row.id, () => setUserRole(row.id, next));
                      }}
                    >
                      {row.role === "admin" ? "عضو کن" : "مدیر کن"}
                    </Button>
                  )}
                  {row.self || row.sessions === 0 ? null : (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={busy || editing}
                      onClick={() => {
                        if (!window.confirm(`نشست‌های «${row.name}» بسته شود؟`)) return;
                        void run(row.id, () => revokeUserSessions(row.id));
                      }}
                    >
                      بستن نشست‌ها
                    </Button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function compareUsers(a: ManagedUser, b: ManagedUser, sort: SortId, direction: Direction) {
  const factor = direction === "asc" ? 1 : -1;
  if (sort === "name") {
    const byName = a.name.localeCompare(b.name, "fa");
    if (byName !== 0) return byName * factor;
    return b.joinedAt - a.joinedAt;
  }
  const byDate = a.joinedAt - b.joinedAt;
  if (byDate !== 0) return byDate * factor;
  return a.name.localeCompare(b.name, "fa");
}

function sortHint(sort: SortId, direction: Direction) {
  if (sort === "name") return direction === "asc" ? "از الف" : "از ی";
  return direction === "desc" ? "جدیدتر بالا" : "قدیمی‌تر بالا";
}
