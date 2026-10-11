"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Assistant } from "@/components/Assistant";
import { BackIcon, BookmarkIcon } from "@/components/Icons";
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
    <div className="mx-auto flex h-dvh w-full max-w-lg flex-col bg-(--paper) sm:border-x sm:border-(--line) sm:shadow-[0_0_48px_rgba(28,33,31,0.06)]">
      <header className="shrink-0 border-b border-(--line) px-3 pt-[max(0.5rem,env(safe-area-inset-top))] pb-2">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center">
          <div>
            {back ? (
              <Link
                href={back.href}
                className="pressable quiet inline-flex min-h-11 items-center gap-0.5 rounded-full ps-1 pe-3 text-[14px] text-(--muted)"
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
            aria-label={ready && saved > 0 ? `قفسه، ${faNum(saved)} عطر ذخیره‌شده` : "قفسه"}
            className="pressable quiet justify-self-end inline-flex min-h-11 items-center gap-1.5 rounded-full ps-2.5 pe-3 text-[14px]"
          >
            <span className="relative">
              <BookmarkIcon className="size-5" />
              {ready && saved > 0 ? (
                <span className="absolute -top-1.5 -inset-s-2 grid h-4 min-w-4 place-items-center rounded-full bg-(--ink) px-1 text-[10px] font-semibold leading-none text-(--paper) ring-2 ring-(--paper)">
                  {faNum(saved)}
                </span>
              ) : null}
            </span>
            قفسه
          </Link>
        </div>
      </header>
      <main className="scroll-quiet min-h-0 flex-1 overflow-y-auto overscroll-contain">{children}</main>
      {pathname === "/results" && compare.length > 0 ? (
        <div className="border-t border-(--line) bg-(--card) px-4 py-3">
          {compare.length === 1 ? (
            <p className="text-[14px]">یکی دیگر را هم برای مقایسه انتخاب کن.</p>
          ) : (
            <Link
              href={`/compare?a=${compare[0]}&b=${compare[1]}`}
              className="pressable solid flex min-h-11 items-center justify-center rounded-xl bg-(--ink) text-[14px] font-medium text-(--paper)"
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
