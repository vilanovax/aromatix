"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { revokeUserSessions, setUserRole } from "@/app/admin/user-actions";
import { Button } from "@/components/Button";
import { faNum } from "@/lib/format";

export type ManagedUser = {
  id: number;
  name: string;
  phone: string;
  role: "admin" | "member";
  joined: string;
  sessions: number;
  self: boolean;
};

export function UserIndex({ rows, canGrant }: { rows: ManagedUser[]; canGrant: boolean }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [pendingId, setPendingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter((row) =>
      [row.name, row.phone, row.role === "admin" ? "مدیر" : "عضو"].some((value) => value.toLowerCase().includes(needle)),
    );
  }, [query, rows]);

  async function run(id: number, task: () => Promise<{ ok: true } | { ok: false; error: string }>) {
    setPendingId(id);
    setError(null);
    const result = await task();
    setPendingId(null);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <div className="mt-5">
      <label className="block">
        <span className="sr-only">جستجو در کاربران</span>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="نام، شماره یا نقش"
          className="min-h-12 w-full rounded-control border border-line bg-card px-3.5 text-body outline-none focus-visible:outline-2 focus-visible:outline-ink"
        />
      </label>
      {error ? (
        <p role="alert" className="mt-3 text-label text-danger">
          {error}
        </p>
      ) : null}
      {visible.length === 0 ? (
        <p className="mt-4 text-body text-muted">با این عبارت حسابی نیست.</p>
      ) : (
        <ul className="mt-3 grid gap-2 lg:grid-cols-2">
          {visible.map((row) => {
            const busy = pendingId === row.id;
            return (
              <li key={row.id} className="rounded-panel border border-line bg-card px-3.5 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-body font-medium">{row.name}</p>
                    <p className="mt-0.5 text-label text-muted">
                      <bdi dir="ltr">{row.phone}</bdi>
                      <span> · {row.joined}</span>
                    </p>
                  </div>
                  <span
                    className={
                      row.role === "admin"
                        ? "shrink-0 rounded-full bg-ink px-2.5 py-1 text-label text-paper"
                        : "shrink-0 rounded-full border border-line px-2.5 py-1 text-label text-muted"
                    }
                  >
                    {row.self ? "خودت" : row.role === "admin" ? "مدیر" : "عضو"}
                  </span>
                </div>
                <p className="mt-2 text-label text-faint">
                  {row.sessions > 0 ? `${faNum(row.sessions)} نشست باز` : "نشست باز ندارد"}
                </p>
                {row.self ? null : (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {canGrant ? (
                    <Button
                      type="button"
                      variant="edge"
                      size="sm"
                      disabled={busy}
                      onClick={() => {
                        const next = row.role === "admin" ? "member" : "admin";
                        const ask =
                          next === "member"
                            ? `«${row.name}» دیگر مدیر نباشد؟`
                            : `«${row.name}» مدیر کامل شود؟`;
                        if (!window.confirm(ask)) return;
                        void run(row.id, () => setUserRole(row.id, next));
                      }}
                    >
                      {row.role === "admin" ? "عضو کن" : "مدیر کن"}
                    </Button>
                    ) : null}
                    {row.sessions > 0 ? (
                      <Button
                        type="button"
                        variant="edge"
                        size="sm"
                        disabled={busy}
                        onClick={() => {
                          if (!window.confirm(`نشست‌های «${row.name}» بسته شود؟`)) return;
                          void run(row.id, () => revokeUserSessions(row.id));
                        }}
                      >
                        بستن نشست‌ها
                      </Button>
                    ) : null}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
