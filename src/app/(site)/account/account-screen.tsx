"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Avatar } from "@/components/Avatar";
import { Button, ButtonLink } from "@/components/Button";
import { Card, Note } from "@/components/Card";
import { TextField } from "@/components/TextField";
import { Shell } from "@/components/Shell";
import { useAccount } from "@/lib/account";
import { AVATARS, avatarLabel } from "@/lib/auth/avatars";
import type { PublicUser } from "@/lib/auth/public-user";
import { cn } from "@/lib/format";

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
        <div className="px-5 pt-6" />
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
      <div className="relative overflow-hidden px-5 pt-5 pb-[max(2.5rem,env(safe-area-inset-bottom))]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-[radial-gradient(110%_80%_at_50%_-20%,color-mix(in_srgb,var(--color-moss)_88%,transparent),transparent)]"
        />

        <div className="relative">
          {welcome ? (
            <Note className="mb-4 text-pretty" role="status">
              حسابت ساخته شد. آواتار و اسم را همین‌جا می‌توانی تنظیم کنی.
            </Note>
          ) : null}

          <Card shadow="sheet" className="flex items-center gap-4 px-4 py-4">
            <Avatar id={avatarId} className="size-16 shrink-0 ring-2 ring-brass/40" />
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-headline font-bold">{name.trim() || user.name}</h1>
              <p className="mt-1 text-body text-muted">
                <bdi dir="ltr">{user.phone}</bdi>
              </p>
              <p className="mt-1 text-label text-faint">{avatarLabel(avatarId)}</p>
            </div>
          </Card>

          <form className="mt-5" method="post" onSubmit={save}>
            <Card shadow="card" className="px-4 py-4">
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-label text-muted">آواتار</p>
                <p className="text-label text-faint">یکی را انتخاب کن</p>
              </div>
              <div className="mt-3 grid grid-cols-4 gap-2.5">
                {AVATARS.map((avatar) => {
                  const selected = avatar.id === avatarId;
                  return (
                    <button
                      key={avatar.id}
                      type="button"
                      aria-pressed={selected}
                      aria-label={avatar.label}
                      onClick={() => {
                        setAvatarId(avatar.id);
                        setSaved(false);
                      }}
                      className={cn(
                        "grid h-16 place-items-center rounded-panel border transition-[background-color,box-shadow,border-color]",
                        selected
                          ? "border-ink bg-moss shadow-card ring-2 ring-ink/15"
                          : "border-line bg-card hover:bg-press",
                      )}
                    >
                      <Avatar id={avatar.id} className="size-11" />
                    </button>
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
                <p role="alert" className="mt-3 text-label text-pretty text-danger">
                  {error}
                </p>
              ) : null}
              {saved ? (
                <Note className="mt-3 text-pretty" role="status">
                  تغییرات ذخیره شد.
                </Note>
              ) : null}

              <Button type="submit" className="mt-5 w-full" disabled={pending || !dirty || name.trim().length < 2}>
                {pending ? "در حال ذخیره…" : "ذخیره تغییرات"}
              </Button>
            </Card>
          </form>

          <ButtonLink href="/shelf" variant="edge" className="mt-4 w-full">
            برو به آرومای من
          </ButtonLink>
          <Button
            type="button"
            variant="quiet"
            className="mt-2 w-full text-muted"
            onClick={() => void logout()}
          >
            خروج از حساب
          </Button>
        </div>
      </div>
    </Shell>
  );
}
