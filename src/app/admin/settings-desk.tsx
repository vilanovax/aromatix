"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { changeAdminPassword, createAdmin, setAdminAccess, setGuideBudgets } from "@/app/admin/settings-actions";
import { budgetLabel, cleanBudgetMillions } from "@/lib/budgets";
import { applyAdminTheme, readAdminTheme, type AdminTheme } from "@/lib/admin/theme";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { faNum } from "@/lib/format";
import { ADMIN_SECTIONS, type AdminSection } from "@/lib/auth/sections";

export type SettingsAdmin = {
  id: number;
  name: string;
  phone: string;
  sections: AdminSection[];
  self: boolean;
};

export type BackupCounts = {
  brands: number;
  shops: number;
  perfumes: number;
  articles: number;
  users: number;
};

const PARTS = [
  ["appearance", "ظاهر"],
  ["budget", "بودجه"],
  ["password", "رمز"],
  ["create", "مدیر جدید"],
  ["access", "دسترسی"],
  ["backup", "بک‌آپ"],
] as const;

const BUDGET_SLOTS = ["اول", "دوم", "سوم", "چهارم"] as const;

export function SettingsDesk({
  admins,
  counts,
  budgets,
}: {
  admins: SettingsAdmin[];
  counts: BackupCounts;
  budgets: number[];
}) {
  return (
    <div className="mt-5 space-y-4">
      <nav className="flex gap-1.5 overflow-x-auto" aria-label="بخش‌های تنظیمات">
        {PARTS.map(([id, label]) => (
          <Button key={id} href={`#${id}`} variant="outline" size="sm" className="shrink-0">
            {label}
          </Button>
        ))}
      </nav>
      <AppearanceCard />
      <BudgetCard budgets={budgets} />
      <PasswordCard />
      <CreateCard />
      <AccessCard admins={admins} />
      <BackupCard counts={counts} />
    </div>
  );
}

function AppearanceCard() {
  const [theme, setTheme] = useState<AdminTheme>("dark");

  useEffect(() => {
    setTheme(readAdminTheme());
  }, []);

  function choose(next: AdminTheme) {
    setTheme(next);
    applyAdminTheme(next);
  }

  return (
    <Card id="appearance" className="scroll-mt-20 p-4 sm:p-5">
      <h2 className="text-title font-semibold">ظاهر</h2>
      <p className="mt-1 text-label text-muted-foreground">روشن یا تاریک، فقط برای همین مرورگر ذخیره می‌شود.</p>
      <Tabs value={theme} defaultValue="dark" onValueChange={(next) => choose(next as AdminTheme)} className="mt-4">
        <TabsList aria-label="تم مدیریت" className="w-full">
          <TabsTrigger value="light" className="flex-1">
            روشن
          </TabsTrigger>
          <TabsTrigger value="dark" className="flex-1">
            تاریک
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </Card>
  );
}

function BudgetCard({ budgets }: { budgets: number[] }) {
  const router = useRouter();
  const [values, setValues] = useState(budgets.map(String));
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const dirty = values.join(",") !== budgets.join(",");
  const preview = cleanBudgetMillions(values);

  function edit(index: number, next: string) {
    setSaved(false);
    setValues((current) => current.map((item, itemIndex) => (itemIndex === index ? next : item)));
  }

  async function save() {
    setPending(true);
    setError(null);
    setSaved(false);
    const result = await setGuideBudgets(values);
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setSaved(true);
    router.refresh();
  }

  return (
    <Card id="budget" className="scroll-mt-20 p-4 sm:p-5">
      <h2 className="text-title font-semibold">بودجهٔ راهنما</h2>
      <p className="mt-1 text-label text-muted-foreground">
        چهار سقف قدم «تا چه قیمتی؟». واحد میلیون تومان است و از کم به زیاد چیده می‌شوند.
      </p>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {BUDGET_SLOTS.map((slot, index) => (
          <label key={slot} className="block">
            <span className="text-label text-muted-foreground">سقف {slot}، میلیون تومان</span>
            <Input
              className="mt-1"
              dir="ltr"
              inputMode="numeric"
              value={values[index] ?? ""}
              onChange={(event) => edit(index, event.target.value)}
            />
          </label>
        ))}
      </div>
      <p className="mt-3 text-label text-muted-foreground">
        {preview ? preview.map((value) => budgetLabel(value)).join("، ") : "چهار عدد متفاوت بین ۱ تا ۵۰."}
      </p>
      {error ? (
        <Alert variant="destructive" className="mt-3">
          {error}
        </Alert>
      ) : null}
      {saved ? (
        <Alert variant="success" className="mt-3">
          ذخیره شد.
        </Alert>
      ) : null}
      <Button type="button" className="mt-4" disabled={pending || !dirty} onClick={save}>
        {pending ? "در حال ذخیره" : "ذخیرهٔ سقف‌ها"}
      </Button>
    </Card>
  );
}

function PasswordCard() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setSaved(false);
    const result = await changeAdminPassword({ current, next });
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setCurrent("");
    setNext("");
    setSaved(true);
  }

  return (
    <Card id="password" className="scroll-mt-20 p-4 sm:p-5">
      <h2 className="text-title font-semibold">رمز عبور</h2>
      <p className="mt-1 text-label text-muted-foreground">رمز فعلی لازم است. نشست‌های دیگر این حساب بسته می‌شوند.</p>
      <form onSubmit={submit} className="mt-4 grid gap-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm text-muted-foreground">رمز فعلی</span>
            <Input className="mt-1.5" type="password" autoComplete="current-password" value={current} onChange={(event) => setCurrent(event.target.value)} />
          </label>
          <label className="block">
            <span className="text-sm text-muted-foreground">رمز جدید</span>
            <Input className="mt-1.5" type="password" autoComplete="new-password" value={next} onChange={(event) => setNext(event.target.value)} />
          </label>
        </div>
        {error ? <Alert variant="destructive">{error}</Alert> : null}
        {saved ? <Alert variant="success">رمز عوض شد.</Alert> : null}
        <Button type="submit" disabled={pending || current.length === 0 || next.length < 8} className="w-fit">
          {pending ? "در حال ذخیره" : "عوض کردن رمز"}
        </Button>
      </form>
    </Card>
  );
}

function CreateCard() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [sections, setSections] = useState<AdminSection[]>(["overview"]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggle(id: AdminSection) {
    setSections((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const result = await createAdmin({ name, phone, password, sections });
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setName("");
    setPhone("");
    setPassword("");
    setSections(["overview"]);
    router.refresh();
  }

  return (
    <Card id="create" className="scroll-mt-20 p-4 sm:p-5">
      <h2 className="text-title font-semibold">مدیر جدید</h2>
      <p className="mt-1 text-label text-muted-foreground">با شمارهٔ تازه ساخته می‌شود و فقط بخش‌های باز را می‌بیند.</p>
      <form onSubmit={submit} className="mt-4 grid gap-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm text-muted-foreground">نام</span>
            <Input className="mt-1.5" value={name} onChange={(event) => setName(event.target.value)} />
          </label>
          <label className="block">
            <span className="text-sm text-muted-foreground">موبایل</span>
            <Input className="mt-1.5" dir="ltr" inputMode="tel" autoComplete="off" value={phone} onChange={(event) => setPhone(event.target.value)} />
          </label>
        </div>
        <label className="block">
          <span className="text-sm text-muted-foreground">رمز</span>
          <Input className="mt-1.5" type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} />
        </label>
        <SectionChecks selected={sections} onToggle={toggle} />
        {error ? <Alert variant="destructive">{error}</Alert> : null}
        <Button type="submit" disabled={pending || sections.length === 0} className="w-fit">
          {pending ? "در حال ساخت" : "افزودن مدیر"}
        </Button>
      </form>
    </Card>
  );
}

function AccessCard({ admins }: { admins: SettingsAdmin[] }) {
  return (
    <Card id="access" className="scroll-mt-20 p-4 sm:p-5">
      <h2 className="text-title font-semibold">دسترسی مدیرها</h2>
      <p className="mt-1 text-label text-muted-foreground">هر بخش یک آیتم منو است. حساب عضو از صفحهٔ کاربران عوض می‌شود.</p>
      <ul className="mt-4 grid gap-3">
        {admins.map((admin) => (
          <li key={`${admin.id}:${admin.sections.join(",")}`}>
            <AccessRow admin={admin} />
          </li>
        ))}
      </ul>
    </Card>
  );
}

function AccessRow({ admin }: { admin: SettingsAdmin }) {
  const router = useRouter();
  const [sections, setSections] = useState<AdminSection[]>(admin.sections);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const dirty = sections.join(",") !== admin.sections.join(",");

  function toggle(id: AdminSection) {
    setSaved(false);
    setSections((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  async function save() {
    setPending(true);
    setError(null);
    setSaved(false);
    const result = await setAdminAccess(admin.id, sections);
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setSaved(true);
    router.refresh();
  }

  return (
    <div className="rounded-control border border-border px-3.5 py-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-body font-medium">
          {admin.name}
          {admin.self ? <span className="text-label text-muted-foreground"> · خودت</span> : null}
        </p>
        <p className="text-label text-muted-foreground" dir="ltr">
          {admin.phone}
        </p>
      </div>
      <div className="mt-3">
        <SectionChecks selected={sections} onToggle={toggle} />
      </div>
      {error ? (
        <Alert variant="destructive" className="mt-2">
          {error}
        </Alert>
      ) : null}
      {saved ? (
        <Alert variant="success" className="mt-2">
          ذخیره شد.
        </Alert>
      ) : null}
      <Button type="button" variant="outline" size="sm" className="mt-3" disabled={pending || !dirty || sections.length === 0} onClick={save}>
        {pending ? "در حال ذخیره" : "ذخیرهٔ دسترسی"}
      </Button>
    </div>
  );
}

function SectionChecks({ selected, onToggle }: { selected: readonly AdminSection[]; onToggle: (id: AdminSection) => void }) {
  const groups = [...new Set(ADMIN_SECTIONS.map((section) => section.group))];
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {groups.map((group) => (
        <fieldset key={group} className="rounded-control border border-border px-3 py-2">
          <legend className="px-1 text-label text-muted-foreground">{group}</legend>
          <ul>
            {ADMIN_SECTIONS.filter((section) => section.group === group).map((section) => (
              <li key={section.id}>
                <Checkbox checked={selected.includes(section.id)} onCheckedChange={() => onToggle(section.id)} label={section.label} className="min-h-10 items-center" />
              </li>
            ))}
          </ul>
        </fieldset>
      ))}
    </div>
  );
}

function BackupCard({ counts }: { counts: BackupCounts }) {
  const lines = [
    ["برند", counts.brands],
    ["فروشگاه", counts.shops],
    ["عطر", counts.perfumes],
    ["دانستنی", counts.articles],
    ["حساب", counts.users],
  ] as const;

  return (
    <Card id="backup" className="scroll-mt-20 p-4 sm:p-5">
      <h2 className="text-title font-semibold">بک‌آپ</h2>
      <p className="mt-1 text-label text-muted-foreground">فایل JSON از کاتالوگ، دانستنی‌ها و حساب‌ها. رمز و نشست داخلش نیست.</p>
      <ul className="mt-4 flex flex-wrap gap-3">
        {lines.map(([label, count]) => (
          <li key={label}>
            <Badge variant="secondary">
              {faNum(count)} {label}
            </Badge>
          </li>
        ))}
      </ul>
      <Button
        type="button"
        variant="outline"
        className="mt-4"
        onClick={() => {
          window.location.assign("/api/admin/backup");
        }}
      >
        دانلود بک‌آپ
      </Button>
    </Card>
  );
}
