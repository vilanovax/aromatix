"use client";

import { useState } from "react";
import Link from "next/link";
import { resolveReport } from "@/app/admin/report-actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { reportStatusLabel, reportTopicLabel } from "@/lib/reports";

export type CorrectionRow = {
  id: number;
  perfumeSlug: string;
  perfumeName: string;
  topic: string;
  body: string;
  status: string;
  reporter: string;
  createdLabel: string;
  adminNote: string;
};

export function CorrectionDesk({ rows }: { rows: CorrectionRow[] }) {
  if (rows.length === 0) {
    return <p className="mt-6 text-body text-muted-foreground">گزارشی در این فهرست نیست.</p>;
  }

  return (
    <ul className="mt-6 flex flex-col gap-3">
      {rows.map((row) => (
        <li key={row.id}>
          <CorrectionCard row={row} />
        </li>
      ))}
    </ul>
  );
}

function CorrectionCard({ row }: { row: CorrectionRow }) {
  const [note, setNote] = useState(row.adminNote);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function apply(status: "open" | "fixed" | "dismissed") {
    setPending(true);
    setError(null);
    const result = await resolveReport(row.id, status, note);
    if (!result.ok) setError(result.error);
    setPending(false);
  }

  return (
    <article className="rounded-overlay border border-border bg-card p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-title font-semibold">
          <Link href={`/perfume/${row.perfumeSlug}`} className="underline-offset-4 hover:underline">
            {row.perfumeName}
          </Link>
        </h2>
        <p className="text-label text-muted-foreground">
          {reportTopicLabel(row.topic)} · {reportStatusLabel(row.status)} · {row.createdLabel}
        </p>
      </div>
      <p className="mt-2 text-pretty text-body">{row.body}</p>
      <p className="mt-2 text-label text-muted-foreground">از {row.reporter}</p>
      <label className="mt-3 block">
        <span className="text-label text-muted-foreground">یادداشت رسیدگی</span>
        <Textarea value={note} maxLength={400} onChange={(event) => setNote(event.target.value)} className="mt-1.5" />
      </label>
      {error ? (
        <p role="alert" className="mt-2 text-label text-destructive">
          {error}
        </p>
      ) : null}
      <div className="mt-3 flex flex-wrap gap-2">
        <Button type="button" className="min-h-11" disabled={pending} onClick={() => void apply("fixed")}>
          اصلاح شد
        </Button>
        <Button type="button" variant="outline" className="min-h-11" disabled={pending} onClick={() => void apply("dismissed")}>
          رد شد
        </Button>
        {row.status !== "open" ? (
          <Button type="button" variant="ghost" className="min-h-11" disabled={pending} onClick={() => void apply("open")}>
            باز کردن دوباره
          </Button>
        ) : null}
      </div>
    </article>
  );
}
