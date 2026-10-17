"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { BookOpen, ChevronRight, LayoutGrid, UserRound } from "lucide-react";
import { Assistant } from "@/components/Assistant";
import { Button } from "@/components/ui/button";
import { ShopSheet } from "@/components/ShopSheet";
import { TermSheet } from "@/components/TermSheet";
import { getPerfume } from "@/lib/catalog";
import { faNum } from "@/lib/format";
import { useAroma } from "@/lib/store";
import { recordUsage } from "@/lib/usage";

export function Shell({
  children,
  composer = false,
  browse = true,
  brand = true,
  back,
}: {
  children: React.ReactNode;
  composer?: boolean;
  /** وقتی false، آیکون‌های کاوش هدر پنهان می‌شوند (مثلاً ورود و ثبت‌نام). */
  browse?: boolean;
  /** وقتی false، لوگو و نام برند از هدر برداشته می‌شود (صفحات احراز هویت). */
  brand?: boolean;
  back?: { href: string; label: string };
}) {
  const pathname = usePathname();
  const { library, ready, compare } = useAroma();
  useEffect(() => {
    const sections = new Set(["/", "/results", "/shelf", "/brands", "/learn", "/guide", "/compare"]);
    if (sections.has(pathname) || pathname.startsWith("/reference/")) recordUsage("section_view", pathname);
    const perfume = pathname.match(/^\/perfume\/([^/?#]+)/);
    if (perfume) recordUsage("perfume_view", decodeURIComponent(perfume[1]));
    const brand = pathname.match(/^\/brands\/([^/?#]+)/);
    if (brand) recordUsage("brand_view", decodeURIComponent(brand[1]));
  }, [pathname]);
  const saved = Object.keys(library).length;
  const compareNames = compare.map((slug) => getPerfume(slug)?.nameFa).filter((name): name is string => Boolean(name));
  const showCompareBar =
    compare.length > 0 &&
    (pathname === "/results" || pathname === "/shelf" || pathname.startsWith("/perfume/"));
  const sparseChrome = !browse && !brand;

  return (
    <div className="mx-auto flex h-dvh w-full max-w-lg flex-col bg-paper sm:border-x sm:border-line sm:shadow-frame">
      <header
        className={
          sparseChrome
            ? "vf app shrink-0 px-3 pt-[max(0.5rem,env(safe-area-inset-top))] pb-1"
            : "vf app shrink-0 border-b border-border px-3 pt-[max(0.5rem,env(safe-area-inset-top))] pb-2"
        }
      >
        <div className="grid grid-cols-[1fr_auto_1fr] items-center">
          <div>
            {back ? (
              <Button href={back.href} variant="ghost" className="min-h-11 gap-1 px-2 font-medium">
                <ChevronRight strokeWidth={2} />
                {back.label}
              </Button>
            ) : null}
          </div>
          {brand ? (
            <Link
              href="/"
              className="flex min-h-11 items-center gap-2 rounded-control px-2 text-title font-bold text-foreground"
            >
              <Image src="/brand/mark-192.png" alt="" width={134} height={192} priority className="h-8 w-auto" />
              آروما
            </Link>
          ) : (
            <div />
          )}
          {browse ? (
            <div className="flex items-center justify-self-end gap-1">
              <Button
                href="/brands"
                variant={pathname.startsWith("/brands") ? "secondary" : "ghost"}
                size="icon"
                aria-current={pathname.startsWith("/brands") ? "page" : undefined}
                aria-label="برندها"
                className="min-h-11 min-w-11"
              >
                <LayoutGrid strokeWidth={1.5} />
              </Button>
              <Button
                href="/learn"
                variant={pathname.startsWith("/learn") ? "secondary" : "ghost"}
                size="icon"
                aria-current={pathname.startsWith("/learn") ? "page" : undefined}
                aria-label="دانستنی‌ها"
                className="min-h-11 min-w-11"
              >
                <BookOpen strokeWidth={1.5} />
              </Button>
              <Button
                href="/shelf"
                variant={pathname === "/shelf" ? "secondary" : "ghost"}
                size="md"
                aria-current={pathname === "/shelf" ? "page" : undefined}
                aria-label={ready && saved > 0 ? `قفسهٔ من، ${faNum(saved)} عطر` : "قفسهٔ من"}
                className="min-h-11 gap-1 px-2"
              >
                <UserRound strokeWidth={1.5} />
                <span className="text-label">قفسهٔ من</span>
              </Button>
            </div>
          ) : (
            <div />
          )}
        </div>
      </header>
      <main className="scroll-quiet min-h-0 flex-1 overflow-y-auto overscroll-contain">{children}</main>
      {showCompareBar ? (
        <div className="vf app border-t border-border bg-card px-4 py-3">
          {compare.length === 1 ? (
            <p className="text-body">یکی دیگر را هم برای مقایسه انتخاب کن.</p>
          ) : (
            <Button href={`/compare?a=${compare[0]}&b=${compare[1]}`} size="lg" className="min-h-12 w-full">
              مقایسهٔ {compareNames.join(" و ")}
            </Button>
          )}
        </div>
      ) : null}
      {composer ? <Assistant quiet={pathname === "/results" && compare.length > 0} /> : null}
      <ShopSheet />
      <TermSheet />
    </div>
  );
}
