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
  const [logo, setLogo] = useState(brand?.logo ?? "");
  const [website, setWebsite] = useState(brand?.website ?? "");
  const [instagram, setInstagram] = useState(brand?.instagram ?? "");
  const [active, setActive] = useState(brand?.active ?? true);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, setPending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [logoNote, setLogoNote] = useState<string | null>(null);
  const [baseline, setBaseline] = useState(() =>
    pack(
      brand?.slug ?? "",
      brand?.nameFa ?? "",
      brand?.nameEn ?? "",
      brand?.description ?? "",
      brand?.logo ?? "",
      brand?.website ?? "",
      brand?.instagram ?? "",
      brand?.active ?? true,
    ),
  );
  const websiteValue = normalizeWebsite(website);
  const logoValue = logo.trim();
  const websiteReady = websiteValue.length === 0 || /^https:\/\/\S+$/.test(websiteValue);
  const websiteError = website.trim() && !websiteReady ? "وب‌سایت باید با https:// شروع شود." : undefined;
  const dirty =
    pack(slug, nameFa, nameEn, description, logoValue, websiteValue, instagram.trim(), active) !== baseline;
  const slugReady = /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug.trim().toLowerCase());
  const namesReady = nameFa.trim().length >= 2 && nameEn.trim().length >= 2;
  const canSave = namesReady && websiteReady && (mode === "create" ? slugReady : dirty);

  async function uploadLogo(file: File) {
    if (!brand?.slug) {
      setLogoNote("اول برند را ذخیره کن، بعد لوگو را بگذار.");
      return;
    }
    setUploading(true);
    setLogoNote(null);
    setError(null);
    try {
      const body = new FormData();
      body.set("file", file);
      const response = await fetch(`/api/admin/brands/${brand.slug}/logo`, { method: "POST", body });
      const data = (await response.json()) as { logo?: string; error?: string };
      if (!response.ok || !data.logo) {
        setLogoNote(data.error ?? "لوگو ذخیره نشد.");
        return;
      }
      setLogo(data.logo);
      setBaseline(pack(slug, nameFa, nameEn, description, data.logo, websiteValue, instagram.trim(), active));
      setLogoNote("لوگو آماده و ذخیره شد.");
      router.refresh();
    } catch {
      setLogoNote("لوگو ذخیره نشد.");
    } finally {
      setUploading(false);
    }
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setSaved(false);
    const payload = {
      slug: mode === "create" ? slug : brand?.slug,
      nameFa,
      nameEn,
      description,
      logo: logoValue,
      website: websiteValue,
      instagram: instagram.trim(),
      active,
    };
    const result = mode === "create" ? await createBrand(payload) : await updateBrand(payload);
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
    setWebsite(websiteValue);
    setLogo(logoValue);
    setBaseline(pack(slug, nameFa, nameEn, description, logoValue, websiteValue, instagram.trim(), active));
    setSaved(true);
    router.refresh();
  }

  const status =
    error ??
    websiteError ??
    (dirty
      ? "تغییر ذخیره نشده"
      : saved
        ? "ذخیره شد"
        : mode === "create"
          ? "اسلاگ بعد از ساخت عوض نمی‌شود."
          : `${active ? "فعال" : "غیرفعال"} · ${faNum(perfumeCount)} عطر`);

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="sticky top-12 z-10 -mx-4 border-b border-border bg-background/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:top-0">
        <Link href="/admin/brands" className="inline-flex min-h-11 items-center text-label text-muted-foreground">
          برندها
        </Link>
        <div className="mt-1 flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-headline font-bold">{nameFa.trim() || "برند جدید"}</h1>
            <p className="flex min-w-0 items-baseline gap-2">
              <span
                className={
                  error || websiteError || dirty
                    ? "truncate text-label text-destructive"
                    : "truncate text-label text-muted-foreground"
                }
                role={error || websiteError ? "alert" : "status"}
              >
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
            <Button type="submit" size="md" disabled={pending || !canSave}>
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

      <Card className="grid gap-4 p-4 sm:p-5">
        <div>
          <h2 className="text-title font-semibold">حضور برند</h2>
          <p className="mt-1 text-pretty text-label text-muted-foreground">لوگو و لینک‌های رسمی شرکت روی صفحهٔ برند دیده می‌شود.</p>
        </div>
        <div>
          <p className="text-label text-muted-foreground">لوگو</p>
          <div className="mt-2 flex items-center gap-4">
            <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-control border border-border bg-secondary">
              {logoValue ? <img src={logoValue} alt="" className="max-h-full max-w-full object-contain" /> : null}
            </div>
            <div className="min-w-0">
              <label className="inline-flex min-h-11 cursor-pointer items-center rounded-control border border-border bg-card px-4 text-label font-medium">
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="sr-only"
                  disabled={uploading || mode === "create"}
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    event.target.value = "";
                    if (file) void uploadLogo(file);
                  }}
                />
                {uploading ? "در حال آماده‌سازی…" : "انتخاب لوگو"}
              </label>
              <p className="mt-2 text-pretty text-label text-muted-foreground" role={logoNote && logoNote !== "لوگو آماده و ذخیره شد." ? "alert" : "status"}>
                {mode === "create"
                  ? "بعد از ساخت برند می‌توانی لوگو را بگذاری."
                  : (logoNote ?? "پی‌ان‌جی، جی‌پگ یا وب‌پی. قبل از ذخیره به مربع ۵۱۲ و وب‌پی سبک تبدیل می‌شود.")}
              </p>
            </div>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="وب‌سایت" hint={websiteError ? undefined : "اگر بدون https:// بنویسی، موقع خروج از فیلد اضافه می‌شود."}>
            <Input
              dir="ltr"
              value={website}
              autoCapitalize="none"
              spellCheck={false}
              placeholder="https://example.com"
              error={websiteError}
              onChange={(event) => setWebsite(event.target.value)}
              onBlur={() => setWebsite(websiteValue)}
            />
          </Field>
          <Field label="اینستاگرام" hint="آیدی یا لینک کامل.">
            <Input
              dir="ltr"
              value={instagram}
              autoCapitalize="none"
              spellCheck={false}
              placeholder="@frenchavenue"
              onChange={(event) => setInstagram(event.target.value)}
            />
          </Field>
        </div>
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

function normalizeWebsite(value: string) {
  const text = value.trim();
  if (!text || /^https?:\/\//i.test(text)) return text;
  return `https://${text.replace(/^\/+/, "")}`;
}

function pack(
  slug: string,
  nameFa: string,
  nameEn: string,
  description: string,
  logo: string,
  website: string,
  instagram: string,
  active: boolean,
) {
  return JSON.stringify([slug, nameFa, nameEn, description, logo, website, instagram, active]);
}
