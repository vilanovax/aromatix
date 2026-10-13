import { redirect } from "next/navigation";
import { AdminShell } from "@/app/admin/admin-shell";
import { requireAdmin } from "@/lib/auth/admin";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  let admin: Awaited<ReturnType<typeof requireAdmin>> = null;
  try {
    admin = await requireAdmin();
  } catch (error) {
    console.error(error);
  }
  if (!admin) redirect("/admin/login");
  return (
    <AdminShell name={admin.name} sections={admin.sections}>
      {children}
    </AdminShell>
  );
}
