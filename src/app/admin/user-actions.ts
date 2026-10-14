"use server";

import { revalidatePath } from "next/cache";
import { requireSection } from "@/lib/auth/admin";
import { cleanName } from "@/lib/auth/credentials";
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
    const target = await db.orm.aroma.User.where((row) => row.id.eq(userId)).select("id", "role", "access", "active").first();
    if (!target) return { ok: false, error: "این حساب پیدا نشد." };
    if (target.role === role) {
      refresh();
      return { ok: true };
    }
    if (target.role === "admin" && role === "member") {
      const admins = await db.orm.aroma.User.where((row) => row.role.eq("admin")).select("id", "access", "active").all();
      const living = admins.filter((row) => row.active);
      if (target.active && living.length <= 1) return { ok: false, error: "آخرین مدیر را نمی‌شود عضو کرد." };
      const holders = living.filter((row) => parseAccess(row.access).includes("settings"));
      if (target.active && parseAccess(target.access).includes("settings") && holders.length <= 1) {
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

export async function updateUserName(userId: number, name: string): Promise<Result> {
  const admin = await requireSection("users");
  if (!admin) return denied();
  const next = cleanName(name);
  if (!next) return { ok: false, error: "اسم را بنویس؛ بین ۲ تا ۴۰ حرف." };

  try {
    const target = await db.orm.aroma.User.where((row) => row.id.eq(userId)).select("id", "name").first();
    if (!target) return { ok: false, error: "این حساب پیدا نشد." };
    if (target.name !== next) {
      await db.orm.aroma.User.where((row) => row.id.eq(userId)).update({ name: next });
    }
    refresh();
    return { ok: true };
  } catch (error) {
    console.error(error);
    return { ok: false, error: "نام ذخیره نشد. کمی بعد دوباره امتحان کن." };
  }
}

export async function setUserActive(userId: number, active: boolean): Promise<Result> {
  const admin = await requireSection("users");
  if (!admin) return denied();
  if (typeof active !== "boolean") return { ok: false, error: "وضعیت نامعتبر است." };
  if (userId === admin.id) return { ok: false, error: "حساب خودت را از اینجا غیرفعال نمی‌کنی." };

  try {
    const target = await db.orm.aroma.User.where((row) => row.id.eq(userId)).select("id", "role", "access", "active").first();
    if (!target) return { ok: false, error: "این حساب پیدا نشد." };
    if (target.active === active) {
      refresh();
      return { ok: true };
    }
    if (!active && target.role === "admin") {
      const blocked = await lastAdminBlock(target);
      if (blocked) return blocked;
    }
    await db.orm.aroma.User.where((row) => row.id.eq(userId)).update({ active });
    if (!active) await db.orm.aroma.Session.where((row) => row.userId.eq(userId)).delete();
    refresh();
    return { ok: true };
  } catch (error) {
    console.error(error);
    return { ok: false, error: "وضعیت ذخیره نشد. کمی بعد دوباره امتحان کن." };
  }
}

async function lastAdminBlock(target: { id: number; access: string }): Promise<Result | null> {
  const admins = await db.orm.aroma.User.where((row) => row.role.eq("admin")).select("id", "access", "active").all();
  const living = admins.filter((row) => row.active);
  if (living.length <= 1) return { ok: false, error: "آخرین مدیر فعال را نمی‌شود غیرفعال کرد." };
  const holders = living.filter((row) => parseAccess(row.access).includes("settings"));
  if (parseAccess(target.access).includes("settings") && holders.length <= 1) {
    return { ok: false, error: "آخرین کسی که تنظیمات را دارد را نمی‌شود غیرفعال کرد." };
  }
  return null;
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
