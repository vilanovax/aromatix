"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { deletePerfume, savePerfume } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckboxGroup } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { OCCASIONS, REFERENCES, SEASONS, type Brand } from "@/lib/catalog";
import { cn } from "@/lib/format";
import { fa } from "@/lib/utils";
import type { Accord, BottleShape, Note, Perfume, Season } from "@/lib/types";

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
            <Button key={id} href={`#${id}`} variant="outline" size="sm" className="shrink-0">
              {label}
            </Button>
          ))}
        </nav>
      </div>

      <Section id="identity" title="هویت">
        <div className="grid gap-4 sm:grid-cols-2">
          {mode === "create" ? (
            <Field label="اسلاگ" className="sm:col-span-2">
              <Input dir="ltr" value={draft.slug} onChange={(event) => patch({ slug: event.target.value })} />
            </Field>
          ) : null}
          <Field label="نام فارسی">
            <Input value={draft.nameFa} onChange={(event) => patch({ nameFa: event.target.value })} />
          </Field>
          <Field label="نام انگلیسی">
            <Input dir="ltr" value={draft.nameEn} onChange={(event) => patch({ nameEn: event.target.value })} />
          </Field>
          <Field label="برند">
            <Select
              value={draft.brand}
              onChange={(event) => patch({ brand: event.target.value })}
              options={brands.map((brand) => ({
                value: brand.nameFa,
                label: brand.active ? brand.nameFa : `${brand.nameFa} · غیرفعال`,
              }))}
            />
          </Field>
          <Field label="جنسیت بازار">
            <Select
              value={draft.marketGender}
              onChange={(event) => patch({ marketGender: event.target.value as Perfume["marketGender"] })}
              options={[
                { value: "مشترک", label: "مشترک" },
                { value: "مردانه", label: "مردانه" },
                { value: "زنانه", label: "زنانه" },
              ]}
            />
          </Field>
          <Field label="غلظت">
            <Input value={draft.concentration} onChange={(event) => patch({ concentration: event.target.value })} />
          </Field>
          <Field label="حجم، میلی‌لیتر">
            <Input inputMode="numeric" value={draft.volumeMl} onChange={(event) => patch({ volumeMl: Number(event.target.value) })} />
          </Field>
          <Field label="شکل شیشه">
            <Select
              value={draft.bottle}
              onChange={(event) => patch({ bottle: event.target.value as BottleShape })}
              options={[
                { value: "rect", label: "چهارگوش" },
                { value: "slim", label: "باریک" },
                { value: "round", label: "گرد" },
              ]}
            />
          </Field>
          <Field label="رنگ درپوش">
            <span className="flex items-center gap-2">
              <input
                aria-label="انتخاب رنگ درپوش"
                type="color"
                className="size-11 shrink-0 cursor-pointer rounded-control border border-border bg-field p-1 shadow-field [&::-webkit-color-swatch]:rounded-control [&::-webkit-color-swatch]:border-none [&::-webkit-color-swatch-wrapper]:p-0"
                value={safeHex(draft.cap)}
                onChange={(event) => patch({ cap: event.target.value })}
              />
              <Input dir="ltr" value={draft.cap} onChange={(event) => patch({ cap: event.target.value })} />
            </span>
          </Field>
          <Field label="عطار، اگر تأیید شده">
            <Input value={draft.perfumer ?? ""} onChange={(event) => patch({ perfumer: event.target.value || undefined })} />
          </Field>
          <Field label="مسیر عکس">
            <Input
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
            <div key={index} className="grid items-center gap-2 sm:grid-cols-[auto_minmax(0,1fr)_7rem_5rem_auto]">
              <input
                aria-label="رنگ آکورد"
                type="color"
                className="size-11 shrink-0 cursor-pointer rounded-control border border-border bg-field p-1 shadow-field [&::-webkit-color-swatch]:rounded-control [&::-webkit-color-swatch]:border-none [&::-webkit-color-swatch-wrapper]:p-0"
                value={safeHex(accord.color)}
                onChange={(event) => updateAccord(index, { color: event.target.value })}
              />
              <Input
                aria-label="نام آکورد"
                value={accord.name}
                placeholder="نام آکورد"
                onChange={(event) => updateAccord(index, { name: event.target.value })}
              />
              <Input aria-label="کد رنگ" dir="ltr" value={accord.color} onChange={(event) => updateAccord(index, { color: event.target.value })} />
              <Input
                aria-label="شدت آکورد"
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
              <Select
                aria-label="لایه نت"
                value={note.layer}
                onChange={(event) => updateNote(index, { layer: event.target.value as Note["layer"] })}
                options={[
                  { value: "top", label: "شروع" },
                  { value: "middle", label: "میانه" },
                  { value: "base", label: "پایه" },
                ]}
              />
              <Input aria-label="نام نت" value={note.name} onChange={(event) => updateNote(index, { name: event.target.value })} />
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
        <p className="text-sm text-muted-foreground">فصل</p>
        <CheckboxGroup
          className="mt-2"
          options={SEASONS.map((season) => ({ value: season.id, label: season.short }))}
          value={draft.seasons}
          onChange={(seasons) => patch({ seasons: seasons as Season[] })}
        />
        <p className="mt-4 text-sm text-muted-foreground">موقعیت</p>
        <CheckboxGroup
          className="mt-2"
          options={OCCASIONS.map((occasion) => ({ value: occasion.id, label: occasion.label }))}
          value={draft.occasions}
          onChange={(occasions) => patch({ occasions })}
        />
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <Field label="ماندگاری، ۱ تا ۵">
            <Score value={draft.longevity} onChange={(longevity) => patch({ longevity })} />
          </Field>
          <Field label="پخش بو، ۱ تا ۵">
            <Score value={draft.sillage} onChange={(sillage) => patch({ sillage })} />
          </Field>
          <Field label="اطمینان، ۰ تا ۱">
            <Input inputMode="decimal" value={draft.confidence} onChange={(event) => patch({ confidence: Number(event.target.value) })} />
          </Field>
        </div>
        <Field label="برچسب‌ها" className="mt-4">
          <Input value={tags} onChange={(event) => setTags(event.target.value)} />
          <p className="mt-1 text-sm text-muted-foreground">با ویرگول. fresh یعنی پیشنهاد تازه‌تر.</p>
        </Field>
      </Section>

      <Section id="links" title="ارتباط">
        <Field label="چرا این عطر">
          <Textarea className="min-h-24" value={draft.why} onChange={(event) => patch({ why: event.target.value })} />
        </Field>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="الهام‌گرفته از">
            <Select
              value={draft.inspiredBy ?? ""}
              onChange={(event) => patch({ inspiredBy: event.target.value || undefined })}
              options={[
                { value: "", label: "هیچ‌کدام" },
                ...REFERENCES.filter((item) => item.id !== "none").map((item) => ({ value: item.id, label: item.label })),
              ]}
            />
          </Field>
          <Field label="نام‌های مستعار دستیار">
            <Input value={aliases} onChange={(event) => setAliases(event.target.value)} />
          </Field>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">مشابه‌ها</p>
        <CheckboxGroup
          className="mt-2"
          options={others.filter((item) => item.slug !== draft.slug).map((item) => ({ value: item.slug, label: item.nameFa }))}
          value={draft.similar}
          onChange={(similar) => patch({ similar })}
        />
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
      <div className="mt-1.5 [&>div]:w-full">{children}</div>
    </label>
  );
}

function Score({ value, onChange }: { value: number | null; onChange: (value: number | null) => void }) {
  return (
    <Select
      value={value == null ? "" : String(value)}
      onChange={(event) => onChange(event.target.value ? Number(event.target.value) : null)}
      options={[{ value: "", label: "خالی" }, ...[1, 2, 3, 4, 5].map((score) => ({ value: String(score), label: fa(score) }))]}
    />
  );
}

function safeHex(value: string) {
  return /^#[0-9A-Fa-f]{6}$/.test(value) ? value : "#000000";
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
