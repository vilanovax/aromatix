import "server-only";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth/current";
import { firstSectionHref, parseAccess, type AdminSection } from "@/lib/auth/sections";
import { db } from "@/prisma/db";

export type AdminIdentity = {
  id: number;
  name: string;
  sections: AdminSection[];
};

export async function requireAdmin(): Promise<AdminIdentity | null> {
  const user = await currentUser();
  if (!user) return null;
  const row = await db.orm.aroma.User.where((item) => item.id.eq(user.id)).select("id", "name", "role", "access").first();
  if (!row || row.role !== "admin") return null;
  return { id: row.id, name: row.name, sections: parseAccess(row.access) };
}

export async function requireSection(section: AdminSection) {
  const admin = await requireAdmin();
  if (!admin || !admin.sections.includes(section)) return null;
  return admin;
}

export async function guardSection(section: AdminSection) {
  const admin = await requireAdmin();
  if (!admin) redirect("/admin/login");
  if (!admin.sections.includes(section)) {
    const next = firstSectionHref(admin.sections);
    redirect(next ?? "/admin/login");
  }
  return admin;
}
