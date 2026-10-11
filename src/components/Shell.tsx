"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Assistant } from "@/components/Assistant";
import { BackIcon } from "@/components/Icons";
import { ShopSheet } from "@/components/ShopSheet";
import { getPerfume } from "@/lib/catalog";
import { faNum } from "@/lib/format";
import { useAroma } from "@/lib/store";

export function Shell({
  children,
  composer = false,
  back,
}: {
  children: React.ReactNode;
  composer?: boolean;
  back?: { href: string; label: string };
}) {
  const pathname = usePathname();
  const { taste, ready, compare } = useAroma();
  const saved = Object.values(taste).filter((value) => value === "like" || value === "try").length;
  const compareNames = compare.map((slug) => getPerfume(slug)?.nameFa).filter((name): name is string => Boolean(name));

  return (
    <div className="mx-auto flex h-dvh w-full max-w-[32rem] flex-col bg-[var(--paper)] sm:border-x sm:border-[var(--line)] sm:shadow-[0_0_48px_rgba(28,33,31,0.06)]">
      <header className="shrink-0 border-b border-[var(--line)] px-3 pt-[max(0.5rem,env(safe-area-inset-top))] pb-2">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center">
          <div>
            {back ? (
              <Link
                href={back.href}
                className="pressable quiet inline-flex min-h-11 items-center gap-0.5 rounded-full ps-1 pe-3 text-[14px] text-[var(--muted)]"
              >
                <BackIcon className="size-5" />
                {back.label}
              </Link>
            ) : null}
          </div>
          <Link href="/" className="px-2 text-[16px] font-bold tracking-tight">
            آروما
          </Link>
          <Link
            href="/shelf"
            aria-current={pathname === "/shelf" ? "page" : undefined}
            className="pressable quiet justify-self-end inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 text-[14px]"
          >
            قفسه
            {ready && saved > 0 ? (
              <span className="grid h-5 min-w-5 place-items-center rounded-full bg-[var(--ink)] px-1 text-[11px] font-semibold text-[var(--paper)]">
                {faNum(saved)}
              </span>
            ) : null}
          </Link>
        </div>
      </header>
      <main className="scroll-quiet min-h-0 flex-1 overflow-y-auto overscroll-contain">{children}</main>
      {pathname === "/results" && compare.length > 0 ? (
        <div className="border-t border-[var(--line)] bg-[var(--card)] px-4 py-3">
          {compare.length === 1 ? (
            <p className="text-[14px]">یکی دیگر را هم برای مقایسه انتخاب کن.</p>
          ) : (
            <Link
              href={`/compare?a=${compare[0]}&b=${compare[1]}`}
              className="pressable solid flex min-h-11 items-center justify-center rounded-xl bg-[var(--ink)] text-[14px] font-medium text-[var(--paper)]"
            >
              مقایسهٔ {compareNames.join(" و ")}
            </Link>
          )}
        </div>
      ) : null}
      {composer ? <Assistant /> : null}
      <ShopSheet />
    </div>
  );
}
