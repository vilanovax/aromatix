import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminLoginForm } from "@/app/admin/login/login-form";
import { Card } from "@/components/ui/card";
import { requireAdmin } from "@/lib/auth/admin";
import { firstSectionHref } from "@/lib/auth/sections";

export const metadata: Metadata = { title: "ورود مدیریت · آروما" };

export default async function AdminLoginPage() {
  const admin = await requireAdmin().catch(() => null);
  const home = admin ? firstSectionHref(admin.sections) : null;
  if (home) redirect(home);

  return (
    <main className="vf grid min-h-dvh place-items-center bg-background px-4 py-10 text-foreground">
      <div className="w-full max-w-sm">
        <p className="text-sm text-brand">آروما</p>
        <h1 className="mt-1 text-2xl font-bold">مدیریت</h1>
        <p className="mt-2 text-sm text-pretty text-muted-foreground">فقط حساب مدیر وارد می‌شود.</p>
        <Card className="mt-6 p-5">
          <AdminLoginForm />
        </Card>
      </div>
    </main>
  );
}
