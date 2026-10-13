"use client";

import Link from "next/link";
import { Avatar } from "@/components/Avatar";
import { ButtonLink } from "@/components/Button";
import { useAccount } from "@/lib/account";

export function AccountStrip() {
  const { ready, user } = useAccount();
  if (!ready) return null;

  if (!user) {
    return (
      <div className="mt-5 flex items-center justify-between gap-3 rounded-panel border border-line bg-card p-4">
        <div>
          <p className="text-title font-semibold">حساب آروما</p>
          <p className="text-label text-muted">اسم و آواتار، با شمارهٔ موبایل</p>
        </div>
        <ButtonLink href="/login" size="md">
          ورود
        </ButtonLink>
      </div>
    );
  }

  return (
    <Link
      href="/account"
      className="mt-5 flex items-center gap-3 rounded-panel border border-line bg-card p-3"
    >
      <Avatar id={user.avatarId} />
      <span className="min-w-0">
        <span className="block truncate text-title font-semibold">{user.name}</span>
        <span className="block text-label text-muted">
          <bdi dir="ltr">{user.phone}</bdi>
        </span>
      </span>
    </Link>
  );
}
