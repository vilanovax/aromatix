"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Assistant } from "@/components/Assistant";
import { ButtonLink } from "@/components/Button";
import { BackIcon, BrandsIcon, LearnIcon, ProfileIcon } from "@/components/Icons";
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
  const showCompareBar =
    compare.length > 0 &&
    (pathname === "/results" || pathname === "/shelf" || pathname.startsWith("/perfume/"));

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
          <Link
            href="/"
            className="flex min-h-11 items-center gap-2 rounded-control px-2 text-title font-bold tracking-tight text-ink"
          >
            <Image src="/brand/mark-192.png" alt="" width={134} height={192} priority className="h-7 w-auto" />
            آروما
          </Link>
          <div className="flex items-center justify-self-end gap-0.5">
            <ButtonLink
              href="/brands"
              variant="quiet"
              shape="pill"
              size="icon"
              aria-current={pathname.startsWith("/brands") ? "page" : undefined}
              aria-label="برندها"
            >
              <BrandsIcon className="size-5" />
            </ButtonLink>
            <ButtonLink
              href="/learn"
              variant="quiet"
              shape="pill"
              size="icon"
              aria-current={pathname.startsWith("/learn") ? "page" : undefined}
              aria-label="دانستنی‌ها"
            >
              <LearnIcon className="size-5" />
            </ButtonLink>
            <ButtonLink
              href="/shelf"
              variant="quiet"
              shape="pill"
              size="icon"
              aria-current={pathname === "/shelf" ? "page" : undefined}
              aria-label={ready && saved > 0 ? `آرومای من، ${faNum(saved)} عطر` : "آرومای من"}
            >
              <span className="relative">
                <ProfileIcon className="size-5" />
                {ready && saved > 0 ? (
                  <span className="absolute -top-1.5 -inset-s-2 grid h-4 min-w-4 place-items-center rounded-full bg-brass px-1 text-badge font-semibold text-ink ring-2 ring-paper">
                    {faNum(saved)}
                  </span>
                ) : null}
              </span>
            </ButtonLink>
          </div>
        </div>
      </header>
      <main className="scroll-quiet min-h-0 flex-1 overflow-y-auto overscroll-contain">{children}</main>
      {showCompareBar ? (
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
      {composer ? <Assistant quiet={pathname === "/results" && compare.length > 0} /> : null}
      <ShopSheet />
      <TermSheet />
    </div>
  );
}
