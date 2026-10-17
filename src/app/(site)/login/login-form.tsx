"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { AuthFrame } from "@/components/AuthFrame";
import { TextField } from "@/components/TextField";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useAccount } from "@/lib/account";
import type { PublicUser } from "@/lib/auth/public-user";

export function safeNext(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/login") || value.startsWith("/register")) {
    return "/account";
  }
  return value;
}

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNext(params.get("next"));
  const { setUser } = useAccount();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ phone, password }),
      });
      const data = (await response.json()) as { user?: PublicUser; error?: string };
      if (!response.ok || !data.user) {
        setError(data.error ?? "شماره یا رمز درست نیست.");
        return;
      }
      setUser(data.user);
      router.push(next);
      router.refresh();
    } catch {
      setError("الان حساب در دسترس نیست. کمی بعد دوباره امتحان کن.");
    } finally {
      setPending(false);
    }
  }

  return (
    <AuthFrame title="ورود" lede="قفسه و سلیقه‌ات روی همین شماره می‌ماند.">
      <form method="post" onSubmit={submit}>
        <TextField
          id="phone"
          label="موبایل"
          className="mt-0"
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
          autoComplete="current-password"
          dir="ltr"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          error={Boolean(error)}
        />
        {error ? (
          <Alert variant="destructive" className="mt-4">
            {error}
          </Alert>
        ) : null}
        <Button type="submit" size="lg" className="mt-5 min-h-12 w-full" disabled={pending || !phone.trim() || !password}>
          {pending ? "در حال ورود…" : "ورود"}
        </Button>
      </form>
      <p className="mt-4 text-start text-body text-muted-foreground">
        حساب نداری؟{" "}
        <Link
          href={`/register?next=${encodeURIComponent(next)}`}
          className="font-semibold text-foreground underline-offset-4 hover:underline"
        >
          ثبت‌نام
        </Link>
      </p>
    </AuthFrame>
  );
}
