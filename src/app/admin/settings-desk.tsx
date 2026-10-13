"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { changeAdminPassword, createAdmin, setAdminAccess } from "@/app/admin/settings-actions";
import { Button } from "@/components/Button";
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

const field =
  "min-h-12 w-full rounded-control border border-line bg-card px-3.5 text-body outline-none focus-visible:outline-2 focus-visible:outline-ink";

export function SettingsDesk({ admins, counts }: { admins: SettingsAdmin[]; counts: BackupCounts }) {
  return (
    <div className="mt-6 grid gap-8">
      <PasswordCard />
      <CreateCard />
      <AccessCard admins={admins} />
      <BackupCard counts={counts} />
    </div>
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
    <section>
      <h2 className="text-title font-semibold">رمز عبور</h2>
      <p className="mt-1 max-w-xl text-pretty text-body text-muted">رمز فعلی را می‌خواهد. نشست‌های دیگر این حساب بسته می‌شوند.</p>
      <form onSubmit={submit} className="mt-3 grid max-w-md gap-3">
        <label className="block">
          <span className="text-label text-muted">رمز فعلی</span>
          <input
            type="password"
            autoComplete="current-password"
            value={current}
            onChange={(event) => setCurrent(event.target.value)}
            className={`${field} mt-1`}
          />
        </label>
        <label className="block">
          <span className="text-label text-muted">رمز جدید</span>
          <input
            type="password"
            autoComplete="new-password"
            value={next}
            onChange={(event) => setNext(event.target.value)}
            className={`${field} mt-1`}
          />
        </label>
        {error ? (
          <p role="alert" className="text-label text-danger">
            {error}
          </p>
        ) : null}
        {saved ? (
          <p role="status" className="text-label text-muted">
            رمز عوض شد.
          </p>
        ) : null}
        <Button type="submit" disabled={pending || current.length === 0 || next.length < 8} className="w-fit">
          {pending ? "در حال ذخیره" : "عوض کردن رمز"}
        </Button>
      </form>
    </section>
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
    <section>
      <h2 className="text-title font-semibold">مدیر جدید</h2>
      <p className="mt-1 max-w-xl text-pretty text-body text-muted">
        با شمارهٔ تازه ساخته می‌شود و فقط بخش‌هایی را می‌بیند که اینجا باز باشد.
      </p>
      <form onSubmit={submit} className="mt-3 grid max-w-xl gap-3">
        <label className="block">
          <span className="text-label text-muted">نام</span>
          <input value={name} onChange={(event) => setName(event.target.value)} className={`${field} mt-1`} />
        </label>
        <label className="block">
          <span className="text-label text-muted">موبایل</span>
          <input
            dir="ltr"
            inputMode="tel"
            autoComplete="off"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            className={`${field} mt-1 text-start`}
          />
        </label>
        <label className="block">
          <span className="text-label text-muted">رمز</span>
          <input
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className={`${field} mt-1`}
          />
        </label>
        <SectionChecks selected={sections} onToggle={toggle} />
        {error ? (
          <p role="alert" className="text-label text-danger">
            {error}
          </p>
        ) : null}
        <Button type="submit" disabled={pending || sections.length === 0} className="w-fit">
          {pending ? "در حال ساخت" : "افزودن مدیر"}
        </Button>
      </form>
    </section>
  );
}

function AccessCard({ admins }: { admins: SettingsAdmin[] }) {
  return (
    <section>
      <h2 className="text-title font-semibold">دسترسی مدیرها</h2>
      <p className="mt-1 max-w-xl text-pretty text-body text-muted">هر بخش یک آیتم منو است. حساب عضو از صفحهٔ کاربران عوض می‌شود.</p>
      <ul className="mt-3 grid gap-3">
        {admins.map((admin) => (
          <li key={`${admin.id}:${admin.sections.join(",")}`}>
            <AccessRow admin={admin} />
          </li>
        ))}
      </ul>
    </section>
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
    <div className="rounded-panel border border-line bg-card px-4 py-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-body font-medium">
          {admin.name}
          {admin.self ? <span className="text-label text-muted"> · خودت</span> : null}
        </p>
        <p className="text-label text-muted" dir="ltr">
          {admin.phone}
        </p>
      </div>
      <div className="mt-3">
        <SectionChecks selected={sections} onToggle={toggle} />
      </div>
      {error ? (
        <p role="alert" className="mt-2 text-label text-danger">
          {error}
        </p>
      ) : null}
      {saved ? (
        <p role="status" className="mt-2 text-label text-muted">
          ذخیره شد.
        </p>
      ) : null}
      <Button type="button" variant="edge" size="sm" className="mt-3" disabled={pending || !dirty || sections.length === 0} onClick={save}>
        {pending ? "در حال ذخیره" : "ذخیرهٔ دسترسی"}
      </Button>
    </div>
  );
}

function SectionChecks({ selected, onToggle }: { selected: readonly AdminSection[]; onToggle: (id: AdminSection) => void }) {
  return (
    <ul className="grid gap-1 sm:grid-cols-2">
      {ADMIN_SECTIONS.map((section) => {
        const on = selected.includes(section.id);
        return (
          <li key={section.id}>
            <label className="flex min-h-11 items-center gap-2 rounded-control px-1 text-body">
              <input type="checkbox" checked={on} onChange={() => onToggle(section.id)} className="size-4 accent-ink" />
              <span>
                {section.label}
                <span className="text-label text-faint"> · {section.group}</span>
              </span>
            </label>
          </li>
        );
      })}
    </ul>
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
    <section>
      <h2 className="text-title font-semibold">بک‌آپ</h2>
      <p className="mt-1 max-w-xl text-pretty text-body text-muted">
        یک فایل JSON از برندها، فروشگاه‌ها، عطرها، دانستنی‌ها و حساب‌ها. رمز و نشست داخل فایل نیست.
      </p>
      <ul className="mt-3 flex flex-wrap gap-2">
        {lines.map(([label, count]) => (
          <li key={label} className="rounded-full border border-line bg-card px-3 py-1.5 text-label">
            {faNum(count)} {label}
          </li>
        ))}
      </ul>
      <a
        href="/api/admin/backup"
        className="mt-4 inline-flex min-h-11 items-center rounded-panel border border-line bg-card px-4 text-body font-medium hover:bg-press"
      >
        دانلود بک‌آپ
      </a>
    </section>
  );
}
