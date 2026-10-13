"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { saveArticle } from "@/app/admin/learn-actions";
import { Button } from "@/components/Button";
import { faDigits, isoToJalali, JALALI_MONTHS, todayIso } from "@/lib/jalali";
import { KNOWLEDGE_GROUPS, type KnowledgeEntry } from "@/lib/knowledge";
import { cn, faNum } from "@/lib/format";

const control =
  "min-h-12 w-full rounded-control border border-line bg-card px-3 text-body text-ink outline-none focus-visible:outline-2 focus-visible:outline-ink";

export function ArticleEditor({
  mode,
  entry,
  views = 0,
}: {
  mode: "create" | "edit";
  entry?: KnowledgeEntry;
  views?: number;
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
  const [noteNames, setNoteNames] = useState(entry?.noteNames?.join("، ") ?? "");
  const [accordNames, setAccordNames] = useState(entry?.accordNames?.join("، ") ?? "");
  const [concentrationLabels, setConcentrationLabels] = useState(entry?.concentrationLabels?.join("، ") ?? "");
  const [mark, setMark] = useState(entry?.mark ?? "");
  const [active, setActive] = useState(entry?.active ?? true);
  const [sort, setSort] = useState(String(entry?.sort ?? 0));
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
      noteNames,
      accordNames,
      concentrationLabels,
      mark,
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
        <span className="text-label text-muted">عنوان</span>
        <input className={`${control} mt-1.5`} value={title} onChange={(event) => setTitle(event.target.value)} />
      </label>
      <label className="block">
        <span className="text-label text-muted">اسلاگ</span>
        <input
          className={`${control} mt-1.5`}
          dir="ltr"
          value={slug}
          disabled={mode === "edit"}
          onChange={(event) => setSlug(event.target.value)}
        />
      </label>
      <label className="block">
        <span className="text-label text-muted">خط زیر عنوان</span>
        <input className={`${control} mt-1.5`} value={support} onChange={(event) => setSupport(event.target.value)} />
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="text-label text-muted">دسته</span>
          <select className={`${control} mt-1.5`} value={group} onChange={(event) => setGroup(event.target.value as KnowledgeEntry["group"])}>
            {KNOWLEDGE_GROUPS.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-label text-muted">دقیقهٔ خواندن</span>
          <input className={`${control} mt-1.5`} inputMode="numeric" value={minutes} onChange={(event) => setMinutes(event.target.value)} />
        </label>
      </div>
      <fieldset className="grid gap-2">
        <legend className="text-label text-muted">تاریخ شمسی</legend>
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
      <fieldset className="grid gap-2">
        <legend className="text-label text-muted">نحوهٔ نمایش</legend>
        <div className="flex rounded-control border border-line bg-card p-1" role="group" aria-label="نحوه نمایش">
          <button
            type="button"
            aria-pressed={display === "card"}
            onClick={() => setDisplay("card")}
            className={cn("min-h-10 flex-1 rounded-control text-label", display === "card" ? "bg-ink font-medium text-paper" : "text-muted")}
          >
            کارت شاخص
          </button>
          <button
            type="button"
            aria-pressed={display === "row"}
            onClick={() => setDisplay("row")}
            className={cn("min-h-10 flex-1 rounded-control text-label", display === "row" ? "bg-ink font-medium text-paper" : "text-muted")}
          >
            ردیف
          </button>
        </div>
        <p className="text-pretty text-label text-faint">کارت شاخص بالای دانستنی‌ها می‌آید. ردیف داخل دستهٔ خودش است.</p>
      </fieldset>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="text-label text-muted">ترتیب</span>
          <input className={`${control} mt-1.5`} inputMode="numeric" value={sort} onChange={(event) => setSort(event.target.value)} />
        </label>
        <fieldset className="grid content-end gap-2">
          <legend className="text-label text-muted">وضعیت</legend>
          <div className="flex rounded-control border border-line bg-card p-1" role="group" aria-label="وضعیت مقاله">
            <button
              type="button"
              aria-pressed={active}
              onClick={() => setActive(true)}
              className={cn("min-h-10 flex-1 rounded-control text-label", active ? "bg-ink font-medium text-paper" : "text-muted")}
            >
              فعال
            </button>
            <button
              type="button"
              aria-pressed={!active}
              onClick={() => setActive(false)}
              className={cn("min-h-10 flex-1 rounded-control text-label", !active ? "bg-ink font-medium text-paper" : "text-muted")}
            >
              غیرفعال
            </button>
          </div>
        </fieldset>
      </div>
      {mode === "edit" ? <p className="text-label text-faint">تا امروز {faNum(views)} بازدید ثبت شده.</p> : null}
      <label className="block">
        <span className="text-label text-muted">خلاصه</span>
        <textarea className={`${control} mt-1.5 min-h-24 py-3 leading-7`} value={summary} onChange={(event) => setSummary(event.target.value)} />
      </label>
      <label className="block">
        <span className="text-label text-muted">متن</span>
        <textarea className={`${control} mt-1.5 min-h-48 py-3 leading-7`} value={body} onChange={(event) => setBody(event.target.value)} />
        <span className="mt-1 block text-label text-faint">بین بندها یک خط خالی بگذار.</span>
      </label>
      <label className="block">
        <span className="text-label text-muted">سؤال دستیار</span>
        <input className={`${control} mt-1.5`} value={ask} onChange={(event) => setAsk(event.target.value)} />
      </label>
      <label className="block">
        <span className="text-label text-muted">نام‌های دیگر</span>
        <input className={`${control} mt-1.5`} value={aliases} onChange={(event) => setAliases(event.target.value)} />
      </label>
      <div className="grid gap-3">
        <label className="block">
          <span className="text-label text-muted">باور رایج</span>
          <input className={`${control} mt-1.5`} value={mythClaim} onChange={(event) => setMythClaim(event.target.value)} />
        </label>
        <label className="block">
          <span className="text-label text-muted">واقعیت</span>
          <input className={`${control} mt-1.5`} value={mythReality} onChange={(event) => setMythReality(event.target.value)} />
        </label>
      </div>
      <label className="block">
        <span className="text-label text-muted">جدول مقایسه</span>
        <textarea
          className={`${control} mt-1.5 min-h-24 py-3 leading-7`}
          dir="rtl"
          value={compare}
          onChange={(event) => setCompare(event.target.value)}
          placeholder={"ادوتویلت | حدود ۵ تا ۱۵٪"}
        />
      </label>
      <label className="block">
        <span className="text-label text-muted">مدخل‌های مرتبط</span>
        <input className={`${control} mt-1.5`} dir="ltr" value={related} onChange={(event) => setRelated(event.target.value)} />
      </label>
      <label className="block">
        <span className="text-label text-muted">نت‌ها، آکوردها، غلظت‌ها</span>
        <input className={`${control} mt-1.5`} value={noteNames} placeholder="نت‌ها" onChange={(event) => setNoteNames(event.target.value)} />
        <input className={`${control} mt-2`} value={accordNames} placeholder="آکوردها" onChange={(event) => setAccordNames(event.target.value)} />
        <input
          className={`${control} mt-2`}
          value={concentrationLabels}
          placeholder="غلظت‌ها"
          onChange={(event) => setConcentrationLabels(event.target.value)}
        />
      </label>
      <label className="block">
        <span className="text-label text-muted">رنگ نشانه</span>
        <input className={`${control} mt-1.5`} dir="ltr" value={mark} placeholder="#1A1420" onChange={(event) => setMark(event.target.value)} />
      </label>
      {error ? (
        <p role="alert" className="text-label text-danger">
          {error}
        </p>
      ) : saved ? (
        <p role="status" className="text-label text-muted">
          ذخیره شد.
        </p>
      ) : null}
      <Button type="submit" size="md" disabled={pending} className="w-fit">
        {pending ? "در حال ذخیره" : mode === "create" ? "افزودن مقاله" : "ذخیره"}
      </Button>
    </form>
  );
}
