import type { Metadata } from "next";
import Link from "next/link";
import { PublishCatalogButton } from "@/app/admin/publish-button";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
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
      <h1 className="text-headline font-bold text-balance">نمای کلی</h1>
      <p className="mt-2 text-pretty text-body text-muted-foreground">
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
          <p className="mt-2 text-pretty text-label text-muted-foreground">
            سایت الان همان نمونهٔ داخل کد را نشان می‌دهد. با انتشار، همان عطرها وارد پایگاه می‌شوند و از اینجا قابل ویرایش‌اند.
          </p>
          <PublishCatalogButton />
        </Card>
      ) : null}

      <ul className="mt-6 flex flex-wrap justify-start gap-2" aria-label="عددهای کاتالوگ">
        <CountChip href={ready ? "/admin/perfumes" : undefined} label="عطر" value={ready ? fa(snapshot.perfumes.length) : "—"} />
        <CountChip href={ready ? "#queue" : undefined} label="مورد باز" value={ready ? fa(issues.length) : "—"} />
        <CountChip
          href="/admin/users"
          label={stats ? `کاربر، ${fa(stats.weekUsers)} این هفته` : "کاربر"}
          value={stats ? fa(stats.users) : "—"}
        />
        <CountChip
          label={stats ? `نشست، ${fa(stats.failedLogins)} ورود ناموفق` : "نشست"}
          value={stats ? fa(stats.sessions) : "—"}
        />
      </ul>

      <section id="queue" className="mt-8 scroll-mt-8">
        <h2 className="text-base font-semibold">صف بررسی</h2>
        {store !== "ready" ? (
          <p className="mt-2 text-pretty text-label text-muted-foreground">بعد از انتشار کاتالوگ، شکاف عکس، ماندگاری و قیمت اینجا می‌آید.</p>
        ) : groups.length === 0 ? (
          <EmptyState className="mt-3" title="مورد بازی نیست" description="کاتالوگ از این نظر کامل است." />
        ) : (
          <ul className="mt-3 divide-y divide-border overflow-hidden rounded-surface border border-border bg-card">
            {groups.map((group) => (
              <li key={group.slug} className="px-4 py-3">
                <Link href={`/admin/perfumes/${group.slug}`} className="text-body font-semibold">
                  {group.nameFa}
                </Link>
                <p className="mt-1 text-label text-muted-foreground">{group.brand}</p>
                <span className="mt-2 flex flex-wrap justify-start gap-2">
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

function CountChip({ href, label, value }: { href?: string; label: string; value: string }) {
  const className =
    "inline-flex min-h-11 items-center gap-2 rounded-full border border-input bg-card px-4 text-body font-medium outline-offset-2 focus-visible:outline-2 focus-visible:outline-ring";
  const body = (
    <>
      {label}
      <span className="tabular-nums text-muted-foreground">{value}</span>
    </>
  );
  return <li>{href ? <Link href={href} className={className}>{body}</Link> : <span className={className}>{body}</span>}</li>;
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
