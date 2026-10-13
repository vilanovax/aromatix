import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArticleEditor } from "@/app/admin/article-editor";
import { articleStoreStatus, articleViewCounts, loadArticles } from "@/lib/knowledge-server";
import { guardSection } from "@/lib/auth/admin";

export const metadata: Metadata = { title: "ویرایش مقاله · مدیریت آروما" };

export default async function EditArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  await guardSection("learn");
  if ((await articleStoreStatus()) !== "ready") redirect("/admin/learn");
  const { slug } = await params;
  const [articles, views] = await Promise.all([loadArticles(), articleViewCounts()]);
  const entry = articles.find((item) => item.slug === slug);
  if (!entry) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/admin/learn" className="text-label text-muted">
        دانستنی‌ها
      </Link>
      <h1 className="mt-2 text-headline font-bold">{entry.title}</h1>
      <ArticleEditor mode="edit" entry={entry} views={views.get(entry.slug) ?? 0} />
    </div>
  );
}
