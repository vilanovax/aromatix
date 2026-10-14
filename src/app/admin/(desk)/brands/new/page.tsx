import type { Metadata } from "next";
import Link from "next/link";
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
      <Link href="/admin/brands" className="text-label text-muted-foreground">
        برندها
      </Link>
      <h1 className="mt-2 text-headline font-bold">برند جدید</h1>
      <BrandEditor mode="create" />
    </div>
  );
}
