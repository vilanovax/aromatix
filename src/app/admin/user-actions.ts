"use server";

import { revalidatePath } from "next/cache";
import { requireSection } from "@/lib/auth/admin";
import { parseAccess } from "@/lib/auth/sections";
import { db } from "@/prisma/db";

type Result = { ok: true } | { ok: false; error: string };
type Role = "admin" | "member";

function denied(): Result {
  return { ok: false, error: "به مدیریت دسترسی نداری." };
}

function refresh() {
  revalidatePath("/admin/users");
  revalidatePath("/admin/settings");
  revalidatePath("/admin");
}

export async function setUserRole(userId: number, role: Role): Promise<Result> {
  const admin = await requireSection("settings");
  if (!admin) return { ok: false, error: "به تغییر نقش دسترسی نداری." };
  if (role !== "admin" && role !== "member") return { ok: false, error: "نقش نامعتبر است." };
  if (userId === admin.id) return { ok: false, error: "نقش خودت را از اینجا عوض نمی‌کنی." };

  try {
    const target = await db.orm.aroma.User.where((row) => row.id.eq(userId)).select("id", "role", "access").first();
    if (!target) return { ok: false, error: "این حساب پیدا نشد." };
    if (target.role === role) {
      refresh();
      return { ok: true };
    }
    if (target.role === "admin" && role === "member") {
      const admins = await db.orm.aroma.User.where((row) => row.role.eq("admin")).select("id", "access").all();
      if (admins.length <= 1) return { ok: false, error: "آخرین مدیر را نمی‌شود عضو کرد." };
      const holders = admins.filter((row) => parseAccess(row.access).includes("settings"));
      if (parseAccess(target.access).includes("settings") && holders.length <= 1) {
        return { ok: false, error: "آخرین کسی که تنظیمات را دارد را نمی‌شود عضو کرد." };
      }
    }
    await db.orm.aroma.User.where((row) => row.id.eq(userId)).update({
      role,
      access: role === "admin" ? "*" : target.access,
    });
    refresh();
    return { ok: true };
  } catch (error) {
    console.error(error);
    return { ok: false, error: "نقش ذخیره نشد. کمی بعد دوباره امتحان کن." };
  }
}

export async function revokeUserSessions(userId: number): Promise<Result> {
  const admin = await requireSection("users");
  if (!admin) return denied();
  if (userId === admin.id) return { ok: false, error: "نشست خودت را با خروج می‌بندی." };

  try {
    const target = await db.orm.aroma.User.where((row) => row.id.eq(userId)).select("id").first();
    if (!target) return { ok: false, error: "این حساب پیدا نشد." };
    await db.orm.aroma.Session.where((row) => row.userId.eq(userId)).delete();
    refresh();
    return { ok: true };
  } catch (error) {
    console.error(error);
    return { ok: false, error: "نشست‌ها بسته نشد. کمی بعد دوباره امتحان کن." };
  }
}
