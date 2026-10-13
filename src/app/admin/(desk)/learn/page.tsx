import type { Metadata } from "next";
import { ArticleIndex, type ArticleRow } from "@/app/admin/article-index";
import { PublishLearn } from "@/app/admin/publish-learn";
import { ButtonLink } from "@/components/Button";
import { Card } from "@/components/Card";
import { articleStoreStatus, articleViewCounts, loadArticles } from "@/lib/knowledge-server";
import { faNum } from "@/lib/format";
import { guardSection } from "@/lib/auth/admin";

export const metadata: Metadata = { title: "دانستنی‌ها · مدیریت آروما" };

export default async function LearnAdminPage() {
  await guardSection("learn");
  const store = await articleStoreStatus();
  const articles = store === "ready" ? await loadArticles() : [];
  const views = store === "ready" ? await articleViewCounts() : new Map<string, number>();
  const rows: ArticleRow[] = articles.map((entry) => ({
    slug: entry.slug,
    title: entry.title,
    group: entry.group,
    display: entry.display,
    active: entry.active,
    sort: entry.sort,
    publishedOn: entry.publishedOn,
    views: views.get(entry.slug) ?? 0,
  }));
  const activeCount = rows.filter((row) => row.active).length;

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-label text-brass">کاتالوگ</p>
          <h1 className="mt-1 text-headline font-bold">دانستنی‌ها</h1>
          <p className="mt-1 text-label text-muted">
            {store === "ready" ? `${faNum(rows.length)} مقاله، ${faNum(activeCount)} فعال` : "هنوز چیزی منتشر نشده"}
          </p>
        </div>
        {store === "ready" ? (
          <ButtonLink href="/admin/learn/new" size="md" className="shrink-0">
            مقاله جدید
          </ButtonLink>
        ) : null}
      </div>

      {store === "offline" ? (
        <Card className="mt-6 p-5">
          <p className="text-pretty text-body text-muted">اتصال فهرست مقاله‌ها برقرار نیست.</p>
        </Card>
      ) : null}
      {store === "empty" ? (
        <Card className="mt-6 max-w-xl p-5">
          <p className="text-pretty text-body text-muted">متن‌های فعلی دانستنی‌ها هنوز در پایگاه نیست. با انتشار، همین‌جا قابل ویرایش می‌شوند.</p>
          <PublishLearn />
        </Card>
      ) : null}
      {store === "ready" ? <ArticleIndex rows={rows} /> : null}
    </div>
  );
}
