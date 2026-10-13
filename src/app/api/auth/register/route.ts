import { registerInput } from "@/lib/auth/credentials";
import { isUniqueViolation, openSession, toPublic } from "@/lib/auth/current";
import { UNAVAILABLE_MESSAGE } from "@/lib/auth/limits";
import { hashPassword } from "@/lib/auth/password";
import { db } from "@/prisma/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const parsed = registerInput(await request.json().catch(() => null));
  if ("error" in parsed) return Response.json({ error: parsed.error }, { status: 400 });

  try {
    const passwordHash = await hashPassword(parsed.value.password);
    const user = await db.orm.aroma.User.create({
      phone: parsed.value.phone,
      passwordHash,
      name: parsed.value.name,
    });
    await openSession(user.id);
    return Response.json({ user: toPublic(user) }, { status: 201 });
  } catch (error) {
    if (isUniqueViolation(error)) {
      return Response.json({ error: "این شماره قبلاً ثبت شده." }, { status: 409 });
    }
    console.error(error);
    return Response.json({ error: UNAVAILABLE_MESSAGE }, { status: 503 });
  }
}
