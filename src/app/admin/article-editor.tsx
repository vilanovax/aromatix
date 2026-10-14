"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { saveArticle } from "@/app/admin/learn-actions";
import { Button } from "@/components/ui/button";
import { faDigits, isoToJalali, JALALI_MONTHS, todayIso } from "@/lib/jalali";
import { KNOWLEDGE_GROUPS, type KnowledgeEntry } from "@/lib/knowledge";
import { cn, faNum } from "@/lib/format";

const control =
  "h-11 w-full rounded-field border border-input bg-field shadow-field px-3 text-body text-foreground outline-none focus-visible:outline-2 focus-visible:outline-ring";

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
        <span className="text-label text-muted-foreground">عنوان</span>
        <input className={`${control} mt-1.5`} value={title} onChange={(event) => setTitle(event.target.value)} />
      </label>
      {mode === "create" ? (
        <label className="block">
          <span className="text-label text-muted-foreground">اسلاگ</span>
          <input className={`${control} mt-1.5`} dir="ltr" value={slug} onChange={(event) => setSlug(event.target.value)} />
        </label>
      ) : (
        <p className="text-label text-muted-foreground" dir="ltr">
          {slug}
        </p>
      )}
      <label className="block">
        <span className="text-label text-muted-foreground">خط زیر عنوان</span>
        <input className={`${control} mt-1.5`} value={support} onChange={(event) => setSupport(event.target.value)} />
      </label>
      <label className="block">
        <span className="text-label text-muted-foreground">خلاصه</span>
        <textarea className={`${control} mt-1.5 min-h-24 py-3 leading-7`} value={summary} onChange={(event) => setSummary(event.target.value)} />
      </label>
      <label className="block">
        <span className="text-label text-muted-foreground">متن</span>
        <textarea className={`${control} mt-1.5 min-h-48 py-3 leading-7`} value={body} onChange={(event) => setBody(event.target.value)} />
        <span className="mt-1 block text-label text-muted-foreground">بین بندها یک خط خالی بگذار.</span>
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="text-label text-muted-foreground">دسته</span>
          <select className={`${control} mt-1.5`} value={group} onChange={(event) => setGroup(event.target.value as KnowledgeEntry["group"])}>
            {KNOWLEDGE_GROUPS.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-label text-muted-foreground">دقیقهٔ خواندن</span>
          <input className={`${control} mt-1.5`} inputMode="numeric" value={minutes} onChange={(event) => setMinutes(event.target.value)} />
        </label>
      </div>
      <fieldset className="grid gap-2">
        <legend className="text-label text-muted-foreground">تاریخ شمسی</legend>
        <div className="grid grid-cols-3 gap-2">
          <select className={control} aria-label="روز" value={day} onChange={(event) => setDay(event.target.value)}>
            {Array.from({ length: 31 }, (_, index) => (
              <option key={index + 1} value={index + 1}>
                {faDigits(index + 1)}
              </option>
            ))}
          </select>
          <select className={control} aria-label="ماه" value={month} onChange={(event) => setMonth(event.target.value)}>
            {JALALI_MONTHS.map((name, index) => (
              <option key={name} value={index + 1}>
                {name}
              </option>
            ))}
          </select>
          <select className={control} aria-label="سال" value={year} onChange={(event) => setYear(event.target.value)}>
            {Array.from({ length: 6 }, (_, index) => 1402 + index).map((item) => (
              <option key={item} value={item}>
                {faDigits(item)}
              </option>
            ))}
          </select>
        </div>
      </fieldset>
      <div className="grid gap-3 sm:grid-cols-2">
        <fieldset className="grid gap-2">
          <legend className="text-label text-muted-foreground">نحوهٔ نمایش</legend>
          <div className="flex rounded-control border border-border bg-card p-1" role="group" aria-label="نحوه نمایش">
            <button
              type="button"
              aria-pressed={display === "card"}
              onClick={() => setDisplay("card")}
              className={cn("min-h-10 flex-1 rounded-control text-label", display === "card" ? "bg-primary font-medium text-primary-foreground" : "text-muted-foreground")}
            >
              کارت شاخص
            </button>
            <button
              type="button"
              aria-pressed={display === "row"}
              onClick={() => setDisplay("row")}
              className={cn("min-h-10 flex-1 rounded-control text-label", display === "row" ? "bg-primary font-medium text-primary-foreground" : "text-muted-foreground")}
            >
              ردیف
            </button>
          </div>
        </fieldset>
        <fieldset className="grid gap-2">
          <legend className="text-label text-muted-foreground">وضعیت</legend>
          <div className="flex rounded-control border border-border bg-card p-1" role="group" aria-label="وضعیت مقاله">
            <button
              type="button"
              aria-pressed={active}
              onClick={() => setActive(true)}
              className={cn("min-h-10 flex-1 rounded-control text-label", active ? "bg-primary font-medium text-primary-foreground" : "text-muted-foreground")}
            >
              فعال
            </button>
            <button
              type="button"
              aria-pressed={!active}
              onClick={() => setActive(false)}
              className={cn("min-h-10 flex-1 rounded-control text-label", !active ? "bg-primary font-medium text-primary-foreground" : "text-muted-foreground")}
            >
              غیرفعال
            </button>
          </div>
        </fieldset>
      </div>
      <p className="text-pretty text-label text-muted-foreground">
        کارت شاخص بالای دانستنی‌ها می‌آید. ردیف داخل دستهٔ خودش است.
        {mode === "edit" ? ` تا امروز ${faNum(views)} بازدید.` : ""}
      </p>
      <label className="block">
        <span className="text-label text-muted-foreground">سؤال دستیار</span>
        <input className={`${control} mt-1.5`} value={ask} onChange={(event) => setAsk(event.target.value)} />
      </label>
      <details className="rounded-surface border border-border bg-card px-3.5 py-3">
        <summary className="cursor-pointer text-body font-medium">نام‌های دیگر، مقایسه، پیوند</summary>
        <div className="mt-3 grid gap-3">
          <label className="block">
            <span className="text-label text-muted-foreground">نام‌های دیگر</span>
            <input className={`${control} mt-1.5`} value={aliases} onChange={(event) => setAliases(event.target.value)} />
          </label>
          <label className="block">
            <span className="text-label text-muted-foreground">باور رایج</span>
            <input className={`${control} mt-1.5`} value={mythClaim} onChange={(event) => setMythClaim(event.target.value)} />
          </label>
          <label className="block">
            <span className="text-label text-muted-foreground">واقعیت</span>
            <input className={`${control} mt-1.5`} value={mythReality} onChange={(event) => setMythReality(event.target.value)} />
          </label>
          <label className="block">
            <span className="text-label text-muted-foreground">جدول مقایسه</span>
            <textarea
              className={`${control} mt-1.5 min-h-24 py-3 leading-7`}
              value={compare}
              onChange={(event) => setCompare(event.target.value)}
              placeholder={"ادوتویلت | حدود ۵ تا ۱۵٪"}
            />
          </label>
          <label className="block">
            <span className="text-label text-muted-foreground">مدخل‌های مرتبط</span>
            <input className={`${control} mt-1.5`} dir="ltr" value={related} onChange={(event) => setRelated(event.target.value)} />
          </label>
        </div>
      </details>
      {error ? (
        <p role="alert" className="text-label text-destructive">
          {error}
        </p>
      ) : saved ? (
        <p role="status" className="text-label text-muted-foreground">
          ذخیره شد.
        </p>
      ) : null}
      <Button type="submit" size="md" disabled={pending} className="w-fit">
        {pending ? "در حال ذخیره" : mode === "create" ? "افزودن مقاله" : "ذخیره"}
      </Button>
    </form>
  );
}
