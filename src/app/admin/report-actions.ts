"use server";

import { revalidatePath } from "next/cache";
import { requireSection } from "@/lib/auth/admin";
import { isReportStatus, type ReportStatusId } from "@/lib/reports";
import { db } from "@/prisma/db";

type Result = { ok: true } | { ok: false; error: string };

export async function resolveReport(id: number, status: string, adminNote: string): Promise<Result> {
  const admin = await requireSection("corrections");
  if (!admin) return { ok: false, error: "به گزارش‌ها دسترسی نداری." };
  if (!Number.isInteger(id) || id <= 0) return { ok: false, error: "گزارش پیدا نشد." };
  if (status !== "open" && status !== "fixed" && status !== "dismissed") {
    return { ok: false, error: "وضعیت گزارش درست نیست." };
  }
  const note = adminNote.trim().slice(0, 400);
  const next = status as ReportStatusId;
  if (!isReportStatus(next)) return { ok: false, error: "وضعیت گزارش درست نیست." };

  const row = await db.orm.aroma.CatalogReport.where((item) => item.id.eq(id)).select("id").first();
  if (!row) return { ok: false, error: "گزارش پیدا نشد." };

  await db.orm.aroma.CatalogReport.where((item) => item.id.eq(id)).update({
    status: next,
    adminNote: note,
    resolvedAt: next === "open" ? null : new Date().toISOString(),
  });
  revalidatePath("/admin/corrections");
  return { ok: true };
}
