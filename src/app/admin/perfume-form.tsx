"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { deletePerfume, savePerfume } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Chip } from "@/components/Chip";
import { OCCASIONS, REFERENCES, SEASONS, type Brand } from "@/lib/catalog";
import { cn } from "@/lib/format";
import type { Accord, BottleShape, Note, Perfume, Season } from "@/lib/types";

const control =
  "h-11 rounded-field border border-input bg-field shadow-field px-3 text-body text-foreground outline-none focus-visible:outline-2 focus-visible:outline-ring";

export function PerfumeForm({
  mode,
  perfume,
  brands,
  others,
}: {
  mode: "create" | "edit";
  perfume: Perfume;
  brands: Brand[];
  others: { slug: string; nameFa: string }[];
}) {
  const router = useRouter();
  const [draft, setDraft] = useState(perfume);
  const [tags, setTags] = useState(perfume.tags.join("، "));
  const [aliases, setAliases] = useState((perfume.aliases ?? []).join("، "));
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, setPending] = useState(false);
  const [baseline, setBaseline] = useState(() => formValue(perfume, perfume.tags.join("، "), (perfume.aliases ?? []).join("، ")));
  const dirty = formValue(draft, tags, aliases) !== baseline;

  useEffect(() => {
    if (!dirty) return;
    function onLeave(event: BeforeUnloadEvent) {
      event.preventDefault();
    }
    function onClick(event: MouseEvent) {
      const anchor = (event.target as Element | null)?.closest("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#")) return;
      if (!window.confirm("تغییرها ذخیره نشده. از این صفحه بروی؟")) {
        event.preventDefault();
        event.stopPropagation();
      }
    }
    window.addEventListener("beforeunload", onLeave);
    document.addEventListener("click", onClick, true);
    return () => {
      window.removeEventListener("beforeunload", onLeave);
      document.removeEventListener("click", onClick, true);
    };
  }, [dirty]);

  function patch(next: Partial<Perfume>) {
    setSaved(false);
    setDraft((current) => ({ ...current, ...next }));
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setSaved(false);
    const result = await savePerfume(
      {
        ...draft,
        tags: splitList(tags),
        aliases: splitList(aliases),
      },
      mode === "edit" ? perfume.slug : undefined,
    );
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setBaseline(formValue({ ...draft, tags: splitList(tags), aliases: splitList(aliases) }, tags, aliases));
    setSaved(true);
    router.refresh();
    if (mode === "create" && result.slug) {
      router.push(`/admin/perfumes/${result.slug}`);
    }
  }

  async function remove() {
    if (!window.confirm(`«${perfume.nameFa}» از کاتالوگ حذف شود؟`)) return;
    setPending(true);
    const result = await deletePerfume(perfume.slug);
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.push("/admin/perfumes");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="space-y-4 pb-4">
      <div className="sticky top-12 z-10 -mx-4 border-b border-border bg-background/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:top-0">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-title font-semibold">{draft.nameFa || "عطر جدید"}</p>
            <p className="flex min-w-0 items-baseline gap-2">
              <span
                className={error || dirty ? "truncate text-label text-destructive" : "truncate text-label text-muted-foreground"}
                role={error ? "alert" : "status"}
              >
                {error ?? (dirty ? "تغییر ذخیره نشده" : saved ? "ذخیره شد" : mode === "create" ? "هنوز ذخیره نشده" : draft.brand)}
              </span>
              {mode === "edit" ? (
                <span dir="ltr" className="shrink-0 text-label text-muted-foreground">
                  {draft.slug}
                </span>
              ) : null}
            </p>
          </div>
          <Button type="submit" size="md" disabled={pending}>
            {pending ? "در حال ذخیره" : "ذخیره"}
          </Button>
        </div>
        <nav className="mt-2 flex gap-1.5 overflow-x-auto" aria-label="بخش‌های فرم">
          {[
            ["identity", "هویت"],
            ["scent", "بو"],
            ["use", "استفاده"],
            ["links", "ارتباط"],
          ].map(([id, label]) => (
            <a key={id} href={`#${id}`} className="shrink-0 rounded-full border border-border bg-card px-3 py-1.5 text-label">
              {label}
            </a>
          ))}
        </nav>
      </div>

      <Section id="identity" title="هویت">
        <div className="grid gap-4 sm:grid-cols-2">
          {mode === "create" ? (
            <Field label="اسلاگ" className="sm:col-span-2">
              <input className={control} dir="ltr" value={draft.slug} onChange={(event) => patch({ slug: event.target.value })} />
            </Field>
          ) : null}
          <Field label="نام فارسی">
            <input className={control} value={draft.nameFa} onChange={(event) => patch({ nameFa: event.target.value })} />
          </Field>
          <Field label="نام انگلیسی">
            <input className={control} dir="ltr" value={draft.nameEn} onChange={(event) => patch({ nameEn: event.target.value })} />
          </Field>
          <Field label="برند">
            <select className={control} value={draft.brand} onChange={(event) => patch({ brand: event.target.value })}>
              {brands.map((brand) => (
                <option key={brand.slug} value={brand.nameFa}>
                  {brand.nameFa}
                  {brand.active ? "" : " · غیرفعال"}
                </option>
              ))}
            </select>
          </Field>
          <Field label="جنسیت بازار">
            <select
              className={control}
              value={draft.marketGender}
              onChange={(event) => patch({ marketGender: event.target.value as Perfume["marketGender"] })}
            >
              <option value="مشترک">مشترک</option>
              <option value="مردانه">مردانه</option>
              <option value="زنانه">زنانه</option>
            </select>
          </Field>
          <Field label="غلظت">
            <input className={control} value={draft.concentration} onChange={(event) => patch({ concentration: event.target.value })} />
          </Field>
          <Field label="حجم، میلی‌لیتر">
            <input
              className={control}
              inputMode="numeric"
              value={draft.volumeMl}
              onChange={(event) => patch({ volumeMl: Number(event.target.value) })}
            />
          </Field>
          <Field label="شکل شیشه">
            <select className={control} value={draft.bottle} onChange={(event) => patch({ bottle: event.target.value as BottleShape })}>
              <option value="rect">چهارگوش</option>
              <option value="slim">باریک</option>
              <option value="round">گرد</option>
            </select>
          </Field>
          <Field label="رنگ درپوش">
            <span className="flex items-center gap-2">
              <input
                aria-label="انتخاب رنگ درپوش"
                type="color"
                className="size-11 shrink-0 cursor-pointer rounded-control border border-border bg-card p-1"
                value={safeHex(draft.cap)}
                onChange={(event) => patch({ cap: event.target.value })}
              />
              <input className={control} dir="ltr" value={draft.cap} onChange={(event) => patch({ cap: event.target.value })} />
            </span>
          </Field>
          <Field label="عطار، اگر تأیید شده">
            <input className={control} value={draft.perfumer ?? ""} onChange={(event) => patch({ perfumer: event.target.value || undefined })} />
          </Field>
          <Field label="مسیر عکس">
            <input
              className={control}
              dir="ltr"
              value={draft.image ?? ""}
              placeholder="/perfumes/example.jpg"
              onChange={(event) => patch({ image: event.target.value || undefined })}
            />
          </Field>
        </div>
      </Section>

      <Section id="scent" title="بو">
        <p className="text-label text-muted-foreground">آکوردها نسبت حس‌اند. شدت بین ۰٫۰۱ و ۱.</p>
        <div className="mt-3 space-y-2">
          {draft.accords.map((accord, index) => (
            <div key={index} className="flex flex-wrap items-center gap-2">
              <input
                aria-label="رنگ آکورد"
                type="color"
                className="size-11 shrink-0 cursor-pointer rounded-control border border-border bg-card p-1"
                value={safeHex(accord.color)}
                onChange={(event) => updateAccord(index, { color: event.target.value })}
              />
              <input
                aria-label="نام آکورد"
                className={cn(control, "min-w-36 flex-1")}
                value={accord.name}
                placeholder="نام آکورد"
                onChange={(event) => updateAccord(index, { name: event.target.value })}
              />
              <input
                aria-label="کد رنگ"
                className={cn(control, "w-28")}
                dir="ltr"
                value={accord.color}
                onChange={(event) => updateAccord(index, { color: event.target.value })}
              />
              <input
                aria-label="شدت آکورد"
                className={cn(control, "w-20")}
                inputMode="decimal"
                value={accord.strength}
                onChange={(event) => updateAccord(index, { strength: Number(event.target.value) })}
              />
              <Button type="button" variant="outline" size="md" onClick={() => removeAt("accords", index)} disabled={draft.accords.length === 1}>
                حذف
              </Button>
            </div>
          ))}
        </div>
        <Button type="button" variant="ghost" size="sm" className="mt-2" onClick={() => patch({ accords: [...draft.accords, { name: "", color: "#8C4A32", strength: 0.2 }] })}>
          آکورد جدید
        </Button>

        <p className="mt-5 text-label text-muted-foreground">هرم</p>
        <div className="mt-2 space-y-2">
          {draft.notes.map((note, index) => (
            <div key={index} className="grid gap-2 sm:grid-cols-[8rem_1fr_auto]">
              <select
                aria-label="لایه نت"
                className={control}
                value={note.layer}
                onChange={(event) => updateNote(index, { layer: event.target.value as Note["layer"] })}
              >
                <option value="top">شروع</option>
                <option value="middle">میانه</option>
                <option value="base">پایه</option>
              </select>
              <input
                aria-label="نام نت"
                className={control}
                value={note.name}
                onChange={(event) => updateNote(index, { name: event.target.value })}
              />
              <Button type="button" variant="outline" size="md" onClick={() => removeAt("notes", index)} disabled={draft.notes.length === 1}>
                حذف
              </Button>
            </div>
          ))}
        </div>
        <Button type="button" variant="ghost" size="sm" className="mt-2" onClick={() => patch({ notes: [...draft.notes, { layer: "middle", name: "" }] })}>
          نت جدید
        </Button>
      </Section>

      <Section id="use" title="استفاده">
        <p className="text-label text-muted-foreground">فصل</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {SEASONS.map((season) => (
            <Chip
              key={season.id}
              selected={draft.seasons.includes(season.id)}
              onClick={() => patch({ seasons: toggle(draft.seasons, season.id) as Season[] })}
            >
              {season.short}
            </Chip>
          ))}
        </div>
        <p className="mt-4 text-label text-muted-foreground">موقعیت</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {OCCASIONS.map((occasion) => (
            <Chip
              key={occasion.id}
              selected={draft.occasions.includes(occasion.id)}
              onClick={() => patch({ occasions: toggle(draft.occasions, occasion.id) })}
            >
              {occasion.label}
            </Chip>
          ))}
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <Field label="ماندگاری، ۱ تا ۵">
            <Score value={draft.longevity} onChange={(longevity) => patch({ longevity })} />
          </Field>
          <Field label="پخش بو، ۱ تا ۵">
            <Score value={draft.sillage} onChange={(sillage) => patch({ sillage })} />
          </Field>
          <Field label="اطمینان، ۰ تا ۱">
            <input
              className={control}
              inputMode="decimal"
              value={draft.confidence}
              onChange={(event) => patch({ confidence: Number(event.target.value) })}
            />
          </Field>
        </div>
        <Field label="برچسب‌ها" className="mt-4">
          <input className={control} value={tags} onChange={(event) => setTags(event.target.value)} />
          <p className="mt-1 text-label text-muted-foreground">با ویرگول. fresh یعنی پیشنهاد تازه‌تر.</p>
        </Field>
      </Section>

      <Section id="links" title="ارتباط">
        <Field label="چرا این عطر">
          <textarea
            className={cn(control, "min-h-24 py-3")}
            value={draft.why}
            onChange={(event) => patch({ why: event.target.value })}
          />
        </Field>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="الهام‌گرفته از">
            <select
              className={control}
              value={draft.inspiredBy ?? ""}
              onChange={(event) => patch({ inspiredBy: event.target.value || undefined })}
            >
              <option value="">هیچ‌کدام</option>
              {REFERENCES.filter((item) => item.id !== "none").map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="نام‌های مستعار دستیار">
            <input className={control} value={aliases} onChange={(event) => setAliases(event.target.value)} />
          </Field>
        </div>
        <p className="mt-4 text-label text-muted-foreground">مشابه‌ها</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {others
            .filter((item) => item.slug !== draft.slug)
            .map((item) => (
              <Chip
                key={item.slug}
                selected={draft.similar.includes(item.slug)}
                onClick={() => patch({ similar: toggle(draft.similar, item.slug) })}
              >
                {item.nameFa}
              </Chip>
            ))}
        </div>
      </Section>

      {mode === "edit" ? (
        <div className="flex items-center justify-between gap-3 rounded-surface border border-border bg-card px-4 py-3">
          <p className="text-label text-muted-foreground">این عطر از کاتالوگ و از مشابه‌ها برداشته می‌شود.</p>
          <Button type="button" variant="outline" size="md" className="shrink-0 text-destructive" onClick={remove} disabled={pending}>
            حذف عطر
          </Button>
        </div>
      ) : null}
    </form>
  );

  function updateAccord(index: number, next: Partial<Accord>) {
    patch({ accords: draft.accords.map((item, i) => (i === index ? { ...item, ...next } : item)) });
  }

  function updateNote(index: number, next: Partial<Note>) {
    patch({ notes: draft.notes.map((item, i) => (i === index ? { ...item, ...next } : item)) });
  }

  function removeAt(key: "accords" | "notes", index: number) {
    patch({ [key]: draft[key].filter((_, i) => i !== index) });
  }
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <Card id={id} className="scroll-mt-44 p-4 sm:p-5">
      <h2 className="text-title font-semibold">{title}</h2>
      <div className="mt-4">{children}</div>
    </Card>
  );
}

function Field({ label, className, children }: { label: string; className?: string; children: React.ReactNode }) {
  return (
    <label className={cn("block", className)}>
      <span className="text-label text-muted-foreground">{label}</span>
      <div className="mt-1.5 [&_input:not([type=color])]:w-full [&_select]:w-full [&_textarea]:w-full">{children}</div>
    </label>
  );
}

function Score({ value, onChange }: { value: number | null; onChange: (value: number | null) => void }) {
  return (
    <select className={control} value={value ?? ""} onChange={(event) => onChange(event.target.value ? Number(event.target.value) : null)}>
      <option value="">خالی</option>
      {[1, 2, 3, 4, 5].map((score) => (
        <option key={score} value={score}>
          {score}
        </option>
      ))}
    </select>
  );
}

function safeHex(value: string) {
  return /^#[0-9A-Fa-f]{6}$/.test(value) ? value : "#000000";
}

function toggle(items: string[], id: string) {
  return items.includes(id) ? items.filter((item) => item !== id) : [...items, id];
}

function splitList(value: string) {
  return value
    .split(/[،,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function formValue(value: Perfume, tagText: string, aliasText: string) {
  return JSON.stringify({ ...value, tags: splitList(tagText), aliases: splitList(aliasText) });
}
