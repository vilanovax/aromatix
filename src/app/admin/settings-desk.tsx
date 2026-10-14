"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { changeAdminPassword, createAdmin, setAdminAccess } from "@/app/admin/settings-actions";
import { applyAdminTheme, readAdminTheme, type AdminTheme } from "@/lib/admin/theme";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn, faNum } from "@/lib/format";
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

const field =
  "h-11 w-full rounded-field border border-input bg-field shadow-field px-3.5 text-body outline-none focus-visible:outline-2 focus-visible:outline-ring";

const PARTS = [
  ["appearance", "ظاهر"],
  ["password", "رمز"],
  ["create", "مدیر جدید"],
  ["access", "دسترسی"],
  ["backup", "بک‌آپ"],
] as const;

export function SettingsDesk({ admins, counts }: { admins: SettingsAdmin[]; counts: BackupCounts }) {
  return (
    <div className="mt-5 space-y-4">
      <nav className="flex gap-1.5 overflow-x-auto" aria-label="بخش‌های تنظیمات">
        {PARTS.map(([id, label]) => (
          <a key={id} href={`#${id}`} className="shrink-0 rounded-full border border-border bg-card px-3 py-1.5 text-label">
            {label}
          </a>
        ))}
      </nav>
      <AppearanceCard />
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
      <div className="mt-4 flex rounded-control border border-border bg-card p-1" role="group" aria-label="تم مدیریت">
        <button
          type="button"
          aria-pressed={theme === "light"}
          onClick={() => choose("light")}
          className={cn("h-10 flex-1 rounded-control text-label", theme === "light" ? "bg-primary font-medium text-primary-foreground" : "text-muted-foreground")}
        >
          روشن
        </button>
        <button
          type="button"
          aria-pressed={theme === "dark"}
          onClick={() => choose("dark")}
          className={cn("h-10 flex-1 rounded-control text-label", theme === "dark" ? "bg-primary font-medium text-primary-foreground" : "text-muted-foreground")}
        >
          تاریک
        </button>
      </div>
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
            <span className="text-label text-muted-foreground">رمز فعلی</span>
            <input
              type="password"
              autoComplete="current-password"
              value={current}
              onChange={(event) => setCurrent(event.target.value)}
              className={`${field} mt-1.5`}
            />
          </label>
          <label className="block">
            <span className="text-label text-muted-foreground">رمز جدید</span>
            <input
              type="password"
              autoComplete="new-password"
              value={next}
              onChange={(event) => setNext(event.target.value)}
              className={`${field} mt-1.5`}
            />
          </label>
        </div>
        {error ? (
          <p role="alert" className="text-label text-destructive">
            {error}
          </p>
        ) : null}
        {saved ? (
          <p role="status" className="text-label text-muted-foreground">
            رمز عوض شد.
          </p>
        ) : null}
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
            <span className="text-label text-muted-foreground">نام</span>
            <input value={name} onChange={(event) => setName(event.target.value)} className={`${field} mt-1.5`} />
          </label>
          <label className="block">
            <span className="text-label text-muted-foreground">موبایل</span>
            <input
              dir="ltr"
              inputMode="tel"
              autoComplete="off"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              className={`${field} mt-1.5 text-start`}
            />
          </label>
        </div>
        <label className="block">
          <span className="text-label text-muted-foreground">رمز</span>
          <input
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className={`${field} mt-1.5`}
          />
        </label>
        <SectionChecks selected={sections} onToggle={toggle} />
        {error ? (
          <p role="alert" className="text-label text-destructive">
            {error}
          </p>
        ) : null}
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
        <p role="alert" className="mt-2 text-label text-destructive">
          {error}
        </p>
      ) : null}
      {saved ? (
        <p role="status" className="mt-2 text-label text-muted-foreground">
          ذخیره شد.
        </p>
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
                <label className="flex min-h-10 cursor-pointer items-center gap-2 text-body">
                  <input
                    type="checkbox"
                    checked={selected.includes(section.id)}
                    onChange={() => onToggle(section.id)}
                    className="size-4 accent-ink"
                  />
                  {section.label}
                </label>
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
      <ul className="mt-4 flex flex-wrap gap-2">
        {lines.map(([label, count]) => (
          <li key={label} className="rounded-full border border-border px-3 py-1.5 text-label">
            {faNum(count)} {label}
          </li>
        ))}
      </ul>
      <a
        href="/api/admin/backup"
        className={cn(
          "mt-4 inline-flex min-h-11 items-center rounded-control border border-border px-4 text-body font-medium",
          "hover:bg-accent",
        )}
      >
        دانلود بک‌آپ
      </a>
    </Card>
  );
}
