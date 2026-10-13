"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { safeNext } from "@/app/login/login-form";
import { AuthFrame } from "@/components/AuthFrame";
import { Button } from "@/components/Button";
import { Note } from "@/components/Card";
import { TextField } from "@/components/TextField";
import { useAccount } from "@/lib/account";
import type { PublicUser } from "@/lib/auth/public-user";

function withWelcome(path: string) {
  const url = new URL(path, "https://aroma.local");
  url.searchParams.set("welcome", "1");
  return `${url.pathname}${url.search}`;
}

export function RegisterForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNext(params.get("next"));
  const { setUser } = useAccount();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [createdName, setCreatedName] = useState<string | null>(null);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, phone, password }),
      });
      const data = (await response.json()) as { user?: PublicUser; error?: string };
      if (!response.ok || !data.user) {
        setError(data.error ?? "ثبت‌نام انجام نشد.");
        return;
      }
      setUser(data.user);
      setCreatedName(data.user.name);
    } catch {
      setError("الان حساب در دسترس نیست. کمی بعد دوباره امتحان کن.");
    } finally {
      setPending(false);
    }
  }

  function continueAfterCreate() {
    router.push(withWelcome(next));
    router.refresh();
  }

  const ready = name.trim().length >= 2 && phone.trim().length > 0 && password.length >= 8;

  if (createdName) {
    return (
      <AuthFrame title="حساب ساخته شد" lede={`${createdName}، خوش آمدی.`}>
        <Note className="mt-0 text-pretty">
          قفسه و سلیقه‌ات از این به بعد روی همین شماره می‌ماند. می‌توانی آواتار را در حساب عوض کنی.
        </Note>
        <Button type="button" className="mt-5 w-full" onClick={continueAfterCreate}>
          ادامه
        </Button>
      </AuthFrame>
    );
  }

  return (
    <AuthFrame title="ساخت حساب" lede="اسم و موبایل کافی است؛ آواتار را بعداً در حساب عوض می‌کنی.">
      <form method="post" onSubmit={submit}>
        <TextField
          id="name"
          label="اسم"
          className="mt-0"
          autoComplete="name"
          placeholder="مثلاً ریما"
          value={name}
          onChange={(event) => setName(event.target.value)}
          error={Boolean(error)}
        />
        <TextField
          id="phone"
          label="موبایل"
          latinDigits
          inputMode="tel"
          autoComplete="username"
          dir="ltr"
          placeholder="0912..."
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          error={Boolean(error)}
        />
        <TextField
          id="password"
          label="رمز"
          type="password"
          latinDigits
          hint="حداقل ۸ حرف"
          autoComplete="new-password"
          dir="ltr"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          error={Boolean(error)}
        />
        {error ? (
          <p role="alert" className="mt-3 text-label text-pretty text-danger">
            {error}
          </p>
        ) : null}
        <Button type="submit" className="mt-5 w-full" disabled={pending || !ready}>
          {pending ? "در حال ساخت حساب…" : "ساخت حساب"}
        </Button>
      </form>
      <p className="mt-4 text-center text-body text-muted">
        حساب داری؟{" "}
        <Link
          href={`/login?next=${encodeURIComponent(next)}`}
          className="font-semibold text-ink underline-offset-4 hover:underline"
        >
          ورود
        </Link>
      </p>
    </AuthFrame>
  );
}
