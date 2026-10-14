"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createShop, updateShop } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { cn, faNum } from "@/lib/format";
import type { Shop } from "@/lib/catalog";

const control =
  "h-11 w-full rounded-field border border-input bg-field shadow-field px-3 text-body text-foreground outline-none focus-visible:outline-2 focus-visible:outline-ring";

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

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setSaved(false);
    const fields = { slug, nameFa, nameEn, description, website, instagram, telegram, phone, city };
    const result = mode === "create" ? await createShop(fields) : await updateShop({ ...fields, slug: shop?.slug, active });
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    if (mode === "create" && result.slug) {
      router.push(`/admin/shops/${result.slug}`);
      router.refresh();
      return;
    }
    setSaved(true);
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="mt-5 grid max-w-xl gap-3">
      <label className="block">
        <span className="text-label text-muted-foreground">اسلاگ</span>
        <input
          className={`${control} mt-1.5`}
          dir="ltr"
          value={slug}
          disabled={mode === "edit"}
          onChange={(event) => setSlug(event.target.value)}
        />
      </label>
      <label className="block">
        <span className="text-label text-muted-foreground">نام فارسی</span>
        <input className={`${control} mt-1.5`} value={nameFa} onChange={(event) => setNameFa(event.target.value)} />
      </label>
      <label className="block">
        <span className="text-label text-muted-foreground">نام انگلیسی</span>
        <input className={`${control} mt-1.5`} dir="ltr" value={nameEn} onChange={(event) => setNameEn(event.target.value)} />
      </label>
      <label className="block">
        <span className="text-label text-muted-foreground">توضیح</span>
        <textarea
          className={`${control} mt-1.5 min-h-28 py-3 leading-7`}
          value={description}
          maxLength={400}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="این فروشگاه کجاست و قیمت‌های کاتالوگ از کجای آن می‌آید."
        />
      </label>
      <label className="block">
        <span className="text-label text-muted-foreground">وب‌سایت</span>
        <input
          className={`${control} mt-1.5`}
          dir="ltr"
          inputMode="url"
          value={website}
          placeholder="https://"
          onChange={(event) => setWebsite(event.target.value)}
        />
      </label>
      <label className="block">
        <span className="text-label text-muted-foreground">اینستاگرام</span>
        <input
          className={`${control} mt-1.5`}
          dir="ltr"
          value={instagram}
          placeholder="آیدی یا لینک"
          onChange={(event) => setInstagram(event.target.value)}
        />
      </label>
      <label className="block">
        <span className="text-label text-muted-foreground">تلگرام</span>
        <input
          className={`${control} mt-1.5`}
          dir="ltr"
          value={telegram}
          placeholder="آیدی یا لینک"
          onChange={(event) => setTelegram(event.target.value)}
        />
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="text-label text-muted-foreground">تلفن</span>
          <input
            className={`${control} mt-1.5`}
            dir="ltr"
            inputMode="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
          />
        </label>
        <label className="block">
          <span className="text-label text-muted-foreground">شهر</span>
          <input className={`${control} mt-1.5`} value={city} onChange={(event) => setCity(event.target.value)} />
        </label>
      </div>
      {mode === "edit" ? (
        <fieldset className="grid gap-2">
          <legend className="text-label text-muted-foreground">وضعیت در قیمت عمومی</legend>
          <div className="flex rounded-control border border-border bg-card p-1" role="group" aria-label="وضعیت فروشگاه">
            <button
              type="button"
              aria-pressed={active}
              onClick={() => setActive(true)}
              className={cn("min-h-11 flex-1 rounded-control text-label", active ? "bg-primary font-medium text-primary-foreground" : "text-muted-foreground")}
            >
              فعال
            </button>
            <button
              type="button"
              aria-pressed={!active}
              onClick={() => setActive(false)}
              className={cn("min-h-11 flex-1 rounded-control text-label", !active ? "bg-primary font-medium text-primary-foreground" : "text-muted-foreground")}
            >
              غیرفعال
            </button>
          </div>
          <p className="text-pretty text-label text-muted-foreground">
            فروشگاه غیرفعال از قیمت و لینک خرید عمومی کنار می‌رود. {faNum(offerCount)} قیمتش در مدیریت می‌ماند.
          </p>
        </fieldset>
      ) : null}
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
        {pending ? "در حال ذخیره" : mode === "create" ? "افزودن فروشگاه" : "ذخیره"}
      </Button>
    </form>
  );
}
