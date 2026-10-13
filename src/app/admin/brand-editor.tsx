"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createBrand, updateBrand } from "@/app/admin/actions";
import { Button } from "@/components/Button";
import { cn, faNum } from "@/lib/format";
import type { Brand } from "@/lib/catalog";

const control =
  "min-h-12 w-full rounded-control border border-line bg-card px-3 text-body text-ink outline-none focus-visible:outline-2 focus-visible:outline-ink";

export function BrandEditor({
  mode,
  brand,
  perfumeCount = 0,
}: {
  mode: "create" | "edit";
  brand?: Brand;
  perfumeCount?: number;
}) {
  const router = useRouter();
  const [slug, setSlug] = useState(brand?.slug ?? "");
  const [nameFa, setNameFa] = useState(brand?.nameFa ?? "");
  const [nameEn, setNameEn] = useState(brand?.nameEn ?? "");
  const [description, setDescription] = useState(brand?.description ?? "");
  const [active, setActive] = useState(brand?.active ?? true);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, setPending] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setSaved(false);
    const result =
      mode === "create"
        ? await createBrand({ slug, nameFa, nameEn, description })
        : await updateBrand({ slug: brand?.slug, nameFa, nameEn, description, active });
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    if (mode === "create" && result.slug) {
      router.push(`/admin/brands/${result.slug}`);
      router.refresh();
      return;
    }
    setSaved(true);
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="mt-5 grid max-w-xl gap-3">
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
        <span className="text-label text-muted">نام فارسی</span>
        <input className={`${control} mt-1.5`} value={nameFa} onChange={(event) => setNameFa(event.target.value)} />
      </label>
      <label className="block">
        <span className="text-label text-muted">نام انگلیسی</span>
        <input className={`${control} mt-1.5`} dir="ltr" value={nameEn} onChange={(event) => setNameEn(event.target.value)} />
      </label>
      <label className="block">
        <span className="text-label text-muted">توضیح</span>
        <textarea
          className={`${control} mt-1.5 min-h-28 py-3 leading-7`}
          value={description}
          maxLength={400}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="این برند در آروما چه جور عطری دارد و کی به کار می‌آید."
        />
      </label>
      {mode === "edit" ? (
        <fieldset className="grid gap-2">
          <legend className="text-label text-muted">وضعیت در فهرست عمومی</legend>
          <div className="flex rounded-control border border-line bg-card p-1" role="group" aria-label="وضعیت برند">
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
          <p className="text-pretty text-label text-faint">
            برند غیرفعال از فهرست برندها، پیشنهادها و صفحهٔ خودش کنار می‌رود. {faNum(perfumeCount)} عطرش در مدیریت می‌ماند.
          </p>
        </fieldset>
      ) : null}
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
        {pending ? "در حال ذخیره" : mode === "create" ? "افزودن برند" : "ذخیره"}
      </Button>
    </form>
  );
}
