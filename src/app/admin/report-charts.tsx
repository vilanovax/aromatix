"use client";

import { useRouter } from "next/navigation";
import { BarChart } from "@/components/charts/bar-chart";
import { PieChart } from "@/components/charts/pie-chart";
import { RadialChart } from "@/components/charts/radial-chart";
import { fullFa } from "@/lib/chart-utils";

export type ChartPoint = { label: string; count: number; href?: string };

const countFormat = (value: number) => fullFa(value);

export function CountBars({
  title,
  rows,
  valueLabel = "تعداد",
  orientation = "horizontal",
}: {
  title: string;
  rows: ChartPoint[];
  valueLabel?: string;
  orientation?: "horizontal" | "vertical";
}) {
  const router = useRouter();
  const linked = rows.some((row) => row.href);
  if (rows.length === 0) return <p className="text-sm text-muted-foreground">موردی نیست.</p>;
  return (
    <BarChart
      title={title}
      description={linked ? "با انتخاب میله، صفحهٔ همان مورد باز می‌شود." : undefined}
      data={rows.map((row) => ({ name: row.label, count: row.count, href: row.href ?? "" }))}
      x="name"
      series={[{ key: "count", label: valueLabel }]}
      orientation={orientation}
      legend={false}
      grid={false}
      showValues
      format={countFormat}
      axisFormat={countFormat}
      onSelect={
        linked
          ? (row) => {
              if (typeof row.href === "string" && row.href) router.push(row.href);
            }
          : undefined
      }
    />
  );
}

export function ShareDonut({ title, rows, centerLabel }: { title: string; rows: ChartPoint[]; centerLabel: string }) {
  const total = rows.reduce((sum, row) => sum + row.count, 0);
  if (total === 0) return <p className="text-sm text-muted-foreground">موردی نیست.</p>;
  return (
    <PieChart
      title={title}
      variant="donut"
      size={200}
      sort={false}
      data={rows.map((row) => ({ label: row.label, value: row.count }))}
      centerLabel={centerLabel}
      centerValue={fullFa(total)}
      format={countFormat}
    />
  );
}

export function CoverageRings({ rows }: { rows: { label: string; percent: number }[] }) {
  const weakest = rows.reduce((min, row) => Math.min(min, row.percent), 100);
  return (
    <RadialChart
      title="پوشش داده"
      description="هر حلقه سهم عطرهایی است که آن داده را دارند. عدد وسط، کمترین پوشش است."
      size={210}
      data={rows.map((row) => ({ label: row.label, value: row.percent, max: 100 }))}
      centerValue={`${fullFa(weakest)}٪`}
      centerLabel="کمترین"
      format={countFormat}
    />
  );
}
