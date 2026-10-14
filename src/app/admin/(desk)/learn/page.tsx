import type { Metadata } from "next";
import { ArticleIndex, type ArticleRow } from "@/app/admin/article-index";
import { PublishLearn } from "@/app/admin/publish-learn";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { articleViewCounts, loadArticleDesk } from "@/lib/knowledge-server";
import { faNum } from "@/lib/format";
import { guardSection } from "@/lib/auth/admin";

export const metadata: Metadata = { title: "دانستنی‌ها · مدیریت آروما" };

export default async function LearnAdminPage() {
  await guardSection("learn");
  const [{ store, articles }, views] = await Promise.all([loadArticleDesk(), articleViewCounts()]);
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
          <h1 className="text-headline font-bold">دانستنی‌ها</h1>
          <p className="mt-1 text-label text-muted-foreground">
            {store === "ready"
              ? activeCount === rows.length
                ? `${faNum(rows.length)} مقاله`
                : `${faNum(rows.length)} مقاله، ${faNum(rows.length - activeCount)} پنهان`
              : "هنوز چیزی منتشر نشده"}
          </p>
        </div>
        {store === "ready" ? (
          <Button href="/admin/learn/new" size="md" className="shrink-0">
            مقاله جدید
          </Button>
        ) : null}
      </div>

      {store === "offline" ? <EmptyState className="mt-6" title="اتصال فهرست مقاله‌ها برقرار نیست" /> : null}
      {store === "empty" ? (
        <EmptyState
          className="mt-6 max-w-xl"
          title="متن‌ها هنوز در پایگاه نیست"
          description="با انتشار، همین‌جا قابل ویرایش می‌شوند."
          action={<PublishLearn />}
        />
      ) : null}
      {store === "ready" ? <ArticleIndex rows={rows} /> : null}
    </div>
  );
}
