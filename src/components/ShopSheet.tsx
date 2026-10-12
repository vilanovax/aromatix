"use client";

import { useEffect, useMemo, useRef } from "react";
import { Button, buttonClass } from "@/components/Button";
import { getPerfume } from "@/lib/catalog";
import { cn, millionToman } from "@/lib/format";
import { useAroma } from "@/lib/store";
import type { ShopOffer } from "@/lib/types";

export function ShopSheet() {
  const { shopFor, closeShops } = useAroma();
  const closeRef = useRef<HTMLButtonElement>(null);
  const perfume = shopFor ? getPerfume(shopFor) : undefined;
  const shops = useMemo(
    () => (perfume ? [...perfume.shops].sort(compareShops) : []),
    [perfume],
  );

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
    <div className="fixed inset-0 z-40 flex items-end justify-center">
      <button type="button" className="absolute inset-0 bg-ink/40" aria-label="بستن فروشگاه‌ها" onClick={closeShops} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="shop-title"
        aria-describedby="shop-perfume"
        className="scroll-quiet sheet-panel relative z-10 max-h-[80dvh] w-full max-w-lg overflow-y-auto overscroll-contain rounded-t-sheet bg-card px-5 pt-3 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-sheet"
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-line" aria-hidden="true" />
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 id="shop-title" className="text-title font-semibold">
              فروشگاه‌ها
            </h2>
            <p id="shop-perfume" className="mt-1 text-pretty text-body text-muted">
              {perfume.nameFa}
            </p>
          </div>
          <Button
            ref={closeRef}
            variant="quiet"
            shape="pill"
            size="sm"
            onClick={closeShops}
            className="shrink-0 px-3 py-2 text-body outline-offset-2 focus-visible:outline-2 focus-visible:outline-ink"
          >
            بستن
          </Button>
        </div>

        <ul className="mt-5 divide-y divide-line">
          {shops.map((shop) => (
            <li key={shop.shop} className="py-4">
              <div className="flex items-baseline justify-between gap-3">
                <p className="min-w-0 text-title font-semibold">{shop.shop}</p>
                <p className="shrink-0 text-body font-medium tabular-nums">{millionToman(shop.price)}</p>
              </div>
              <p className="mt-1.5 flex items-center gap-1.5 text-label text-muted">
                <span
                  aria-hidden="true"
                  className={cn(
                    "size-1.5 shrink-0 rounded-full",
                    shop.stockConfirmed ? "bg-stock-ok" : "bg-stock-pending",
                  )}
                />
                <span>
                  {shop.stockConfirmed
                    ? `موجود · بررسی ${shop.checkedOn}`
                    : `موجودی تأیید نشده · بررسی ${shop.checkedOn}`}
                </span>
              </p>
              {shop.stockConfirmed ? (
                <a
                  href={shop.href}
                  target="_blank"
                  rel="noreferrer"
                  className={buttonClass({
                    shape: "control",
                    size: "lg",
                    className: "mt-3.5 w-full outline-offset-2 focus-visible:outline-2 focus-visible:outline-paper",
                  })}
                >
                  خرید از {shop.shop}
                </a>
              ) : (
                <p className="mt-3.5 rounded-panel bg-paper px-3.5 py-3 text-pretty text-label text-muted">
                  آخرین قیمت ثبت‌شده است. موجودی تأیید نشده، برای همین لینک خرید نیست.
                </p>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function compareShops(a: ShopOffer, b: ShopOffer) {
  if (a.stockConfirmed !== b.stockConfirmed) return a.stockConfirmed ? -1 : 1;
  return a.price - b.price;
}
