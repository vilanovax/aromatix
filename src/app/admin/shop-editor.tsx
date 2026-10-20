"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createShop, updateShop } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { faNum } from "@/lib/format";
import type { Shop } from "@/lib/catalog";

const DESCRIPTION_MAX = 400;

export function ShopEditor({
  mode,
  shop,
  offerCount = 0,
}: {
  mode: "create" | "edit";
  shop?: Shop;
  offerCount?: number;
}) {
  const router = useRouter();
  const [slug, setSlug] = useState(shop?.slug ?? "");
  const [slugEdited, setSlugEdited] = useState(mode === "edit");
  const [nameFa, setNameFa] = useState(shop?.nameFa ?? "");
  const [nameEn, setNameEn] = useState(shop?.nameEn ?? "");
  const [description, setDescription] = useState(shop?.description ?? "");
  const [website, setWebsite] = useState(shop?.website ?? "");
  const [instagram, setInstagram] = useState(shop?.instagram ?? "");
  const [telegram, setTelegram] = useState(shop?.telegram ?? "");
  const [phone, setPhone] = useState(shop?.phone ?? "");
  const [city, setCity] = useState(shop?.city ?? "");
  const [active, setActive] = useState(shop?.active ?? true);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, setPending] = useState(false);
  const [baseline, setBaseline] = useState(() =>
    pack(shop?.slug ?? "", shop?.nameFa ?? "", shop?.nameEn ?? "", shop?.description ?? "", shop?.website ?? "", shop?.instagram ?? "", shop?.telegram ?? "", shop?.phone ?? "", shop?.city ?? "", shop?.active ?? true),
  );

  const websiteValue = normalizeWebsite(website);
  const websiteReady = websiteValue.length === 0 || /^https:\/\/\S+$/.test(websiteValue);
  const websiteError = website.trim() && !websiteReady ? "وب‌سایت باید با https:// شروع شود." : undefined;
  const slugReady = /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug.trim().toLowerCase());
  const namesReady = nameFa.trim().length >= 2 && nameEn.trim().length >= 2;
  const current = pack(slug, nameFa, nameEn, description, websiteValue, instagram, telegram, phone, city, active);
  const dirty = current !== baseline;
  const canSave = slugReady && namesReady && websiteReady && (mode === "create" || dirty);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!canSave) return;
    setPending(true);
    setError(null);
    setSaved(false);
    const fields = {
      slug,
      nameFa,
      nameEn,
      description,
      website: websiteValue,
      instagram: instagram.trim(),
      telegram: telegram.trim(),
      phone: phone.trim(),
      city: city.trim(),
    };
    const result = mode === "create" ? await createShop(fields) : await updateShop({ ...fields, slug: shop?.slug, active });
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setWebsite(fields.website);
    setInstagram(fields.instagram);
    setTelegram(fields.telegram);
    setPhone(fields.phone);
    setCity(fields.city);
    if (mode === "create" && result.slug) {
      router.push(`/admin/shops/${result.slug}`);
      router.refresh();
      return;
    }
    setBaseline(pack(slug, nameFa, nameEn, description, fields.website, fields.instagram, fields.telegram, fields.phone, fields.city, active));
    setSaved(true);
    router.refresh();
  }

  function onNameEn(value: string) {
    setNameEn(value);
    if (mode === "create" && !slugEdited) setSlug(toSlug(value));
  }

  const idle =
    mode === "create"
      ? slugReady && namesReady
        ? "اسلاگ بعد از ساخت عوض نمی‌شود."
        : "نام فارسی، نام انگلیسی و اسلاگ لازم است."
      : `${active ? "فعال" : "غیرفعال"} · ${faNum(offerCount)} قیمت`;
  const status = error ?? websiteError ?? (mode === "edit" && dirty ? "تغییر ذخیره نشده" : mode === "edit" && saved ? "ذخیره شد." : idle);

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="sticky top-12 z-10 -mx-4 border-b border-border bg-background/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:top-0">
        <Link href="/admin/shops" className="inline-flex min-h-11 items-center text-label text-muted-foreground">
          فروشگاه‌ها
        </Link>
        <div className="mt-1 flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-headline font-bold text-balance">{nameFa.trim() || (mode === "create" ? "فروشگاه جدید" : shop?.nameFa)}</h1>
            <p className="flex min-w-0 items-baseline gap-2">
              <span className={error || websiteError || (mode === "edit" && dirty) ? "truncate text-label text-destructive" : "truncate text-label text-muted-foreground"} role={error || websiteError ? "alert" : "status"}>
                {status}
              </span>
              {mode === "edit" ? (
                <span dir="ltr" className="shrink-0 text-label text-muted-foreground">
                  {shop?.slug}
                </span>
              ) : null}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {mode === "edit" && shop ? (
              <Button href={`/admin/shops/prices?shop=${encodeURIComponent(shop.slug)}`} variant="outline" size="md">
                قیمت‌ها
              </Button>
            ) : null}
            <Button type="submit" size="md" disabled={pending || !canSave}>
              {pending ? "در حال ذخیره" : mode === "create" ? "افزودن فروشگاه" : "ذخیره"}
            </Button>
          </div>
        </div>
      </div>

      <Card className="grid gap-4 p-4 sm:p-5">
        <div>
          <h2 className="text-title font-semibold">نام</h2>
          <p className="mt-1 text-pretty text-label text-muted-foreground">همین نام در فهرست فروشگاه‌ها و روی قیمت عطر دیده می‌شود.</p>
        </div>
        {mode === "create" ? (
          <Field label="اسلاگ" htmlFor="shop-slug" hint="حرف کوچک انگلیسی، عدد و خط تیره. از نام انگلیسی پر می‌شود و بعد از ساخت ثابت می‌ماند.">
            <Input
              id="shop-slug"
              dir="ltr"
              value={slug}
              autoCapitalize="none"
              autoComplete="off"
              spellCheck={false}
              onChange={(event) => {
                setSlugEdited(true);
                setSlug(event.target.value);
              }}
            />
          </Field>
        ) : null}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="نام فارسی" htmlFor="shop-name-fa">
            <Input id="shop-name-fa" value={nameFa} autoComplete="organization" onChange={(event) => setNameFa(event.target.value)} />
          </Field>
          <Field label="نام انگلیسی" htmlFor="shop-name-en">
            <Input
              id="shop-name-en"
              dir="ltr"
              value={nameEn}
              autoCapitalize="words"
              autoComplete="off"
              spellCheck={false}
              onChange={(event) => onNameEn(event.target.value)}
            />
          </Field>
        </div>
        <Field
          label="توضیح"
          htmlFor="shop-description"
          hint={
            <span className={description.length >= DESCRIPTION_MAX - 40 ? "text-destructive" : undefined}>
              {faNum(description.length)} از {faNum(DESCRIPTION_MAX)}
            </span>
          }
        >
          <Textarea
            id="shop-description"
            value={description}
            maxLength={DESCRIPTION_MAX}
            rows={4}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="فروشگاه کجاست و قیمت‌ها از کدام صفحه‌اش آمده."
          />
        </Field>
      </Card>

      <Card className="grid gap-4 p-4 sm:p-5">
        <div>
          <h2 className="text-title font-semibold">تماس</h2>
          <p className="mt-1 text-pretty text-label text-muted-foreground">همه اختیاری‌اند. وب‌سایت و شهر در فهرست فروشگاه‌ها دیده می‌شوند.</p>
        </div>
        <Field label="وب‌سایت" htmlFor="shop-website" hint={websiteError ? undefined : "اگر بدون https:// بنویسی، موقع خروج از فیلد اضافه می‌شود."}>
          <Input
            id="shop-website"
            dir="ltr"
            inputMode="url"
            autoComplete="url"
            spellCheck={false}
            value={website}
            placeholder="https://"
            error={websiteError}
            onChange={(event) => setWebsite(event.target.value)}
            onBlur={() => setWebsite(websiteValue)}
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="اینستاگرام" htmlFor="shop-instagram" hint="آیدی یا لینک کامل.">
            <Input
              id="shop-instagram"
              dir="ltr"
              value={instagram}
              autoCapitalize="none"
              autoComplete="off"
              spellCheck={false}
              placeholder="aroma"
              onChange={(event) => setInstagram(event.target.value)}
            />
          </Field>
          <Field label="تلگرام" htmlFor="shop-telegram" hint="آیدی یا لینک t.me.">
            <Input
              id="shop-telegram"
              dir="ltr"
              value={telegram}
              autoCapitalize="none"
              autoComplete="off"
              spellCheck={false}
              placeholder="aroma"
              onChange={(event) => setTelegram(event.target.value)}
            />
          </Field>
          <Field label="تلفن" htmlFor="shop-phone">
            <Input
              id="shop-phone"
              dir="ltr"
              inputMode="tel"
              autoComplete="tel"
              value={phone}
              placeholder="02112345678"
              onChange={(event) => setPhone(event.target.value)}
            />
          </Field>
          <Field label="شهر" htmlFor="shop-city">
            <Input id="shop-city" value={city} autoComplete="address-level2" placeholder="تهران" onChange={(event) => setCity(event.target.value)} />
          </Field>
        </div>
      </Card>

      {mode === "edit" ? (
        <Card className="flex items-center justify-between gap-4 p-4 sm:p-5">
          <div className="min-w-0">
            <p className="text-body font-medium">{active ? "در قیمت عمومی هست" : "از قیمت عمومی پنهان است"}</p>
            <p className="mt-1 text-pretty text-label text-muted-foreground">
              فروشگاه غیرفعال از قیمت و لینک خرید کنار می‌رود. {faNum(offerCount)} قیمتش در مدیریت می‌ماند.
            </p>
          </div>
          <Switch checked={active} onCheckedChange={setActive} aria-label="در قیمت عمومی دیده شود" />
        </Card>
      ) : null}
    </form>
  );
}

function toSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
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
  website: string,
  instagram: string,
  telegram: string,
  phone: string,
  city: string,
  active: boolean,
) {
  return JSON.stringify([slug, nameFa, nameEn, description, website, instagram, telegram, phone, city, active]);
}
