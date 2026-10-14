import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArticleEditor } from "@/app/admin/article-editor";
import { articleViewCounts, loadArticleDesk } from "@/lib/knowledge-server";
import { guardSection } from "@/lib/auth/admin";

export const metadata: Metadata = { title: "ویرایش مقاله · مدیریت آروما" };

export default async function EditArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  await guardSection("learn");
  const { slug } = await params;
  const [{ store, articles }, views] = await Promise.all([loadArticleDesk(), articleViewCounts()]);
  if (store !== "ready") redirect("/admin/learn");
  const entry = articles.find((item) => item.slug === slug);
  if (!entry) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/admin/learn" className="text-label text-muted-foreground">
        دانستنی‌ها
      </Link>
      <h1 className="mt-2 text-headline font-bold">{entry.title}</h1>
      <ArticleEditor mode="edit" entry={entry} views={views.get(entry.slug) ?? 0} />
    </div>
  );
}
