import "server-only";
import { db } from "@/prisma/db";
import { isAvatarId } from "@/lib/auth/avatars";
import { displayPhone } from "@/lib/auth/phone";
import type { PublicUser } from "@/lib/auth/public-user";
import {
  clearSessionCookie,
  hashSessionToken,
  newSessionToken,
  readSessionToken,
  sessionExpiryIso,
  writeSessionCookie,
} from "@/lib/auth/session";

export type { PublicUser };

type UserRow = {
  id: number;
  name: string;
  avatarId: string;
  phone: string;
};

export function toPublic(user: UserRow): PublicUser {
  return {
    id: user.id,
    name: user.name,
    avatarId: isAvatarId(user.avatarId) ? user.avatarId : "ink",
    phone: displayPhone(user.phone),
  };
}

function expired(expiresAt: string) {
  const time = Date.parse(expiresAt);
  return Number.isNaN(time) || time <= Date.now();
}

export async function currentUser() {
  const token = await readSessionToken();
  if (!token) return null;

  const tokenHash = hashSessionToken(token);
  const session = await db.orm.aroma.Session.where((row) => row.tokenHash.eq(tokenHash)).first();
  if (!session || expired(session.expiresAt)) {
    if (session) await db.orm.aroma.Session.where((row) => row.id.eq(session.id)).delete();
    await clearSessionCookie();
    return null;
  }

  const user = await db.orm.aroma.User.where((row) => row.id.eq(session.userId))
    .select("id", "name", "avatarId", "phone")
    .first();
  if (!user) {
    await clearSessionCookie();
    return null;
  }
  return toPublic(user);
}

export async function openSession(userId: number) {
  const token = newSessionToken();
  await db.orm.aroma.Session.create({
    tokenHash: hashSessionToken(token),
    userId,
    expiresAt: sessionExpiryIso(),
  });
  await writeSessionCookie(token);
}

export function isUniqueViolation(error: unknown) {
  const parts: string[] = [];
  let current: unknown = error;
  for (let depth = 0; current && depth < 6; depth += 1) {
    if (typeof current === "object" && "code" in current) parts.push(String(current.code));
    if (current instanceof Error) parts.push(current.message);
    current = typeof current === "object" && current && "cause" in current ? current.cause : null;
  }
  return parts.some((part) => part === "23505" || /unique/i.test(part));
}
