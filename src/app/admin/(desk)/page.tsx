import type { Metadata } from "next";
import Link from "next/link";
import { PublishCatalogButton } from "@/app/admin/publish-button";
import { Card } from "@/components/Card";
import { catalogIssues, type CatalogIssue } from "@/lib/admin/health";
import { loginWindowStart } from "@/lib/auth/limits";
import { loadCatalogBundle } from "@/lib/catalog-server";
import { guardSection } from "@/lib/auth/admin";
import { faNum } from "@/lib/format";
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
      <p className="mt-2 max-w-2xl text-pretty text-body text-muted">
        {ready && issues.length > 0
          ? `${faNum(openPerfumes)} عطر، ${faNum(issues.length)} مورد باز است. نام عطر کل فرم را باز می‌کند؛ برچسب، همان بخش را.`
          : ready
            ? "مورد بازی در کاتالوگ نیست."
            : "اول کاتالوگ را منتشر کن تا صف بررسی و عددها از پایگاه بیایند."}
      </p>

      {store === "offline" ? (
        <Card className="mt-6 p-5">
          <p className="text-title font-semibold">پایگاه هنوز جدول کاتالوگ را ندارد</p>
          <p className="mt-2 text-pretty text-body text-muted">مهاجرت را اجرا کن، بعد این صفحه را تازه کن.</p>
        </Card>
      ) : null}

      {store === "empty" ? (
        <Card className="mt-6 p-5">
          <p className="text-title font-semibold">کاتالوگ هنوز منتشر نشده</p>
          <p className="mt-2 text-pretty text-body text-muted">
            سایت الان همان نمونهٔ داخل کد را نشان می‌دهد. با انتشار، همان عطرها وارد پایگاه می‌شوند و از اینجا قابل ویرایش‌اند.
          </p>
          <PublishCatalogButton />
        </Card>
      ) : null}

      <dl className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-panel border border-line bg-line sm:grid-cols-4">
        <Stat
          label="عطر"
          value={ready ? snapshot.perfumes.length : null}
          href={ready ? "/admin/perfumes" : undefined}
        />
        <Stat label="مورد باز" value={ready ? issues.length : null} alert={issues.length > 0} href={ready ? "#queue" : undefined} />
        <Stat
          label="کاربر"
          value={stats?.users ?? null}
          hint={stats ? `${faNum(stats.weekUsers)} این هفته` : undefined}
          href="/admin/users"
        />
        <Stat
          label="نشست"
          value={stats?.sessions ?? null}
          hint={stats ? `${faNum(stats.failedLogins)} ورود ناموفق` : undefined}
        />
      </dl>

      <section id="queue" className="mt-8 scroll-mt-8">
        <h2 className="text-title font-semibold">صف بررسی</h2>
        {store !== "ready" ? (
          <p className="mt-2 text-body text-muted">بعد از انتشار کاتالوگ، شکاف عکس، ماندگاری و قیمت اینجا می‌آید.</p>
        ) : groups.length === 0 ? (
          <p className="mt-2 text-body text-muted">مورد بازی نیست.</p>
        ) : (
          <ul className="mt-3 divide-y divide-line overflow-hidden rounded-panel border border-line bg-card">
            {groups.map((group) => (
              <li key={group.slug} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
                <div className="w-36 shrink-0">
                  <Link href={`/admin/perfumes/${group.slug}`} className="text-body font-medium hover:underline">
                    {group.nameFa}
                  </Link>
                  <p className="truncate text-label text-muted">{group.brand}</p>
                </div>
                <span className="flex flex-wrap gap-1.5">
                  {group.items.map((item) => (
                    <Link
                      key={`${item.part}-${item.label}`}
                      href={item.part === "shops" ? "/admin/shops" : `/admin/perfumes/${group.slug}#${item.part}`}
                      className="inline-flex min-h-9 items-center rounded-full bg-clay px-3 text-label text-ink"
                    >
                      {item.label}
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

function Stat({
  label,
  value,
  hint,
  alert = false,
  href,
}: {
  label: string;
  value: number | null;
  hint?: string;
  alert?: boolean;
  href?: string;
}) {
  const body = (
    <>
      <dt className="text-label text-muted">{label}</dt>
      <dd className={alert ? "mt-0.5 text-title font-bold text-danger tabular-nums" : "mt-0.5 text-title font-bold tabular-nums"}>
        {value == null ? "—" : faNum(value)}
      </dd>
      {hint ? <p className="mt-0.5 text-label text-faint">{hint}</p> : null}
    </>
  );
  if (!href) return <div className="bg-card px-3.5 py-3">{body}</div>;
  return (
    <Link href={href} className="bg-card px-3.5 py-3 hover:bg-press">
      {body}
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
