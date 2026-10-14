"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { saveArticle } from "@/app/admin/learn-actions";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { faDigits, isoToJalali, JALALI_MONTHS, todayIso } from "@/lib/jalali";
import { KNOWLEDGE_GROUPS, type KnowledgeEntry } from "@/lib/knowledge";
import { faNum } from "@/lib/format";

export function ArticleEditor({
  mode,
  entry,
  views = 0,
  nextSort = 0,
}: {
  mode: "create" | "edit";
  entry?: KnowledgeEntry;
  views?: number;
  nextSort?: number;
}) {
  const router = useRouter();
  const initialDate = isoToJalali(entry?.publishedOn ?? todayIso()) ?? { jy: 1405, jm: 1, jd: 1 };
  const [slug, setSlug] = useState(entry?.slug ?? "");
  const [title, setTitle] = useState(entry?.title ?? "");
  const [support, setSupport] = useState(entry?.support ?? "");
  const [ask, setAsk] = useState(entry?.ask ?? "");
  const [aliases, setAliases] = useState(entry?.aliases.join("، ") ?? "");
  const [group, setGroup] = useState(entry?.group ?? "basics");
  const [minutes, setMinutes] = useState(String(entry?.minutes ?? 3));
  const [summary, setSummary] = useState(entry?.summary ?? "");
  const [body, setBody] = useState(entry?.body.join("\n\n") ?? "");
  const [mythClaim, setMythClaim] = useState(entry?.myth?.claim ?? "");
  const [mythReality, setMythReality] = useState(entry?.myth?.reality ?? "");
  const [compare, setCompare] = useState(entry?.compare?.map((row) => `${row.label} | ${row.range}`).join("\n") ?? "");
  const [related, setRelated] = useState(entry?.related.join("، ") ?? "");
  const [active, setActive] = useState(entry?.active ?? true);
  const [sort] = useState(String(entry?.sort ?? nextSort));
  const [display, setDisplay] = useState(entry?.display ?? "row");
  const [year, setYear] = useState(String(initialDate.jy));
  const [month, setMonth] = useState(String(initialDate.jm));
  const [day, setDay] = useState(String(initialDate.jd));
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, setPending] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setSaved(false);
    const result = await saveArticle({
      mode,
      originalSlug: entry?.slug,
      slug,
      title,
      support,
      ask,
      aliases,
      group,
      minutes,
      summary,
      body,
      mythClaim,
      mythReality,
      compare,
      related,
      active,
      sort,
      display,
      year,
      month,
      day,
    });
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    if (mode === "create" && result.slug) {
      router.push(`/admin/learn/${result.slug}`);
      router.refresh();
      return;
    }
    setSaved(true);
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="mt-5 grid max-w-xl gap-4">
      <label className="block">
        <span className="text-sm text-muted-foreground">عنوان</span>
        <Input className="mt-1.5" value={title} onChange={(event) => setTitle(event.target.value)} />
      </label>
      {mode === "create" ? (
        <label className="block">
          <span className="text-sm text-muted-foreground">اسلاگ</span>
          <Input className="mt-1.5" dir="ltr" value={slug} onChange={(event) => setSlug(event.target.value)} />
        </label>
      ) : (
        <p className="text-sm text-muted-foreground" dir="ltr">
          {slug}
        </p>
      )}
      <label className="block">
        <span className="text-sm text-muted-foreground">خط زیر عنوان</span>
        <Input className="mt-1.5" value={support} onChange={(event) => setSupport(event.target.value)} />
      </label>
      <label className="block">
        <span className="text-sm text-muted-foreground">خلاصه</span>
        <div className="mt-1.5">
          <Textarea className="min-h-24" value={summary} onChange={(event) => setSummary(event.target.value)} />
        </div>
      </label>
      <label className="block">
        <span className="text-sm text-muted-foreground">متن</span>
        <div className="mt-1.5">
          <Textarea className="min-h-48" value={body} onChange={(event) => setBody(event.target.value)} />
        </div>
        <span className="mt-1 block text-sm text-muted-foreground">بین بندها یک خط خالی بگذار.</span>
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm text-muted-foreground">دسته</span>
          <div className="mt-1.5">
            <Select
              value={group}
              onChange={(event) => setGroup(event.target.value as KnowledgeEntry["group"])}
              options={KNOWLEDGE_GROUPS.map((item) => ({ value: item.id, label: item.label }))}
            />
          </div>
        </label>
        <label className="block">
          <span className="text-sm text-muted-foreground">دقیقهٔ خواندن</span>
          <Input className="mt-1.5" inputMode="numeric" value={minutes} onChange={(event) => setMinutes(event.target.value)} />
        </label>
      </div>
      <fieldset className="grid gap-2">
        <legend className="text-sm text-muted-foreground">تاریخ شمسی</legend>
        <div className="grid grid-cols-3 gap-2">
          <Select
            aria-label="روز"
            value={day}
            onChange={(event) => setDay(event.target.value)}
            options={Array.from({ length: 31 }, (_, index) => ({ value: String(index + 1), label: faDigits(index + 1) }))}
          />
          <Select
            aria-label="ماه"
            value={month}
            onChange={(event) => setMonth(event.target.value)}
            options={JALALI_MONTHS.map((name, index) => ({ value: String(index + 1), label: name }))}
          />
          <Select
            aria-label="سال"
            value={year}
            onChange={(event) => setYear(event.target.value)}
            options={Array.from({ length: 6 }, (_, index) => 1402 + index).map((item) => ({ value: String(item), label: faDigits(item) }))}
          />
        </div>
      </fieldset>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="grid gap-2">
          <span className="text-sm text-muted-foreground">نحوهٔ نمایش</span>
          <Tabs value={display} defaultValue="row" onValueChange={(next) => setDisplay(next as KnowledgeEntry["display"])}>
            <TabsList aria-label="نحوه نمایش" className="w-full">
              <TabsTrigger value="card" className="flex-1">
                کارت شاخص
              </TabsTrigger>
              <TabsTrigger value="row" className="flex-1">
                ردیف
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm text-muted-foreground">در دانستنی‌ها دیده شود</span>
          <Switch checked={active} onCheckedChange={setActive} aria-label="وضعیت مقاله" />
        </div>
      </div>
      <p className="text-pretty text-sm text-muted-foreground">
        کارت شاخص بالای دانستنی‌ها می‌آید. ردیف داخل دستهٔ خودش است.
        {mode === "edit" ? ` تا امروز ${faNum(views)} بازدید.` : ""}
      </p>
      <label className="block">
        <span className="text-sm text-muted-foreground">سؤال دستیار</span>
        <Input className="mt-1.5" value={ask} onChange={(event) => setAsk(event.target.value)} />
      </label>
      <details className="rounded-surface border border-border bg-card px-3.5 py-3">
        <summary className="cursor-pointer text-sm font-medium">نام‌های دیگر، مقایسه، پیوند</summary>
        <div className="mt-3 grid gap-3">
          <label className="block">
            <span className="text-sm text-muted-foreground">نام‌های دیگر</span>
            <Input className="mt-1.5" value={aliases} onChange={(event) => setAliases(event.target.value)} />
          </label>
          <label className="block">
            <span className="text-sm text-muted-foreground">باور رایج</span>
            <Input className="mt-1.5" value={mythClaim} onChange={(event) => setMythClaim(event.target.value)} />
          </label>
          <label className="block">
            <span className="text-sm text-muted-foreground">واقعیت</span>
            <Input className="mt-1.5" value={mythReality} onChange={(event) => setMythReality(event.target.value)} />
          </label>
          <label className="block">
            <span className="text-sm text-muted-foreground">جدول مقایسه</span>
            <div className="mt-1.5">
              <Textarea className="min-h-24" value={compare} onChange={(event) => setCompare(event.target.value)} placeholder={"ادوتویلت | حدود ۵ تا ۱۵٪"} />
            </div>
          </label>
          <label className="block">
            <span className="text-sm text-muted-foreground">مدخل‌های مرتبط</span>
            <Input className="mt-1.5" dir="ltr" value={related} onChange={(event) => setRelated(event.target.value)} />
          </label>
        </div>
      </details>
      {error ? <Alert variant="destructive">{error}</Alert> : null}
      {saved ? <Alert variant="success">ذخیره شد.</Alert> : null}
      <Button type="submit" size="md" disabled={pending} className="w-fit">
        {pending ? "در حال ذخیره" : mode === "create" ? "افزودن مقاله" : "ذخیره"}
      </Button>
    </form>
  );
}
