import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArticleEditor } from "@/app/admin/article-editor";
import { loadArticleDesk } from "@/lib/knowledge-server";
import { guardSection } from "@/lib/auth/admin";

export const metadata: Metadata = { title: "مقاله جدید · مدیریت آروما" };

export default async function NewArticlePage() {
  await guardSection("learn");
  const { store, articles } = await loadArticleDesk();
  if (store !== "ready") redirect("/admin/learn");

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/admin/learn" className="text-label text-muted">
        دانستنی‌ها
      </Link>
      <h1 className="mt-2 text-headline font-bold">مقاله جدید</h1>
      <ArticleEditor mode="create" nextSort={articles.length} />
    </div>
  );
}
