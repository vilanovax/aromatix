"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Avatar } from "@/components/Avatar";
import { TextField } from "@/components/TextField";
import { Shell } from "@/components/Shell";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAccount } from "@/lib/account";
import { AVATARS, avatarLabel } from "@/lib/auth/avatars";
import type { PublicUser } from "@/lib/auth/public-user";
import { cn } from "@/lib/format";

function persianDigits(value: string) {
  return value.replace(/[0-9]/g, (digit) => "۰۱۲۳۴۵۶۷۸۹"[Number(digit)] ?? digit);
}

export function AccountScreen() {
  const router = useRouter();
  const params = useSearchParams();
  const { ready, user, setUser } = useAccount();
  const [name, setName] = useState("");
  const [avatarId, setAvatarId] = useState("ink");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [saved, setSaved] = useState(false);
  const [welcome, setWelcome] = useState(false);

  useEffect(() => {
    if (!ready) return;
    if (!user) {
      router.replace("/login?next=/account");
      return;
    }
    setName(user.name);
    setAvatarId(user.avatarId);
  }, [ready, user, router]);

  useEffect(() => {
    if (params.get("welcome") !== "1") return;
    setWelcome(true);
    router.replace("/account", { scroll: false });
  }, [params, router]);

  if (!ready || !user) {
    return (
      <Shell back={{ href: "/shelf", label: "آرومای من" }}>
        <div className="vf app px-5 pt-6" aria-hidden>
          <Card className="flex items-center gap-4 p-4">
            <Skeleton className="size-16 shrink-0 rounded-full" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
          </Card>
        </div>
      </Shell>
    );
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setSaved(false);
    try {
      const response = await fetch("/api/me", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, avatarId }),
      });
      const data = (await response.json()) as { user?: PublicUser; error?: string };
      if (!response.ok || !data.user) {
        setError(data.error ?? "ذخیره نشد.");
        return;
      }
      setUser(data.user);
      setSaved(true);
      setWelcome(false);
    } catch {
      setError("الان حساب در دسترس نیست. کمی بعد دوباره امتحان کن.");
    } finally {
      setPending(false);
    }
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/");
    router.refresh();
  }

  const dirty = name.trim() !== user.name || avatarId !== user.avatarId;

  return (
    <Shell back={{ href: "/shelf", label: "آرومای من" }}>
      <div className="vf app px-5 pt-5 pb-[max(2.5rem,env(safe-area-inset-bottom))]">
        {welcome ? (
          <Alert className="mb-4">حسابت ساخته شد. آواتار و اسم را همین‌جا می‌توانی تنظیم کنی.</Alert>
        ) : null}

        <Card className="flex items-center gap-4 p-4">
          <Avatar id={avatarId} className="size-16 aspect-square shrink-0 ring-2 ring-brand/40" />
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-headline font-bold">{name.trim() || user.name}</h1>
            <p className="mt-1 text-body text-muted-foreground">
              <bdi dir="ltr">{persianDigits(user.phone)}</bdi>
            </p>
            <p className="mt-1 text-label text-muted-foreground">{avatarLabel(avatarId)}</p>
          </div>
        </Card>

        <form className="mt-5" method="post" onSubmit={save}>
          <Card className="px-4 py-4">
            <p className="text-label text-muted-foreground">یکی را انتخاب کن</p>
            <div className="mt-3 grid grid-cols-4 gap-3">
              {AVATARS.map((avatar) => {
                const selected = avatar.id === avatarId;
                return (
                  <Button
                    key={avatar.id}
                    type="button"
                    variant={selected ? "secondary" : "outline"}
                    aria-pressed={selected}
                    aria-label={avatar.label}
                    onClick={() => {
                      setAvatarId(avatar.id);
                      setSaved(false);
                    }}
                    className={cn("!size-16 !rounded-surface", selected && "ring-2 ring-primary", !selected && "!bg-card")}
                  >
                    <Avatar id={avatar.id} className="size-11 aspect-square" />
                  </Button>
                );
              })}
            </div>

            <TextField
              id="account-name"
              label="اسم"
              autoComplete="name"
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                setSaved(false);
              }}
              error={Boolean(error)}
            />

            {error ? (
              <Alert variant="destructive" className="mt-4">
                {error}
              </Alert>
            ) : null}
            {saved ? (
              <Alert variant="success" className="mt-4">
                تغییرات ذخیره شد.
              </Alert>
            ) : null}

            <Button
              type="submit"
              size="lg"
              className="mt-5 min-h-12 w-full"
              disabled={pending || !dirty || name.trim().length < 2}
            >
              {pending ? "در حال ذخیره…" : "ذخیره تغییرات"}
            </Button>
          </Card>
        </form>

        <Button href="/shelf" variant="outline" size="lg" className="mt-4 min-h-12 w-full">
          برو به آرومای من
        </Button>
        <Button type="button" variant="ghost" className="mt-2 min-h-11 w-full" onClick={() => void logout()}>
          خروج از حساب
        </Button>
      </div>
    </Shell>
  );
}
