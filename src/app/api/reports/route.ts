import { currentUser } from "@/lib/auth/current";
import { isReportTopic } from "@/lib/reports";
import { db } from "@/prisma/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MIN = 8;
const MAX = 400;

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { slug?: unknown; topic?: unknown; body?: unknown } | null;
  const slug = typeof body?.slug === "string" ? body.slug.trim() : "";
  const topic = typeof body?.topic === "string" ? body.topic : "";
  const text = typeof body?.body === "string" ? body.body.trim() : "";

  if (!slug || !isReportTopic(topic)) {
    return Response.json({ error: "موضوع گزارش را انتخاب کن." }, { status: 400 });
  }
  if (text.length < MIN) {
    return Response.json({ error: "کمی دقیق‌تر بنویس؛ حداقل ۸ حرف." }, { status: 400 });
  }
  if (text.length > MAX) {
    return Response.json({ error: "متن گزارش بلند است. کوتاه‌ترش کن." }, { status: 400 });
  }

  const perfume = await db.orm.aroma.CatalogPerfume.where((row) => row.slug.eq(slug)).select("slug", "nameFa").first();
  if (!perfume) return Response.json({ error: "این عطر در کاتالوگ نیست." }, { status: 404 });

  const user = await currentUser();
  if (user) {
    const existing = await db.orm.aroma.CatalogReport.where((row) => row.userId.eq(user.id))
      .where((row) => row.perfumeSlug.eq(slug))
      .where((row) => row.topic.eq(topic))
      .where((row) => row.status.eq("open"))
      .first();
    if (existing) {
      return Response.json({ error: "همین موضوع را قبلاً گزارش کردی و هنوز باز است." }, { status: 409 });
    }
  }

  await db.orm.aroma.CatalogReport.create({
    perfumeSlug: slug,
    topic,
    body: text,
    status: "open",
    userId: user?.id ?? null,
  });

  return Response.json({ ok: true });
}
