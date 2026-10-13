"use server";

import { revalidatePath } from "next/cache";
import { cleanName, cleanPassword } from "@/lib/auth/credentials";
import { isUniqueViolation } from "@/lib/auth/current";
import { requireSection } from "@/lib/auth/admin";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { normalizePhone } from "@/lib/auth/phone";
import { hashSessionToken, readSessionToken } from "@/lib/auth/session";
import { encodeAccess, isAdminSection, parseAccess } from "@/lib/auth/sections";
import { db } from "@/prisma/db";

type Result = { ok: true } | { ok: false; error: string };

function denied(): Result {
  return { ok: false, error: "به تنظیمات دسترسی نداری." };
}

function refresh() {
  revalidatePath("/admin/settings");
  revalidatePath("/admin/users");
  revalidatePath("/admin", "layout");
}

export async function changeAdminPassword(input: { current?: unknown; next?: unknown }): Promise<Result> {
  const admin = await requireSection("settings");
  if (!admin) return denied();
  if (typeof input.current !== "string" || input.current.length === 0) {
    return { ok: false, error: "رمز فعلی را بنویس." };
  }
  const next = cleanPassword(input.next);
  if (!next) return { ok: false, error: "رمز جدید حداقل ۸ حرف باشد." };
  if (next === input.current) return { ok: false, error: "رمز جدید با رمز فعلی یکی است." };

  try {
    const row = await db.orm.aroma.User.where((item) => item.id.eq(admin.id)).select("passwordHash").first();
    if (!row) return denied();
    const matches = await verifyPassword(input.current, row.passwordHash);
    if (!matches) return { ok: false, error: "رمز فعلی درست نیست." };
    await db.orm.aroma.User.where((item) => item.id.eq(admin.id)).update({
      passwordHash: await hashPassword(next),
    });
    const token = await readSessionToken();
    const keep = token ? hashSessionToken(token) : "";
    const sessions = await db.orm.aroma.Session.where((item) => item.userId.eq(admin.id)).select("id", "tokenHash").all();
    for (const session of sessions) {
      if (session.tokenHash === keep) continue;
      await db.orm.aroma.Session.where((item) => item.id.eq(session.id)).delete();
    }
    refresh();
    return { ok: true };
  } catch (error) {
    console.error(error);
    return { ok: false, error: "رمز عوض نشد. کمی بعد دوباره امتحان کن." };
  }
}

export async function createAdmin(input: {
  name?: unknown;
  phone?: unknown;
  password?: unknown;
  sections?: unknown;
}): Promise<Result> {
  const admin = await requireSection("settings");
  if (!admin) return denied();
  const name = cleanName(input.name);
  if (!name) return { ok: false, error: "اسم را بنویس؛ بین ۲ تا ۴۰ حرف." };
  const phone = typeof input.phone === "string" ? normalizePhone(input.phone) : null;
  if (!phone) return { ok: false, error: "شماره موبایل را کامل بنویس." };
  const password = cleanPassword(input.password);
  if (!password) return { ok: false, error: "رمز حداقل ۸ حرف باشد." };
  const sections = pickedSections(input.sections);
  if (sections.length === 0) return { ok: false, error: "حداقل یک بخش منو را انتخاب کن." };

  try {
    await db.orm.aroma.User.create({
      name,
      phone,
      passwordHash: await hashPassword(password),
      role: "admin",
      access: encodeAccess(sections),
    });
    refresh();
    return { ok: true };
  } catch (error) {
    if (isUniqueViolation(error)) return { ok: false, error: "این شماره قبلاً حساب دارد." };
    console.error(error);
    return { ok: false, error: "مدیر ساخته نشد. کمی بعد دوباره امتحان کن." };
  }
}

export async function setAdminAccess(userId: number, sections: unknown): Promise<Result> {
  const admin = await requireSection("settings");
  if (!admin) return denied();
  if (!Number.isInteger(userId) || userId < 1) return { ok: false, error: "این حساب پیدا نشد." };
  const next = pickedSections(sections);
  if (next.length === 0) return { ok: false, error: "حداقل یک بخش باید باز بماند." };

  try {
    const target = await db.orm.aroma.User.where((row) => row.id.eq(userId)).select("id", "role", "access").first();
    if (!target || target.role !== "admin") return { ok: false, error: "فقط دسترسی مدیر را می‌شود عوض کرد." };
    const encoded = encodeAccess(next);
    if (encoded === target.access) {
      refresh();
      return { ok: true };
    }
    const droppingSettings = parseAccess(target.access).includes("settings") && !next.includes("settings");
    if (droppingSettings && (await settingsHolderCount()) <= 1) {
      return { ok: false, error: "آخرین کسی که تنظیمات را دارد را نمی‌شود از این بخش برداشت." };
    }
    await db.orm.aroma.User.where((row) => row.id.eq(userId)).update({ access: encoded });
    refresh();
    return { ok: true };
  } catch (error) {
    console.error(error);
    return { ok: false, error: "دسترسی ذخیره نشد. کمی بعد دوباره امتحان کن." };
  }
}

function pickedSections(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string" && isAdminSection(item));
}

async function settingsHolderCount() {
  const admins = await db.orm.aroma.User.where((row) => row.role.eq("admin")).select("access").all();
  return admins.filter((row) => parseAccess(row.access).includes("settings")).length;
}
