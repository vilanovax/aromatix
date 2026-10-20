"use client";

import { useEffect, useMemo, useRef } from "react";
import { Store } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Separator } from "@/components/ui/separator";
import { getPerfume, shownOffers } from "@/lib/catalog";
import { offerAvailability, offerStockLine } from "@/lib/offer-stock";
import { cn, millionToman } from "@/lib/format";
import { useAroma } from "@/lib/store";
import type { ShopOffer } from "@/lib/types";

export function ShopSheet() {
  const { shopFor, closeShops } = useAroma();
  const closeRef = useRef<HTMLButtonElement>(null);
  const perfume = shopFor ? getPerfume(shopFor) : undefined;
  const shops = useMemo(() => (perfume ? shownOffers(perfume).sort(compareShops) : []), [perfume]);

  useEffect(() => {
    if (!perfume) return;
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeShops();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [perfume, closeShops]);

  if (!perfume) return null;

  return (
    <div className="vf app fixed inset-0 z-40 flex items-end justify-center bg-transparent">
      <button type="button" className="absolute inset-0 bg-foreground/40" aria-label="بستن فروشگاه‌ها" onClick={closeShops} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="shop-title"
        aria-describedby="shop-perfume"
        className="vf app sheet-panel scroll-quiet relative z-10 max-h-[80dvh] w-full max-w-lg overflow-y-auto overscroll-contain rounded-t-surface border border-border bg-card px-5 pt-3 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-surface"
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-border" aria-hidden="true" />
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 id="shop-title" className="text-title font-semibold">
              فروشگاه‌ها
            </h2>
            <p id="shop-perfume" className="mt-1 text-pretty text-body text-muted-foreground">
              {perfume.nameFa}
            </p>
          </div>
          <Button ref={closeRef} variant="ghost" onClick={closeShops} className="min-h-11 shrink-0 px-3">
            بستن
          </Button>
        </div>

        {shops.length === 0 ? (
          <EmptyState className="mt-5" icon={Store} title="فروشگاه فعالی برای این عطر نیست" />
        ) : (
          <ul className="mt-2">
            {shops.map((shop, index) => (
              <li key={shop.shopSlug ?? shop.shop}>
                {index > 0 ? <Separator /> : null}
                <div className="py-4">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="min-w-0 text-title font-semibold">{shop.shop}</p>
                    <p className="shrink-0 text-body font-medium tabular-nums">{millionToman(shop.price)}</p>
                  </div>
                  <p className="mt-2 flex items-center gap-2 text-label text-muted-foreground">
                    <span
                      aria-hidden="true"
                      className={cn(
                        "size-2 shrink-0 rounded-full",
                        offerAvailability(shop) === "in_stock" && "bg-stock-ok",
                        offerAvailability(shop) === "unknown" && "bg-stock-pending",
                        offerAvailability(shop) === "out_of_stock" && "bg-destructive",
                      )}
                    />
                    <span>{offerStockLine(shop)}</span>
                  </p>
                  {offerAvailability(shop) === "in_stock" ? (
                    <Button href={shop.href} size="lg" className="mt-4 min-h-12 w-full">
                      خرید از {shop.shop}
                    </Button>
                  ) : (
                    <Alert variant="warning" className="mt-4">
                      {offerAvailability(shop) === "out_of_stock"
                        ? "این فروشگاه این عطر را ندارد. آخرین قیمت برای مقایسه مانده و لینک خرید نیست."
                        : "آخرین قیمت ثبت‌شده است. موجودی تأیید نشده، برای همین لینک خرید نیست."}
                    </Alert>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function compareShops(a: ShopOffer, b: ShopOffer) {
  const rank = (offer: ShopOffer) => {
    const stock = offerAvailability(offer);
    if (stock === "in_stock") return 0;
    if (stock === "unknown") return 1;
    return 2;
  };
  const byStock = rank(a) - rank(b);
  if (byStock !== 0) return byStock;
  return a.price - b.price;
}
