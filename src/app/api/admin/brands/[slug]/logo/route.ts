import { requireSection } from "@/lib/auth/admin";
import { storeBrandLogo } from "@/lib/brand-logo";
import { db } from "@/prisma/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request, context: { params: Promise<{ slug: string }> }) {
  if (!(await requireSection("brands"))) {
    return Response.json({ error: "دسترسی نداری." }, { status: 403 });
  }

  const { slug } = await context.params;
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return Response.json({ error: "اسلاگ برند درست نیست." }, { status: 400 });
  }

  const brand = await db.orm.aroma.CatalogBrand.where((row) => row.slug.eq(slug)).select("slug").first();
  if (!brand) return Response.json({ error: "این برند در کاتالوگ نیست." }, { status: 404 });

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return Response.json({ error: "فایل لوگو را انتخاب کن." }, { status: 400 });

  try {
    const logo = await storeBrandLogo(slug, Buffer.from(await file.arrayBuffer()));
    await db.orm.aroma.CatalogBrand.where((row) => row.slug.eq(slug)).update({ logo });
    return Response.json({ logo }, { headers: { "cache-control": "no-store" } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "لوگو ذخیره نشد.";
    const known = message.startsWith("حجم") || message.startsWith("فقط") || message.startsWith("فایل");
    return Response.json({ error: known ? message : "لوگو ذخیره نشد." }, { status: 400 });
  }
}
