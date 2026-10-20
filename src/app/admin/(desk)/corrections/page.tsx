import type { Metadata } from "next";
import Link from "next/link";
import { CorrectionDesk, type CorrectionRow } from "@/app/admin/correction-desk";
import { formatCheckedOn } from "@/lib/admin/health";
import { guardSection } from "@/lib/auth/admin";
import { faNum } from "@/lib/format";
import { reportStatusLabel, type ReportStatusId } from "@/lib/reports";
import { db } from "@/prisma/db";

export const metadata: Metadata = { title: "گزارش‌های عطر · مدیریت آروما" };

const FILTERS: Array<{ id: ReportStatusId | "all"; label: string }> = [
  { id: "open", label: "باز" },
  { id: "fixed", label: "اصلاح‌شده" },
  { id: "dismissed", label: "ردشده" },
  { id: "all", label: "همه" },
];

export default async function CorrectionsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await guardSection("corrections");
  const params = await searchParams;
  const status = params.status === "fixed" || params.status === "dismissed" || params.status === "all" ? params.status : "open";
  const rows = await loadReports(status);

  return (
    <div>
      <h1 className="text-headline font-bold">گزارش‌های عطر</h1>
      <p className="mt-2 text-body text-muted-foreground">
        {status === "all" ? `${faNum(rows.length)} گزارش` : `${faNum(rows.length)} گزارش ${reportStatusLabel(status)}`}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {FILTERS.map((filter) => (
          <Link
            key={filter.id}
            href={filter.id === "open" ? "/admin/corrections" : `/admin/corrections?status=${filter.id}`}
            aria-current={status === filter.id ? "page" : undefined}
            className="inline-flex min-h-11 items-center rounded-control border border-border px-3 text-body font-medium aria-[current=page]:bg-secondary"
          >
            {filter.label}
          </Link>
        ))}
      </div>
      <CorrectionDesk rows={rows} />
    </div>
  );
}

async function loadReports(status: ReportStatusId | "all"): Promise<CorrectionRow[]> {
  const query = db.orm.aroma.CatalogReport.orderBy((row) => row.createdAt.desc());
  const reports = await (status === "all" ? query : query.where((row) => row.status.eq(status))).all();
  const slugs = [...new Set(reports.map((report) => report.perfumeSlug))];
  const userIds = [...new Set(reports.map((report) => report.userId).filter((id): id is number => id != null))];
  const [perfumes, users] = await Promise.all([
    slugs.length === 0
      ? []
      : db.orm.aroma.CatalogPerfume.where((row) => row.slug.in(slugs)).select("slug", "nameFa").all(),
    userIds.length === 0 ? [] : db.orm.aroma.User.where((row) => row.id.in(userIds)).select("id", "name").all(),
  ]);
  const names = new Map(perfumes.map((perfume) => [perfume.slug, perfume.nameFa]));
  const reporters = new Map(users.map((user) => [user.id, user.name]));

  return reports.map((report) => ({
    id: report.id,
    perfumeSlug: report.perfumeSlug,
    perfumeName: names.get(report.perfumeSlug) ?? report.perfumeSlug,
    topic: report.topic,
    body: report.body,
    status: report.status,
    reporter: report.userId == null ? "مهمان" : (reporters.get(report.userId) ?? "کاربر"),
    createdLabel: formatWhen(report.createdAt),
    adminNote: report.adminNote,
  }));
}

function formatWhen(value: string) {
  const time = Date.parse(value);
  if (Number.isNaN(time)) return "تاریخ نامشخص";
  return formatCheckedOn(new Date(time));
}
