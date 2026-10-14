import type { Metadata } from "next";
import Link from "next/link";
import { buildCatalogReport, type CountRow, type GapRow } from "@/lib/admin/catalog-report";
import { loadUsageEvents, usageFromEvents, type UsageReport, type UsageRow } from "@/lib/admin/usage-report";
import { loadCatalog } from "@/lib/catalog-server";
import { faNum, millionToman } from "@/lib/format";
import { guardSection } from "@/lib/auth/admin";

export const metadata: Metadata = { title: "گزارش · مدیریت آروما" };

type Search = { days?: string };

export default async function ReportsPage({ searchParams }: { searchParams: Promise<Search> }) {
  await guardSection("reports");
  const params = await searchParams;
  const days = params.days === "30" ? 30 : 7;
  const [snapshot, events] = await Promise.all([loadCatalog(), loadUsageEvents(days)]);
  const report = buildCatalogReport(snapshot.perfumes);
  const usage = events ? usageFromEvents(days, events, snapshot.perfumes) : null;
  const catalogMax = Math.max(1, report.total);
  const usagePanels = usage && usage.total > 0 ? usageBlocks(usage) : [];

  return (
    <div>
      <h1 className="text-headline font-bold text-balance">گزارش</h1>
      <p className="mt-2 max-w-2xl text-pretty text-body text-muted">
        {faNum(report.total)} عطر. اول جاهایی که داده کم است، بعد ترکیب کاتالوگ، بعد استفادهٔ {faNum(days)} روز.
      </p>

      <section className="mt-6">
        <h2 className="text-title font-semibold">پوشش داده</h2>
        <ul className="mt-3 divide-y divide-line overflow-hidden rounded-panel border border-line bg-card">
          <Coverage label="عکس" percent={report.coverage.image} gaps={report.gaps.image} />
          <Coverage label="موجودی تأییدشده" percent={report.coverage.stock} gaps={report.gaps.stock} />
          <Coverage label="قیمت تازه" percent={report.coverage.fresh} gaps={report.gaps.fresh} />
          <Coverage label="اطمینان کافی" percent={report.coverage.confidence} gaps={report.gaps.confidence} />
        </ul>
      </section>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <Panel title="برندها">
          <Meters rows={report.brands} />
        </Panel>
        <Panel title="آکوردهای پرتکرار">
          <Meters rows={report.accords} />
          <p className="mt-3 text-pretty text-label text-muted">
            {report.rareAccords.length === 0
              ? "آکورد تک‌عطر نیست."
              : `فقط روی یک عطر: ${report.rareAccords.map((row) => row.label).join("، ")}`}
          </p>
        </Panel>
        <Panel title="فصل و موقعیت">
          <p className="text-label text-muted">فصل</p>
          <Meters rows={report.seasons} max={catalogMax} />
          <p className="mt-4 text-label text-muted">موقعیت</p>
          <Meters rows={report.occasions} max={catalogMax} />
        </Panel>
        <Panel title="بازار">
          <p className="text-label text-muted">جنسیت</p>
          <Meters rows={report.genders} max={catalogMax} />
          <p className="mt-4 text-label text-muted">غلظت</p>
          <Meters rows={report.concentrations} max={catalogMax} />
        </Panel>
        <Panel title="قیمت" className="lg:col-span-2">
          {report.price ? (
            <>
              <p className="text-pretty text-body">
                از {millionToman(report.price.min)} تا {millionToman(report.price.max)}، میانه {millionToman(report.price.median)}.
              </p>
              <p className="mt-3 text-label text-muted">چند عطر در این سقف جا می‌شود</p>
              <Meters rows={report.budgets.map((budget) => ({ label: budget.label, count: budget.count }))} max={Math.max(1, report.price.priced)} />
            </>
          ) : (
            <p className="text-body text-muted">قیمتی ثبت نشده.</p>
          )}
        </Panel>
      </div>

      <section className="mt-10">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <h2 className="text-title font-semibold">استفاده</h2>
          <div className="flex gap-2">
            <RangeLink days={7} current={days} />
            <RangeLink days={30} current={days} />
          </div>
          <p className="text-label text-muted">{usage ? `${faNum(usage.total)} رویداد` : "جدول رویداد هنوز آماده نیست"}</p>
        </div>
        {usage && usage.total === 0 ? (
          <p className="mt-3 text-body text-muted">در این بازه بازدیدی ثبت نشده. با گشتن در سایت، این بخش پر می‌شود.</p>
        ) : null}
        {usagePanels.length > 0 ? (
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            {usagePanels.map((panel) => (
              <Panel key={panel.title} title={panel.title}>
                {panel.body}
              </Panel>
            ))}
          </div>
        ) : null}
      </section>
    </div>
  );
}

function Panel({ title, className, children }: { title: string; className?: string; children: React.ReactNode }) {
  return (
    <section className={`rounded-panel border border-line bg-card p-4${className ? ` ${className}` : ""}`}>
      <h2 className="text-title font-semibold">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function Meters({ rows, max }: { rows: CountRow[]; max?: number }) {
  if (rows.length === 0) return <p className="text-body text-muted">موردی نیست.</p>;
  const scale = max ?? Math.max(1, ...rows.map((row) => row.count));
  return (
    <ul className="mt-2 space-y-2">
      {rows.map((row) => (
        <li key={row.label} className="grid grid-cols-[minmax(4.75rem,7.5rem)_minmax(0,1fr)_2.25rem] items-center gap-3">
          <span className="truncate text-label">{row.label}</span>
          <span className="h-1.5 overflow-hidden rounded-full bg-desk">
            <span
              className="block h-full rounded-full bg-ink"
              style={{ width: row.count === 0 ? "0%" : `${Math.max(6, (row.count / scale) * 100)}%` }}
            />
          </span>
          <span className="text-start text-label text-muted tabular-nums">{faNum(row.count)}</span>
        </li>
      ))}
    </ul>
  );
}

function Coverage({ label, percent, gaps }: { label: string; percent: number; gaps: GapRow[] }) {
  const shown = gaps.slice(0, 4);
  return (
    <li className="grid gap-2 px-4 py-3 sm:grid-cols-[10rem_minmax(0,1fr)] sm:items-center sm:gap-4">
      <div>
        <p className="text-body">{label}</p>
        <p className={percent < 100 ? "text-label font-medium text-danger tabular-nums" : "text-label text-muted tabular-nums"}>
          {faNum(percent)}٪
        </p>
      </div>
      <div className="min-w-0">
        <span className="block h-1.5 overflow-hidden rounded-full bg-desk">
          <span className="block h-full rounded-full bg-ink" style={{ width: `${percent}%` }} />
        </span>
        {shown.length > 0 ? (
          <p className="mt-1.5 text-pretty text-label text-muted">
            {shown.map((gap, index) => (
              <span key={gap.slug}>
                {index > 0 ? "، " : ""}
                <Link href={gap.href} className="text-ink hover:underline">
                  {gap.nameFa}
                </Link>
              </span>
            ))}
            {gaps.length > shown.length ? ` و ${faNum(gaps.length - shown.length)} تای دیگر` : ""}
          </p>
        ) : (
          <p className="mt-1.5 text-label text-faint">کمبودی نیست.</p>
        )}
      </div>
    </li>
  );
}

function usageBlocks(usage: UsageReport) {
  const blocks: { title: string; body: React.ReactNode }[] = [];
  if (usage.demand.length > 0) {
    blocks.push({
      title: "شکاف تقاضا",
      body: (
        <ul className="space-y-2">
          {usage.demand.map((row) => (
            <li key={row.slug} className="flex items-baseline justify-between gap-3">
              <Link href="/admin/shops" className="text-body font-medium hover:underline">
                {row.nameFa}
              </Link>
              <span className="text-label text-danger">{row.gap}</span>
            </li>
          ))}
        </ul>
      ),
    });
  }
  if (usage.unseen.length > 0) blocks.push({ title: "پیشنهادِ باز نشده", body: <UsageList rows={usage.unseen} /> });
  if (usage.perfumes.length > 0) blocks.push({ title: "عطرهای پربازدید", body: <UsageList rows={usage.perfumes} /> });
  if (usage.brands.length > 0) blocks.push({ title: "برندهای پربازدید", body: <UsageList rows={usage.brands} /> });
  if (usage.sections.length > 0) blocks.push({ title: "بخش‌ها", body: <UsageList rows={usage.sections} /> });
  return blocks;
}

function UsageList({ rows }: { rows: UsageRow[] }) {
  return (
    <ul className="space-y-2">
      {rows.map((row) => (
        <li key={row.label} className="flex items-baseline gap-3">
          {row.href ? (
            <Link href={row.href} className="text-body hover:underline">
              {row.label}
            </Link>
          ) : (
            <span className="text-body">{row.label}</span>
          )}
          <span className="text-label text-muted">{faNum(row.count)}</span>
        </li>
      ))}
    </ul>
  );
}

function RangeLink({ days, current }: { days: number; current: number }) {
  const active = days === current;
  return (
    <Link
      href={days === 7 ? "/admin/reports" : "/admin/reports?days=30"}
      aria-current={active ? "page" : undefined}
      className={
        active
          ? "inline-flex min-h-9 items-center rounded-full bg-ink px-3 text-label text-paper"
          : "inline-flex min-h-9 items-center rounded-full border border-line px-3 text-label"
      }
    >
      {faNum(days)} روز
    </Link>
  );
}
