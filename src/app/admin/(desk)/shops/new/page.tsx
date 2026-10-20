import type { Metadata } from "next";
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
      <ShopEditor mode="create" />
    </div>
  );
}
