"use client";

import { useEffect, useRef } from "react";
import { getPerfume } from "@/lib/catalog";
import { millionToman } from "@/lib/format";
import { useAroma } from "@/lib/store";

export function ShopSheet() {
  const { shopFor, closeShops } = useAroma();
  const closeRef = useRef<HTMLButtonElement>(null);
  const perfume = shopFor ? getPerfume(shopFor) : undefined;

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
      <button type="button" className="absolute inset-0 bg-[var(--ink)]/40" aria-label="بستن فروشگاه‌ها" onClick={closeShops} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="shop-title"
        className="scroll-quiet sheet-panel relative z-10 max-h-[80dvh] w-full max-w-[32rem] overflow-y-auto overscroll-contain rounded-t-3xl bg-[var(--card)] px-5 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))]"
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-[var(--line)]" />
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id="shop-title" className="text-lg font-semibold">
              فروشگاه‌ها
            </h2>
            <p className="mt-1 text-[14px] text-[var(--muted)]">{perfume.nameFa}</p>
          </div>
          <button ref={closeRef} type="button" onClick={closeShops} className="pressable rounded-full px-3 py-2 text-[14px]">
            بستن
          </button>
        </div>
        <ul className="mt-4 divide-y divide-[var(--line)]">
          {perfume.shops.map((shop) => (
            <li key={shop.shop} className="py-4">
              <p className="font-medium">{shop.shop}</p>
              <p className="mt-1 text-[15px]">{millionToman(shop.price)}</p>
              <p className="mt-1 text-[13px] text-[var(--muted)]">بررسی {shop.checkedOn}</p>
              {shop.stockConfirmed ? (
                <a
                  href={shop.href}
                  target="_blank"
                  rel="noreferrer"
                  className="pressable mt-3 inline-flex min-h-11 items-center rounded-xl bg-[var(--ink)] px-4 text-[14px] font-medium text-[var(--paper)]"
                >
                  خرید از {shop.shop}
                </a>
              ) : (
                <p className="mt-3 text-[13px] text-[var(--muted)]">آخرین قیمت ثبت شده. موجودی تأیید نشده، برای همین لینک خرید نیست.</p>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
