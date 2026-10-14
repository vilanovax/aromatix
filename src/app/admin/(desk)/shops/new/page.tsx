import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ShopEditor } from "@/app/admin/shop-editor";
import { catalogStoreStatus } from "@/lib/catalog-server";
import { guardSection } from "@/lib/auth/admin";

export const metadata: Metadata = { title: "فروشگاه جدید · مدیریت آروما" };

export default async function NewShopPage() {
  await guardSection("shops");
  if ((await catalogStoreStatus()) !== "ready") redirect("/admin/shops");

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/admin/shops" className="text-label text-muted-foreground">
        فروشگاه‌ها
      </Link>
      <h1 className="mt-2 text-headline font-bold">فروشگاه جدید</h1>
      <ShopEditor mode="create" />
    </div>
  );
}
