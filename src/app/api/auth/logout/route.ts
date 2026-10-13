import { clearSessionCookie, hashSessionToken, readSessionToken } from "@/lib/auth/session";
import { db } from "@/prisma/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const token = await readSessionToken();
  await clearSessionCookie();
  if (!token) return Response.json({ ok: true });

  try {
    const tokenHash = hashSessionToken(token);
    await db.orm.aroma.Session.where((row) => row.tokenHash.eq(tokenHash)).delete();
  } catch (error) {
    console.error(error);
  }
  return Response.json({ ok: true });
}
