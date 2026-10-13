import { isAvatarId, type AvatarId } from "@/lib/auth/avatars";
import { normalizePhone } from "@/lib/auth/phone";

const NAME_MIN = 2;
const NAME_MAX = 40;
const PASSWORD_MIN = 8;
const PASSWORD_MAX = 72;

export function cleanName(input: unknown) {
  if (typeof input !== "string") return null;
  const name = input.trim().replace(/\s+/g, " ");
  if (name.length < NAME_MIN || name.length > NAME_MAX) return null;
  return name;
}

export function cleanPassword(input: unknown) {
  if (typeof input !== "string") return null;
  if (input.length < PASSWORD_MIN || input.length > PASSWORD_MAX) return null;
  return input;
}

export function registerInput(body: unknown) {
  if (!body || typeof body !== "object") return { error: "اطلاعات ثبت‌نام کامل نیست." } as const;
  const record = body as { name?: unknown; phone?: unknown; password?: unknown };
  const name = cleanName(record.name);
  if (!name) return { error: "اسم را بنویس؛ بین ۲ تا ۴۰ حرف." } as const;
  const phone = typeof record.phone === "string" ? normalizePhone(record.phone) : null;
  if (!phone) return { error: "شماره موبایل را کامل بنویس." } as const;
  if (typeof record.password !== "string" || record.password.length < PASSWORD_MIN) {
    return { error: "رمز حداقل ۸ حرف باشد." } as const;
  }
  if (record.password.length > PASSWORD_MAX) return { error: "رمز بلندتر از حد است." } as const;
  return { value: { name, phone, password: record.password } } as const;
}

export function loginInput(body: unknown) {
  if (!body || typeof body !== "object") return { error: "شماره و رمز را بنویس." } as const;
  const record = body as { phone?: unknown; password?: unknown };
  const phone = typeof record.phone === "string" ? normalizePhone(record.phone) : null;
  if (!phone) return { error: "شماره موبایل را کامل بنویس." } as const;
  const password = cleanPassword(record.password);
  if (!password) return { error: "شماره یا رمز درست نیست." } as const;
  return { value: { phone, password } } as const;
}

export function profileInput(body: unknown) {
  if (!body || typeof body !== "object") return { error: "چیزی برای ذخیره نیست." } as const;
  const record = body as { name?: unknown; avatarId?: unknown };
  const next: { name?: string; avatarId?: AvatarId } = {};
  if ("name" in record) {
    const name = cleanName(record.name);
    if (!name) return { error: "اسم را بنویس؛ بین ۲ تا ۴۰ حرف." } as const;
    next.name = name;
  }
  if ("avatarId" in record) {
    if (typeof record.avatarId !== "string" || !isAvatarId(record.avatarId)) {
      return { error: "آواتار را از فهرست انتخاب کن." } as const;
    }
    next.avatarId = record.avatarId;
  }
  if (!next.name && !next.avatarId) return { error: "چیزی برای ذخیره نیست." } as const;
  return { value: next } as const;
}
