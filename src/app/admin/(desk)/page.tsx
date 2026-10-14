import type { Metadata } from "next";
import Link from "next/link";
import { PublishCatalogButton } from "@/app/admin/publish-button";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Stat } from "@/components/ui/stat";
import { catalogIssues, type CatalogIssue } from "@/lib/admin/health";
import { loginWindowStart } from "@/lib/auth/limits";
import { loadCatalogBundle } from "@/lib/catalog-server";
import { guardSection } from "@/lib/auth/admin";
import { fa } from "@/lib/utils";
import { db } from "@/prisma/db";

export const metadata: Metadata = { title: "نمای کلی · مدیریت آروما" };

export default async function AdminHomePage() {
  await guardSection("overview");
  const [{ store, snapshot }, stats] = await Promise.all([loadCatalogBundle(), readStats()]);
  const issues = store === "ready" ? catalogIssues(snapshot.perfumes) : [];
  const groups = groupIssues(issues, snapshot.perfumes);

  const ready = store === "ready";
  const openPerfumes = new Set(issues.map((issue) => issue.slug)).size;

  return (
    <div>
      <h1 className="text-2xl font-bold text-balance">نمای کلی</h1>
      <p className="mt-2 max-w-2xl text-pretty text-sm text-muted-foreground">
        {ready && issues.length > 0
          ? `${fa(openPerfumes)} عطر، ${fa(issues.length)} مورد باز است. نام عطر کل فرم را باز می‌کند؛ برچسب، همان بخش را.`
          : ready
            ? "مورد بازی در کاتالوگ نیست."
            : "اول کاتالوگ را منتشر کن تا صف بررسی و عددها از پایگاه بیایند."}
      </p>

      {store === "offline" ? (
        <Alert className="mt-6" variant="warning" title="پایگاه هنوز جدول کاتالوگ را ندارد">
          مهاجرت را اجرا کن، بعد این صفحه را تازه کن.
        </Alert>
      ) : null}

      {store === "empty" ? (
        <Card className="mt-6 p-5">
          <p className="text-base font-semibold">کاتالوگ هنوز منتشر نشده</p>
          <p className="mt-2 text-pretty text-sm text-muted-foreground">
            سایت الان همان نمونهٔ داخل کد را نشان می‌دهد. با انتشار، همان عطرها وارد پایگاه می‌شوند و از اینجا قابل ویرایش‌اند.
          </p>
          <PublishCatalogButton />
        </Card>
      ) : null}

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatLink
          label="عطر"
          value={ready ? fa(snapshot.perfumes.length) : "—"}
          href={ready ? "/admin/perfumes" : undefined}
        />
        <StatLink label="مورد باز" value={ready ? fa(issues.length) : "—"} href={ready ? "#queue" : undefined} />
        <StatLink
          label={stats ? `کاربر · ${fa(stats.weekUsers)} این هفته` : "کاربر"}
          value={stats ? fa(stats.users) : "—"}
          href="/admin/users"
        />
        <StatLink
          label={stats ? `نشست · ${fa(stats.failedLogins)} ورود ناموفق` : "نشست"}
          value={stats ? fa(stats.sessions) : "—"}
        />
      </div>

      <section id="queue" className="mt-8 scroll-mt-8">
        <h2 className="text-base font-semibold">صف بررسی</h2>
        {store !== "ready" ? (
          <p className="mt-2 text-sm text-muted-foreground">بعد از انتشار کاتالوگ، شکاف عکس، ماندگاری و قیمت اینجا می‌آید.</p>
        ) : groups.length === 0 ? (
          <EmptyState className="mt-3" title="مورد بازی نیست" description="کاتالوگ از این نظر کامل است." />
        ) : (
          <ul className="mt-3 divide-y divide-border overflow-hidden rounded-surface border border-border bg-card">
            {groups.map((group) => (
              <li key={group.slug} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
                <div className="w-36 shrink-0">
                  <Link href={`/admin/perfumes/${group.slug}`} className="text-sm font-medium hover:underline">
                    {group.nameFa}
                  </Link>
                  <p className="truncate text-xs text-muted-foreground">{group.brand}</p>
                </div>
                <span className="flex flex-wrap gap-2">
                  {group.items.map((item) => (
                    <Link
                      key={`${item.part}-${item.label}`}
                      href={item.part === "shops" ? "/admin/shops" : `/admin/perfumes/${group.slug}#${item.part}`}
                    >
                      <Badge variant="warning">{item.label}</Badge>
                    </Link>
                  ))}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function StatLink({
  href,
  className,
  ...props
}: React.ComponentProps<typeof Stat> & { href?: string }) {
  const stat = <Stat className={className} {...props} />;
  if (!href) return stat;
  return (
    <Link href={href} className="block rounded-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
      {stat}
    </Link>
  );
}

function groupIssues(issues: CatalogIssue[], perfumes: { slug: string; brand: string }[]) {
  const brandOf = new Map(perfumes.map((perfume) => [perfume.slug, perfume.brand]));
  const groups = new Map<
    string,
    { slug: string; nameFa: string; brand: string; items: { label: string; part: CatalogIssue["part"] }[] }
  >();
  for (const issue of issues) {
    const current = groups.get(issue.slug);
    const item = { label: issue.label, part: issue.part };
    if (!current) {
      groups.set(issue.slug, { slug: issue.slug, nameFa: issue.nameFa, brand: brandOf.get(issue.slug) ?? "", items: [item] });
      continue;
    }
    current.items.push(item);
  }
  return [...groups.values()];
}

async function readStats() {
  try {
    const now = new Date().toISOString();
    const week = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const since = loginWindowStart();
    const [users, weekUsers, sessions, failedLogins] = await Promise.all([
      db.orm.aroma.User.select("id").all(),
      db.orm.aroma.User.where((row) => row.createdAt.gte(week)).select("id").all(),
      db.orm.aroma.Session.where((row) => row.expiresAt.gt(now)).select("id").all(),
      db.orm.aroma.LoginAttempt.where((row) => row.createdAt.gte(since)).select("id").all(),
    ]);
    return {
      users: users.length,
      weekUsers: weekUsers.length,
      sessions: sessions.length,
      failedLogins: failedLogins.length,
    };
  } catch (error) {
    console.error(error);
    return null;
  }
}
