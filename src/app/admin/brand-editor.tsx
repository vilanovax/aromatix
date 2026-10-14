"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createBrand, updateBrand } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { faNum } from "@/lib/format";
import type { Brand } from "@/lib/catalog";

const DESCRIPTION_MAX = 400;

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
  const [baseline, setBaseline] = useState(() => pack(brand?.slug ?? "", brand?.nameFa ?? "", brand?.nameEn ?? "", brand?.description ?? "", brand?.active ?? true));
  const dirty = pack(slug, nameFa, nameEn, description, active) !== baseline;
  const slugReady = /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug.trim().toLowerCase());
  const namesReady = nameFa.trim().length >= 2 && nameEn.trim().length >= 2;

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
    setBaseline(pack(slug, nameFa, nameEn, description, active));
    setSaved(true);
    router.refresh();
  }

  const status = error ?? (dirty ? "تغییر ذخیره نشده" : saved ? "ذخیره شد" : mode === "create" ? "اسلاگ بعد از ساخت عوض نمی‌شود." : `${active ? "فعال" : "غیرفعال"} · ${faNum(perfumeCount)} عطر`);

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="sticky top-12 z-10 -mx-4 border-b border-border bg-background/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:top-0">
        <Link href="/admin/brands" className="text-label text-muted-foreground">
          برندها
        </Link>
        <div className="mt-1 flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-headline font-bold">{nameFa.trim() || "برند جدید"}</h1>
            <p className="flex min-w-0 items-baseline gap-2">
              <span className={error || dirty ? "truncate text-label text-destructive" : "truncate text-label text-muted-foreground"} role={error ? "alert" : "status"}>
                {status}
              </span>
              {mode === "edit" ? (
                <span dir="ltr" className="shrink-0 text-label text-muted-foreground">
                  {brand?.slug}
                </span>
              ) : null}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {mode === "edit" && brand ? (
              <Button href={`/admin/perfumes?brand=${encodeURIComponent(brand.slug)}`} variant="outline" size="md">
                لیست عطرها
              </Button>
            ) : null}
            <Button type="submit" size="md" disabled={pending || (mode === "edit" ? !dirty : !slugReady || !namesReady)}>
              {pending ? "در حال ذخیره" : mode === "create" ? "افزودن برند" : "ذخیره"}
            </Button>
          </div>
        </div>
      </div>

      <Card className="grid gap-4 p-4 sm:p-5">
        {mode === "create" ? (
          <Field label="اسلاگ" hint="حرف کوچک انگلیسی، عدد و خط تیره.">
            <Input dir="ltr" value={slug} autoCapitalize="none" spellCheck={false} onChange={(event) => setSlug(event.target.value)} />
          </Field>
        ) : null}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="نام فارسی">
            <Input value={nameFa} onChange={(event) => setNameFa(event.target.value)} />
          </Field>
          <Field label="نام انگلیسی">
            <Input dir="ltr" value={nameEn} onChange={(event) => setNameEn(event.target.value)} />
          </Field>
        </div>
        <Field label="توضیح" hint={`${faNum(description.length)} از ${faNum(DESCRIPTION_MAX)}`}>
          <Textarea
            value={description}
            maxLength={DESCRIPTION_MAX}
            rows={4}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="این برند در آروما چه جور عطری دارد و کی به کار می‌آید."
          />
        </Field>
      </Card>

      {mode === "edit" ? (
        <Card className="flex items-center justify-between gap-4 p-4 sm:p-5">
          <div className="min-w-0">
            <p className="text-body font-medium">{active ? "در فهرست عمومی هست" : "از فهرست عمومی پنهان است"}</p>
            <p className="mt-1 text-label text-muted-foreground">
              برند غیرفعال از پیشنهادها و صفحهٔ خودش کنار می‌رود. عطرها در مدیریت می‌مانند.
            </p>
          </div>
          <Switch checked={active} onCheckedChange={setActive} aria-label="در فهرست عمومی دیده شود" />
        </Card>
      ) : null}
    </form>
  );
}

function pack(slug: string, nameFa: string, nameEn: string, description: string, active: boolean) {
  return JSON.stringify([slug, nameFa, nameEn, description, active]);
}
