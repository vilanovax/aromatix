"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/Button";
import { TextField } from "@/components/TextField";

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
    <form method="post" action="/admin/login" onSubmit={submit}>
      <TextField
        label="شماره موبایل"
        name="phone"
        inputMode="tel"
        autoComplete="username"
        latinDigits
        value={phone}
        onChange={(event) => setPhone(event.target.value)}
      />
      <TextField
        label="رمز"
        name="password"
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
      />
      {error ? (
        <p role="alert" className="mt-3 text-label text-pretty text-danger">
          {error}
        </p>
      ) : null}
      <Button type="submit" className="mt-5 w-full" disabled={pending}>
        {pending ? "در حال ورود" : "ورود به مدیریت"}
      </Button>
    </form>
  );
}
