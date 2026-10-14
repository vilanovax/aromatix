"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createShop, updateShop } from "@/app/admin/actions";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { faNum } from "@/lib/format";
import type { Shop } from "@/lib/catalog";

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
        <span className="text-sm text-muted-foreground">اسلاگ</span>
        <Input className="mt-1.5" dir="ltr" value={slug} disabled={mode === "edit"} onChange={(event) => setSlug(event.target.value)} />
      </label>
      <label className="block">
        <span className="text-sm text-muted-foreground">نام فارسی</span>
        <Input className="mt-1.5" value={nameFa} onChange={(event) => setNameFa(event.target.value)} />
      </label>
      <label className="block">
        <span className="text-sm text-muted-foreground">نام انگلیسی</span>
        <Input className="mt-1.5" dir="ltr" value={nameEn} onChange={(event) => setNameEn(event.target.value)} />
      </label>
      <label className="block">
        <span className="text-sm text-muted-foreground">توضیح</span>
        <div className="mt-1.5">
          <Textarea
            value={description}
            maxLength={400}
            showCount
            onChange={(event) => setDescription(event.target.value)}
            placeholder="این فروشگاه کجاست و قیمت‌های کاتالوگ از کجای آن می‌آید."
          />
        </div>
      </label>
      <label className="block">
        <span className="text-sm text-muted-foreground">وب‌سایت</span>
        <Input className="mt-1.5" dir="ltr" inputMode="url" value={website} placeholder="https://" onChange={(event) => setWebsite(event.target.value)} />
      </label>
      <label className="block">
        <span className="text-sm text-muted-foreground">اینستاگرام</span>
        <Input className="mt-1.5" dir="ltr" value={instagram} placeholder="آیدی یا لینک" onChange={(event) => setInstagram(event.target.value)} />
      </label>
      <label className="block">
        <span className="text-sm text-muted-foreground">تلگرام</span>
        <Input className="mt-1.5" dir="ltr" value={telegram} placeholder="آیدی یا لینک" onChange={(event) => setTelegram(event.target.value)} />
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm text-muted-foreground">تلفن</span>
          <Input className="mt-1.5" dir="ltr" inputMode="tel" value={phone} onChange={(event) => setPhone(event.target.value)} />
        </label>
        <label className="block">
          <span className="text-sm text-muted-foreground">شهر</span>
          <Input className="mt-1.5" value={city} onChange={(event) => setCity(event.target.value)} />
        </label>
      </div>
      {mode === "edit" ? (
        <div className="grid gap-2">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-muted-foreground">در قیمت عمومی دیده شود</span>
            <Switch checked={active} onCheckedChange={setActive} aria-label="وضعیت فروشگاه" />
          </div>
          <p className="text-pretty text-sm text-muted-foreground">
            فروشگاه غیرفعال از قیمت و لینک خرید عمومی کنار می‌رود. {faNum(offerCount)} قیمتش در مدیریت می‌ماند.
          </p>
        </div>
      ) : null}
      {error ? <Alert variant="destructive">{error}</Alert> : null}
      {saved ? <Alert variant="success">ذخیره شد.</Alert> : null}
      <Button type="submit" size="md" disabled={pending} className="w-fit">
        {pending ? "در حال ذخیره" : mode === "create" ? "افزودن فروشگاه" : "ذخیره"}
      </Button>
    </form>
  );
}
