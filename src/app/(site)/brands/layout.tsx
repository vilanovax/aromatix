import { pageMeta } from "@/lib/page-meta";

export const metadata = pageMeta(
  "برندهای عطر",
  "خانه‌های عطرسازی در آروما، با عطرهای منتشرشده و قیمت فروشگاه‌های ایران.",
);

export default function BrandsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
