import { requireSection } from "@/lib/auth/admin";
import { displayPhone } from "@/lib/auth/phone";
import { db } from "@/prisma/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await requireSection("settings");
  if (!admin) return new Response("به تنظیمات دسترسی نداری.", { status: 403 });

  const [brands, shops, perfumes, articles, users] = await Promise.all([
    db.orm.aroma.CatalogBrand.select("slug", "nameFa", "nameEn", "description", "active").all(),
    db.orm.aroma.CatalogShop.select(
      "slug",
      "nameFa",
      "nameEn",
      "description",
      "website",
      "instagram",
      "telegram",
      "phone",
      "city",
      "active",
    ).all(),
    db.orm.aroma.CatalogPerfume.select("slug", "nameFa", "nameEn", "brandSlug", "document", "updatedAt").all(),
    db.orm.aroma.LearnArticle.select("slug", "title", "active", "sort", "display", "publishedOn", "document", "updatedAt").all(),
    db.orm.aroma.User.select("id", "name", "phone", "role", "access", "createdAt").all(),
  ]);

  const body = {
    exportedAt: new Date().toISOString(),
    brands,
    shops,
    perfumes: perfumes.map((row) => ({ ...row, document: parseDocument(row.document) })),
    articles: articles.map((row) => ({ ...row, document: parseDocument(row.document) })),
    users: users.map((row) => ({
      id: row.id,
      name: row.name,
      phone: displayPhone(row.phone),
      role: row.role,
      access: row.access,
      createdAt: row.createdAt,
    })),
  };
  const day = body.exportedAt.slice(0, 10);
  return new Response(JSON.stringify(body, null, 2), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "content-disposition": `attachment; filename="aroma-backup-${day}.json"`,
      "cache-control": "no-store",
    },
  });
}

function parseDocument(value: string) {
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return value;
  }
}
