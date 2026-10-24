"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { BookOpen, ChevronRight, LayoutGrid, UserRound } from "lucide-react";
import { Assistant } from "@/components/Assistant";
import { Avatar } from "@/components/Avatar";
import { Button } from "@/components/ui/button";
import { ShopSheet } from "@/components/ShopSheet";
import { TermSheet } from "@/components/TermSheet";
import { useAccount } from "@/lib/account";
import { getPerfume } from "@/lib/catalog";
import { cn, faNum } from "@/lib/format";
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
  const { user } = useAccount();
  useEffect(() => {
    const sections = new Set(["/", "/results", "/shelf", "/brands", "/learn", "/guide", "/browse", "/palette", "/layer", "/couple", "/how", "/compare"]);
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
  const onBrands = pathname.startsWith("/brands");
  const onLearn = pathname.startsWith("/learn");
  const onShelf = pathname === "/shelf";
  const shelfCount = ready && saved > 0 ? saved : 0;

  return (
    <div className="mx-auto flex h-dvh w-full max-w-lg flex-col bg-paper sm:border-x sm:border-line sm:shadow-frame">
      <header
        className={
          sparseChrome
            ? "vf app shrink-0 px-3 pt-[max(0.5rem,env(safe-area-inset-top))] pb-1"
            : "vf app shrink-0 border-b border-border/80 bg-background/90 px-3 pt-[max(0.5rem,env(safe-area-inset-top))] pb-2 backdrop-blur-sm"
        }
      >
        <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2">
          <div className="min-w-0 justify-self-start">
            {back ? (
              <Button
                href={back.href}
                variant="ghost"
                className="max-w-full min-h-11 gap-1 px-2 font-medium"
                aria-label={`برگشت به ${back.label}`}
              >
                <ChevronRight strokeWidth={2} className="size-4 shrink-0" />
                <span className="min-w-0 truncate text-label">{back.label}</span>
              </Button>
            ) : null}
          </div>
          {brand ? (
            <Link
              href="/"
              aria-label="خانهٔ آروما"
              className="flex min-h-11 items-center gap-2 rounded-full px-2.5 text-title font-bold text-foreground outline-offset-2 transition-colors hover:bg-secondary focus-visible:outline-2 focus-visible:outline-ring"
            >
              <Image src="/brand/mark-192.png" alt="" width={134} height={192} priority className="h-7 w-auto" />
              <span>آروما</span>
            </Link>
          ) : (
            <div />
          )}
          {browse ? (
            <nav aria-label="میانبرهای سایت" className="justify-self-end">
              <div className="flex items-center gap-0.5 rounded-full border border-border bg-secondary/70 p-0.5">
                <Button
                  href="/brands"
                  variant={onBrands ? "default" : "ghost"}
                  size="icon"
                  aria-current={onBrands ? "page" : undefined}
                  aria-label="برندها"
                  className={cn("min-h-11 min-w-11 rounded-full!", !onBrands && "text-muted-foreground hover:text-foreground")}
                >
                  <LayoutGrid strokeWidth={onBrands ? 2 : 1.5} />
                </Button>
                <Button
                  href="/learn"
                  variant={onLearn ? "default" : "ghost"}
                  size="icon"
                  aria-current={onLearn ? "page" : undefined}
                  aria-label="دانستنی‌ها"
                  className={cn("min-h-11 min-w-11 rounded-full!", !onLearn && "text-muted-foreground hover:text-foreground")}
                >
                  <BookOpen strokeWidth={onLearn ? 2 : 1.5} />
                </Button>
                <Button
                  href="/shelf"
                  variant={onShelf ? "default" : "ghost"}
                  size="icon"
                  aria-current={onShelf ? "page" : undefined}
                  aria-label={
                    user
                      ? shelfCount > 0
                        ? `قفسهٔ ${user.name}، ${faNum(shelfCount)} عطر`
                        : `قفسهٔ ${user.name}`
                      : shelfCount > 0
                        ? `قفسهٔ من، ${faNum(shelfCount)} عطر`
                        : "قفسهٔ من"
                  }
                  className={cn(
                    "relative min-h-11 min-w-11 rounded-full!",
                    !onShelf && "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {user ? (
                    <Avatar
                      id={user.avatarId}
                      className={cn(
                        "size-6 aspect-square shrink-0",
                        onShelf && "ring-2 ring-primary-foreground/70",
                      )}
                    />
                  ) : (
                    <UserRound strokeWidth={onShelf ? 2 : 1.5} />
                  )}
                  {shelfCount > 0 ? (
                    <span
                      aria-hidden="true"
                      className="absolute inset-e-1 top-1 size-2 rounded-full bg-brand ring-2 ring-secondary"
                    />
                  ) : null}
                </Button>
              </div>
            </nav>
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
