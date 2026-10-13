import { currentUser } from "@/lib/auth/current";
import { db } from "@/prisma/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const KINDS = new Set(["perfume_view", "brand_view", "section_view", "shop_open", "recommendation", "article_view"]);
const SECTIONS = new Set(["/", "/results", "/shelf", "/brands", "/learn", "/guide", "/compare"]);

type Incoming = { kind?: unknown; subject?: unknown };

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const events = Array.isArray(body?.events) ? (body.events as Incoming[]).slice(0, 12) : [];
  const accepted = events.flatMap((event) => {
    if (typeof event.kind !== "string" || typeof event.subject !== "string") return [];
    if (!KINDS.has(event.kind) || !validSubject(event.kind, event.subject)) return [];
    return [{ kind: event.kind, subject: event.subject }];
  });
  if (accepted.length === 0) return Response.json({ ok: true, saved: 0 });

  let userId: number | null = null;
  try {
    userId = (await currentUser())?.id ?? null;
  } catch {
    userId = null;
  }

  try {
    const createdAt = new Date().toISOString();
    for (const event of accepted) {
      await db.orm.aroma.UsageEvent.create({
        kind: event.kind,
        subject: event.subject,
        userId,
        createdAt,
      });
    }
  } catch (error) {
    console.error(error);
    return Response.json({ ok: false }, { status: 503 });
  }

  return Response.json({ ok: true, saved: accepted.length });
}

function validSubject(kind: string, subject: string) {
  if (kind === "section_view") return SECTIONS.has(subject);
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(subject);
}
