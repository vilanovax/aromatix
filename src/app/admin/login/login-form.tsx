"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toAsciiDigits } from "@/lib/auth/phone";

export function AdminLoginForm() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ phone, password }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(data.error ?? "ورود نشد.");
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch {
      setError("الان مدیریت در دسترس نیست. کمی بعد دوباره امتحان کن.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form method="post" action="/admin/login" className="space-y-4" onSubmit={submit}>
      <label className="block space-y-1.5 text-sm text-muted-foreground" htmlFor="admin-phone">
        شماره موبایل
        <Input
          id="admin-phone"
          name="phone"
          inputMode="tel"
          autoComplete="username"
          dir="ltr"
          value={phone}
          onChange={(event) => setPhone(toAsciiDigits(event.target.value))}
        />
      </label>
      <label className="block space-y-1.5 text-sm text-muted-foreground" htmlFor="admin-password">
        رمز
        <Input
          id="admin-password"
          name="password"
          type="password"
          autoComplete="current-password"
          dir="ltr"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </label>
      {error ? <Alert variant="destructive">{error}</Alert> : null}
      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? "در حال ورود" : "ورود به مدیریت"}
      </Button>
    </form>
  );
}
