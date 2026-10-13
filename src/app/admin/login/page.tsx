import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminLoginForm } from "@/app/admin/login/login-form";
import { Card } from "@/components/Card";
import { requireAdmin } from "@/lib/auth/admin";
import { firstSectionHref } from "@/lib/auth/sections";

export const metadata: Metadata = { title: "ورود مدیریت · آروما" };

export default async function AdminLoginPage() {
  const admin = await requireAdmin().catch(() => null);
  const home = admin ? firstSectionHref(admin.sections) : null;
  if (home) redirect(home);

  return (
    <main className="grid min-h-dvh place-items-center bg-desk px-4 py-10">
      <div className="w-full max-w-sm">
        <p className="text-label text-muted">آروما</p>
        <h1 className="mt-1 text-display font-bold text-ink">مدیریت</h1>
        <p className="mt-2 text-pretty text-body text-muted">فقط حساب مدیر وارد می‌شود.</p>
        <Card shadow="sheet" className="mt-6 px-4 py-5">
          <AdminLoginForm />
        </Card>
      </div>
    </main>
  );
}
