import type { Metadata } from "next";
import Link from "next/link";
import { CountBars, CoverageRings, ShareDonut, type ChartPoint } from "@/app/admin/report-charts";
import { buildCatalogReport, type GapRow } from "@/lib/admin/catalog-report";
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
  const coverage = [
    { label: "عکس", percent: report.coverage.image, gaps: report.gaps.image },
    { label: "موجودی تأییدشده", percent: report.coverage.stock, gaps: report.gaps.stock },
    { label: "قیمت تازه", percent: report.coverage.fresh, gaps: report.gaps.fresh },
    { label: "اطمینان کافی", percent: report.coverage.confidence, gaps: report.gaps.confidence },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-balance">گزارش</h1>
      <p className="mt-2 max-w-2xl text-pretty text-sm text-muted-foreground">
        {faNum(report.total)} عطر. اول جاهایی که داده کم است، بعد ترکیب کاتالوگ، بعد استفادهٔ {faNum(days)} روز.
      </p>

      <section className="mt-6 rounded-surface border border-border bg-card p-4">
        <h2 className="text-base font-semibold">پوشش داده</h2>
        <div className="mt-3 grid items-center gap-6 lg:grid-cols-[18rem_minmax(0,1fr)]">
          <CoverageRings rows={coverage.map(({ label, percent }) => ({ label, percent }))} />
          <ul className="divide-y divide-border">
            {coverage.map((item) => (
              <Coverage key={item.label} label={item.label} percent={item.percent} gaps={item.gaps} />
            ))}
          </ul>
        </div>
      </section>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Panel title="برندها">
          <CountBars title="تعداد عطر هر برند" rows={report.brands} valueLabel="عطر" />
        </Panel>
        <Panel title="آکوردهای پرتکرار">
          <CountBars title="آکوردهای پرتکرار" rows={report.accords} valueLabel="عطر" />
          <p className="mt-3 text-pretty text-xs text-muted-foreground">
            {report.rareAccords.length === 0
              ? "آکورد تک‌عطر نیست."
              : `فقط روی یک عطر: ${report.rareAccords.map((row) => row.label).join("، ")}`}
          </p>
        </Panel>
        <Panel title="فصل و موقعیت">
          <p className="mb-2 text-xs text-muted-foreground">فصل</p>
          <CountBars title="فصل‌ها" rows={report.seasons} valueLabel="عطر" />
          <p className="mb-2 mt-4 text-xs text-muted-foreground">موقعیت</p>
          <CountBars title="موقعیت‌ها" rows={report.occasions} valueLabel="عطر" />
        </Panel>
        <Panel title="بازار">
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <p className="mb-2 text-xs text-muted-foreground">جنسیت</p>
              <ShareDonut title="جنسیت بازار" rows={report.genders} centerLabel="عطر" />
            </div>
            <div>
              <p className="mb-2 text-xs text-muted-foreground">غلظت</p>
              <ShareDonut title="غلظت" rows={report.concentrations} centerLabel="عطر" />
            </div>
          </div>
        </Panel>
        <Panel title="قیمت" className="lg:col-span-2">
          {report.price ? (
            <>
              <p className="text-pretty text-sm">
                از {millionToman(report.price.min)} تا {millionToman(report.price.max)}، میانه {millionToman(report.price.median)}.
              </p>
              <p className="mb-2 mt-4 text-xs text-muted-foreground">چند عطر در این سقف جا می‌شود</p>
              <CountBars
                title="سقف قیمت"
                rows={report.budgets.map((budget) => ({ label: budget.label, count: budget.count }))}
                valueLabel="عطر"
                orientation="vertical"
              />
            </>
          ) : (
            <p className="text-sm text-muted-foreground">قیمتی ثبت نشده.</p>
          )}
        </Panel>
      </div>

      <section className="mt-10">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <h2 className="text-base font-semibold">استفاده</h2>
          <div className="flex gap-2">
            <RangeLink days={7} current={days} />
            <RangeLink days={30} current={days} />
          </div>
          <p className="text-xs text-muted-foreground">{usage ? `${faNum(usage.total)} رویداد` : "جدول رویداد هنوز آماده نیست"}</p>
        </div>
        {usage && usage.total === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">در این بازه بازدیدی ثبت نشده. با گشتن در سایت، این بخش پر می‌شود.</p>
        ) : null}
        {usage && usage.total > 0 ? <UsageGrid usage={usage} /> : null}
      </section>
    </div>
  );
}

function Panel({ title, className, children }: { title: string; className?: string; children: React.ReactNode }) {
  return (
    <section className={`rounded-surface border border-border bg-card p-4${className ? ` ${className}` : ""}`}>
      <h2 className="text-base font-semibold">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function Coverage({ label, percent, gaps }: { label: string; percent: number; gaps: GapRow[] }) {
  const shown = gaps.slice(0, 4);
  return (
    <li className="grid gap-1 py-3 sm:grid-cols-[9rem_minmax(0,1fr)] sm:items-baseline sm:gap-4">
      <p className="text-sm">
        {label}
        <span className={percent < 100 ? "ms-2 font-medium text-destructive tabular-nums" : "ms-2 text-muted-foreground tabular-nums"}>
          {faNum(percent)}٪
        </span>
      </p>
      {shown.length > 0 ? (
        <p className="text-pretty text-xs text-muted-foreground">
          {shown.map((gap, index) => (
            <span key={gap.slug}>
              {index > 0 ? "، " : ""}
              <Link href={gap.href} className="text-foreground hover:underline">
                {gap.nameFa}
              </Link>
            </span>
          ))}
          {gaps.length > shown.length ? ` و ${faNum(gaps.length - shown.length)} تای دیگر` : ""}
        </p>
      ) : (
        <p className="text-xs text-muted-foreground">کمبودی نیست.</p>
      )}
    </li>
  );
}

function UsageGrid({ usage }: { usage: UsageReport }) {
  const panels: { title: string; body: React.ReactNode }[] = [];
  if (usage.demand.length > 0) {
    panels.push({
      title: "شکاف تقاضا",
      body: (
        <ul className="space-y-2">
          {usage.demand.map((row) => (
            <li key={row.slug} className="flex items-baseline justify-between gap-3">
              <Link href="/admin/shops" className="text-sm font-medium hover:underline">
                {row.nameFa}
              </Link>
              <span className="text-xs text-destructive">{row.gap}</span>
            </li>
          ))}
        </ul>
      ),
    });
  }
  pushBars(panels, "پیشنهادِ باز نشده", usage.unseen, "پیشنهاد");
  pushBars(panels, "عطرهای پربازدید", usage.perfumes, "بازدید");
  pushBars(panels, "برندهای پربازدید", usage.brands, "بازدید");
  pushBars(panels, "بخش‌ها", usage.sections, "بازدید");
  if (panels.length === 0) return null;
  return (
    <div className="mt-4 grid gap-4 lg:grid-cols-2">
      {panels.map((panel) => (
        <Panel key={panel.title} title={panel.title}>
          {panel.body}
        </Panel>
      ))}
    </div>
  );
}

function pushBars(panels: { title: string; body: React.ReactNode }[], title: string, rows: UsageRow[], valueLabel: string) {
  if (rows.length === 0) return;
  const points: ChartPoint[] = rows.map((row) => ({ label: row.label, count: row.count, href: row.href }));
  panels.push({ title, body: <CountBars title={title} rows={points} valueLabel={valueLabel} /> });
}

function RangeLink({ days, current }: { days: number; current: number }) {
  const active = days === current;
  return (
    <Link
      href={days === 7 ? "/admin/reports" : "/admin/reports?days=30"}
      aria-current={active ? "page" : undefined}
      className={
        active
          ? "inline-flex h-9 items-center rounded-full bg-primary px-3 text-xs text-primary-foreground"
          : "inline-flex h-9 items-center rounded-full border border-border px-3 text-xs"
      }
    >
      {faNum(days)} روز
    </Link>
  );
}
