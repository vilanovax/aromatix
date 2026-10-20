import type { Metadata } from "next";
import { SettingsDesk, type SettingsAdmin } from "@/app/admin/settings-desk";
import { guardSection } from "@/lib/auth/admin";
import { displayPhone } from "@/lib/auth/phone";
import { parseAccess } from "@/lib/auth/sections";
import { readBudgetMillions } from "@/lib/catalog-server";
import { db } from "@/prisma/db";

export const metadata: Metadata = { title: "تنظیمات · مدیریت آروما" };

export default async function SettingsPage() {
  const admin = await guardSection("settings");
  const [admins, counts, budgets] = await Promise.all([loadAdmins(admin.id), loadCounts(), readBudgetMillions()]);

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-headline font-bold">تنظیمات</h1>
      <p className="mt-2 text-body text-muted-foreground">حساب خودت، سقف بودجهٔ راهنما، مدیرها، و نسخهٔ داده‌ها.</p>
      <SettingsDesk admins={admins} counts={counts} budgets={budgets} />
    </div>
  );
}

async function loadAdmins(selfId: number): Promise<SettingsAdmin[]> {
  const rows = await db.orm.aroma.User.where((row) => row.role.eq("admin")).select("id", "name", "phone", "access").all();
  return rows
    .map((row) => ({
      id: row.id,
      name: row.name,
      phone: displayPhone(row.phone),
      sections: parseAccess(row.access),
      self: row.id === selfId,
    }))
    .sort((a, b) => Number(b.self) - Number(a.self) || a.name.localeCompare(b.name, "fa"));
}

async function loadCounts() {
  const [brands, shops, perfumes, articles, users] = await Promise.all([
    db.orm.aroma.CatalogBrand.select("slug").all(),
    db.orm.aroma.CatalogShop.select("slug").all(),
    db.orm.aroma.CatalogPerfume.select("slug").all(),
    db.orm.aroma.LearnArticle.select("slug").all(),
    db.orm.aroma.User.select("id").all(),
  ]);
  return {
    brands: brands.length,
    shops: shops.length,
    perfumes: perfumes.length,
    articles: articles.length,
    users: users.length,
  };
}
