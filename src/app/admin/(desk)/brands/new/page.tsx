import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { BrandEditor } from "@/app/admin/brand-editor";
import { catalogStoreStatus } from "@/lib/catalog-server";
import { guardSection } from "@/lib/auth/admin";

export const metadata: Metadata = { title: "برند جدید · مدیریت آروما" };

export default async function NewBrandPage() {
  await guardSection("brands");
  if ((await catalogStoreStatus()) !== "ready") redirect("/admin/brands");

  return (
    <div className="mx-auto max-w-3xl">
      <BrandEditor mode="create" />
    </div>
  );
}
