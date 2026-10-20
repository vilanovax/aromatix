"use client";

import { useMemo, useRef, useState } from "react";
import { applyOfferFeedAction } from "@/app/admin/offer-actions";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Field } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { formatToman } from "@/lib/utils";
import { faNum } from "@/lib/format";
import type { OfferApplyReport } from "@/lib/offers";

const PLACEHOLDER = `shop,perfume,price,stock,href
narsiso,khamrah,3650000,in_stock,https://narsiso.com/product`;

export function OfferDesk({
  shops,
  initialShop = "",
}: {
  shops: { slug: string; nameFa: string }[];
  initialShop?: string;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [text, setText] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [mode, setMode] = useState<"patch" | "snapshot">("patch");
  const [shop, setShop] = useState(initialShop);
  const [acceptJumps, setAcceptJumps] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<OfferApplyReport | null>(null);
  const download = shop ? `/api/admin/offers?shop=${encodeURIComponent(shop)}` : "/api/admin/offers";
  const shopOptions = useMemo(() => [{ value: "", label: "فروشگاه‌های داخل فایل" }, ...shops.map((item) => ({ value: item.slug, label: item.nameFa }))], [shops]);

  async function submit(forceJumps = false) {
    setPending(true);
    setError(null);
    const result = await applyOfferFeedAction({ text, mode, shop, acceptJumps: forceJumps || acceptJumps });
    setPending(false);
    if (!result.ok) {
      setReport(null);
      setError(result.error);
      return;
    }
    setReport(result.report);
  }

  async function onFile(file: File | undefined) {
    if (!file) return;
    setFileName(file.name);
    setText(await file.text());
    setReport(null);
    setError(null);
  }

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        void submit(false);
      }}
    >
      <Card className="grid gap-4 p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h2 className="text-title font-semibold">قیمت‌های فعلی</h2>
            <p className="mt-1 text-pretty text-label text-muted-foreground">دانلود کن، عددها را عوض کن، بعد همین پایین برگردان.</p>
          </div>
          <a
            href={download}
            className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-control border border-input bg-transparent px-4 text-sm font-semibold text-foreground hover:bg-accent"
          >
            دانلود
          </a>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="محدوده" htmlFor="offer-shop" hint="خالی یعنی هر ردیف، فروشگاه خودش را دارد.">
            <Select id="offer-shop" value={shop} options={shopOptions} onChange={(event) => setShop(event.target.value)} />
          </Field>
          <Field label="حالت" htmlFor="offer-mode" hint={mode === "patch" ? "ردیفی که در فایل نیست دست نمی‌خورد." : "ردیف غایب حذف نمی‌شود؛ موجودی‌اش تأییدنشده می‌ماند."}>
            <Select
              id="offer-mode"
              value={mode}
              options={[
                { value: "patch", label: "فقط همین ردیف‌ها" },
                { value: "snapshot", label: "تصویر کامل" },
              ]}
              onChange={(event) => setMode(event.target.value === "snapshot" ? "snapshot" : "patch")}
            />
          </Field>
        </div>

        <Field label="ردیف‌ها" htmlFor="offer-text" hint="ستون‌ها: shop، perfume، price، stock. تاریخ خالی یعنی همین لحظه. موجودی خالی، وضعیت قبلی را نگه می‌دارد.">
          <Textarea
            id="offer-text"
            value={text}
            rows={8}
            dir="ltr"
            spellCheck={false}
            placeholder={PLACEHOLDER}
            onChange={(event) => {
              setFileName(null);
              setText(event.target.value);
            }}
          />
        </Field>

        <div className="grid gap-3 border-t border-border pt-4">
          <Checkbox checked={acceptJumps} onCheckedChange={setAcceptJumps} label="پرش بیش از ۴۰٪ را هم اعمال کن" description="خاموش باشد، آن ردیف‌ها منتشر نمی‌شوند و در نتیجه می‌آیند." />
          <div className="flex flex-wrap items-center gap-2">
            <input
              ref={fileRef}
              type="file"
              accept=".csv,.json,text/csv,application/json"
              className="sr-only"
              onChange={(event) => {
                const file = event.target.files?.[0];
                event.target.value = "";
                void onFile(file);
              }}
            />
            <Button type="button" variant="outline" size="md" onClick={() => fileRef.current?.click()}>
              انتخاب فایل
            </Button>
            {fileName ? (
              <span dir="ltr" className="min-w-0 flex-1 truncate text-start text-label text-muted-foreground">
                {fileName}
              </span>
            ) : (
              <span className="flex-1" />
            )}
            <Button type="submit" size="md" disabled={pending || text.trim().length === 0}>
              {pending ? "در حال اعمال" : "اعمال قیمت‌ها"}
            </Button>
          </div>
        </div>
      </Card>

      {error ? <Alert variant="destructive">{error}</Alert> : null}
      {report ? <OfferReport report={report} pending={pending} onAcceptJumps={() => void submit(true)} /> : null}
    </form>
  );
}

function summary(report: OfferApplyReport) {
  const parts = [`${faNum(report.applied)} ردیف اعمال شد`, `${faNum(report.unchanged)} تا بی‌تغییر ماند`];
  if (report.unconfirmed > 0) parts.push(`${faNum(report.unconfirmed)} پیشنهاد تأییدنشده ماند`);
  return `${parts.join(". ")}.`;
}

function OfferReport({ report, pending, onAcceptJumps }: { report: OfferApplyReport; pending: boolean; onAcceptJumps: () => void }) {
  const quiet = report.applied === 0 && report.unconfirmed === 0 && report.held.length === 0 && report.skipped.length === 0;
  return (
    <Card className="grid gap-3 p-4 sm:p-5">
      <h2 className="text-title font-semibold">{quiet ? "چیزی عوض نشد" : "نتیجه"}</h2>
      <p className="text-pretty text-body text-muted-foreground">{quiet ? "این فایل با قیمت‌های فعلی یکی است." : summary(report)}</p>
      {report.held.length > 0 ? (
        <div className="grid gap-2">
          <Alert variant="warning" title="این پرش‌ها منتشر نشد">
            تفاوت قیمت بیشتر از ۴۰٪ بود.
          </Alert>
          <ul className="grid gap-2">
            {report.held.map((row) => (
              <li key={`${row.shop}/${row.perfume}`} className="text-pretty text-label text-muted-foreground">
                {row.perfumeName} در {row.shopName}: {formatToman(row.previous)} به {formatToman(row.next)}
              </li>
            ))}
          </ul>
          <Button type="button" variant="outline" size="md" className="w-fit" disabled={pending} onClick={onAcceptJumps}>
            اعمال همین پرش‌ها
          </Button>
        </div>
      ) : null}
      {report.skipped.length > 0 ? (
        <ul className="grid gap-1">
          {report.skipped.map((row) => (
            <li key={`${row.line}-${row.reason}`} className="text-pretty text-label text-destructive">
              سطر {faNum(row.line)}: {row.reason}
            </li>
          ))}
        </ul>
      ) : null}
    </Card>
  );
}
