import { LOGIN_LIMIT, LOCKED_MESSAGE, UNAVAILABLE_MESSAGE, loginWindowStart } from "@/lib/auth/limits";
import { loginInput } from "@/lib/auth/credentials";
import { openSession, toPublic } from "@/lib/auth/current";
import { verifyPassword } from "@/lib/auth/password";
import { db } from "@/prisma/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DUMMY_HASH = "$2b$12$3jiIh5W.yLviN1/AzVE2suPfbkgdqjB1doZIiMPYp8CSvWctaY4Ea";

async function locked(phone: string) {
  const since = loginWindowStart();
  const recent = await db.orm.aroma.LoginAttempt.where((row) => row.phone.eq(phone))
    .where((row) => row.createdAt.gte(since))
    .limit(LOGIN_LIMIT)
    .all();
  return recent.length >= LOGIN_LIMIT;
}

export async function POST(request: Request) {
  const parsed = loginInput(await request.json().catch(() => null));
  if ("error" in parsed) return Response.json({ error: parsed.error }, { status: 400 });

  try {
    if (await locked(parsed.value.phone)) {
      return Response.json({ error: LOCKED_MESSAGE }, { status: 429 });
    }

    const user = await db.orm.aroma.User.where((row) => row.phone.eq(parsed.value.phone)).first();
    const passwordOk = await verifyPassword(parsed.value.password, user?.passwordHash ?? DUMMY_HASH);
    if (!user || !passwordOk) {
      await db.orm.aroma.LoginAttempt.create({ phone: parsed.value.phone });
      return Response.json({ error: "شماره یا رمز درست نیست." }, { status: 401 });
    }
    if (!user.active) {
      return Response.json({ error: "این حساب غیرفعال است." }, { status: 403 });
    }
    if (user.role !== "admin") {
      return Response.json({ error: "این حساب به مدیریت دسترسی ندارد." }, { status: 403 });
    }

    await openSession(user.id);
    return Response.json({ user: toPublic(user) });
  } catch (error) {
    console.error(error);
    return Response.json({ error: UNAVAILABLE_MESSAGE }, { status: 503 });
  }
}
