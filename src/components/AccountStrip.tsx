"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Avatar } from "@/components/Avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAccount } from "@/lib/account";

function persianDigits(value: string) {
  return value.replace(/[0-9]/g, (digit) => "۰۱۲۳۴۵۶۷۸۹"[Number(digit)] ?? digit);
}

export function AccountStrip() {
  const { ready, user } = useAccount();
  if (!ready) return null;

  if (!user) {
    return (
      <Card className="mt-5 flex items-center justify-between gap-3 p-4">
        <div className="min-w-0">
          <p className="text-title font-semibold">حساب آروما</p>
          <p className="text-label text-muted-foreground">اسم و آواتار، با شمارهٔ موبایل</p>
        </div>
        <Button href="/login" className="min-h-11 shrink-0">
          ورود
        </Button>
      </Card>
    );
  }

  return (
    <Card className="mt-5 p-0">
      <Link
        href="/account"
        className="flex min-h-16 items-center gap-3 rounded-surface p-3 outline-offset-2 focus-visible:outline-2 focus-visible:outline-ring"
      >
        <Avatar id={user.avatarId} />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-title font-semibold">{user.name}</span>
          <span className="block text-label text-muted-foreground">
            <bdi dir="ltr">{persianDigits(user.phone)}</bdi>
          </span>
        </span>
        <ChevronLeft className="size-4 shrink-0 text-muted-foreground" strokeWidth={1.5} aria-hidden="true" />
      </Link>
    </Card>
  );
}
