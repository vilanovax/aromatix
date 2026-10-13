import { profileInput } from "@/lib/auth/credentials";
import { currentUser, toPublic } from "@/lib/auth/current";
import { UNAVAILABLE_MESSAGE } from "@/lib/auth/limits";
import { db } from "@/prisma/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await currentUser();
    return Response.json({ user });
  } catch (error) {
    console.error(error);
    return Response.json({ user: null });
  }
}

export async function PATCH(request: Request) {
  const parsed = profileInput(await request.json().catch(() => null));
  if ("error" in parsed) return Response.json({ error: parsed.error }, { status: 400 });

  try {
    const user = await currentUser();
    if (!user) return Response.json({ error: "اول وارد شو." }, { status: 401 });

    const updated = await db.orm.aroma.User.where((row) => row.id.eq(user.id))
      .select("id", "name", "avatarId", "phone")
      .update(parsed.value);
    if (!updated) return Response.json({ error: UNAVAILABLE_MESSAGE }, { status: 503 });
    return Response.json({ user: toPublic(updated) });
  } catch (error) {
    console.error(error);
    return Response.json({ error: UNAVAILABLE_MESSAGE }, { status: 503 });
  }
}
