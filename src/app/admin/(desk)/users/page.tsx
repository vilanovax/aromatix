import type { Metadata } from "next";
import { UserIndex, type ManagedUser } from "@/app/admin/user-index";
import { formatCheckedOn } from "@/lib/admin/health";
import { guardSection } from "@/lib/auth/admin";
import { displayPhone } from "@/lib/auth/phone";
import { faNum } from "@/lib/format";
import { db } from "@/prisma/db";

export const metadata: Metadata = { title: "کاربران · مدیریت آروما" };

export default async function UsersPage() {
  const admin = await guardSection("users");
  const rows = await loadUsers(admin.id);
  const admins = rows.filter((row) => row.role === "admin").length;
  const inactive = rows.filter((row) => !row.active).length;

  return (
    <div>
      <h1 className="text-headline font-bold">کاربران</h1>
      <p className="mt-2 text-body text-muted">
        {faNum(rows.length)} حساب، {faNum(admins)} مدیر
        {inactive > 0 ? `، ${faNum(inactive)} غیرفعال` : ""}
      </p>
      <UserIndex rows={rows} canGrant={admin.sections.includes("settings")} />
    </div>
  );
}

async function loadUsers(selfId: number): Promise<ManagedUser[]> {
  const now = new Date().toISOString();
  const [users, sessions] = await Promise.all([
    db.orm.aroma.User.select("id", "name", "phone", "role", "active", "createdAt").all(),
    db.orm.aroma.Session.where((row) => row.expiresAt.gt(now)).select("userId").all(),
  ]);
  const open = new Map<number, number>();
  for (const session of sessions) open.set(session.userId, (open.get(session.userId) ?? 0) + 1);

  return users
    .map((user) => ({
      id: user.id,
      name: user.name,
      phone: displayPhone(user.phone),
      role: user.role,
      active: user.active,
      joined: formatJoined(user.createdAt),
      joinedAt: joinedTime(user.createdAt),
      sessions: open.get(user.id) ?? 0,
      self: user.id === selfId,
    }))
    .sort((a, b) => Number(b.self) - Number(a.self) || b.id - a.id);
}

function formatJoined(value: string) {
  const time = joinedTime(value);
  if (time === 0) return "تاریخ نامشخص";
  return formatCheckedOn(new Date(time));
}

function joinedTime(value: string) {
  const time = Date.parse(value);
  return Number.isNaN(time) ? 0 : time;
}
