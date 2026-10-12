"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Assistant } from "@/components/Assistant";
import { ButtonLink } from "@/components/Button";
import { BackIcon, BookmarkIcon } from "@/components/Icons";
import { ShopSheet } from "@/components/ShopSheet";
import { TermSheet } from "@/components/TermSheet";
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
  const { library, ready, compare } = useAroma();
  const saved = Object.keys(library).length;
  const compareNames = compare.map((slug) => getPerfume(slug)?.nameFa).filter((name): name is string => Boolean(name));

  return (
    <div className="mx-auto flex h-dvh w-full max-w-lg flex-col bg-paper sm:border-x sm:border-line sm:shadow-frame">
      <header className="shrink-0 border-b border-line px-3 pt-[max(0.5rem,env(safe-area-inset-top))] pb-2">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center">
          <div>
            {back ? (
              <ButtonLink
                href={back.href}
                variant="quiet"
                shape="pill"
                size="md"
                className="gap-0.5 ps-1 pe-3 font-normal text-muted"
              >
                <BackIcon className="size-5" />
                {back.label}
              </ButtonLink>
            ) : null}
          </div>
          <Link href="/" className="px-2 text-title font-bold tracking-tight">
            آروما
          </Link>
          <ButtonLink
            href="/shelf"
            variant="quiet"
            shape="pill"
            size="md"
            aria-current={pathname === "/shelf" ? "page" : undefined}
            aria-label={ready && saved > 0 ? `آرومای من، ${faNum(saved)} عطر` : "آرومای من"}
            className="justify-self-end gap-1.5 ps-2.5 pe-3 font-normal"
          >
            <span className="relative">
              <BookmarkIcon className="size-5" />
              {ready && saved > 0 ? (
                <span className="absolute -top-1.5 -inset-s-2 grid h-4 min-w-4 place-items-center rounded-full bg-ink px-1 text-badge font-semibold text-paper ring-2 ring-paper">
                  {faNum(saved)}
                </span>
              ) : null}
            </span>
            من
          </ButtonLink>
        </div>
      </header>
      <main className="scroll-quiet min-h-0 flex-1 overflow-y-auto overscroll-contain">{children}</main>
      {pathname === "/results" && compare.length > 0 ? (
        <div className="border-t border-line bg-card px-4 py-3">
          {compare.length === 1 ? (
            <p className="text-body">یکی دیگر را هم برای مقایسه انتخاب کن.</p>
          ) : (
            <ButtonLink
              href={`/compare?a=${compare[0]}&b=${compare[1]}`}
              shape="control"
              size="md"
              className="w-full"
            >
              مقایسهٔ {compareNames.join(" و ")}
            </ButtonLink>
          )}
        </div>
      ) : null}
      {composer ? <Assistant /> : null}
      <ShopSheet />
      <TermSheet />
    </div>
  );
}
