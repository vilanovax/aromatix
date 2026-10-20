import type { OfferStock, ShopOffer } from "@/lib/types";

export function offerAvailability(offer: Pick<ShopOffer, "stock" | "stockConfirmed">): OfferStock {
  if (offer.stock === "in_stock" || offer.stock === "out_of_stock" || offer.stock === "unknown") return offer.stock;
  return offer.stockConfirmed ? "in_stock" : "unknown";
}

export function offerStockLine(offer: ShopOffer) {
  const stock = offerAvailability(offer);
  if (stock === "in_stock") return `موجود، بررسی ${offer.checkedOn}`;
  if (stock === "out_of_stock") return `ناموجود، آخرین قیمت ${offer.checkedOn}`;
  return `موجودی تأیید نشده، بررسی ${offer.checkedOn}`;
}
