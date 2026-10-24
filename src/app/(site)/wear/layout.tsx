import { pageMeta } from "@/lib/page-meta";

export const metadata = pageMeta(
  "عطر برای فصل و موقعیت",
  "عطرهای مناسب تابستان، زمستان، محل کار، قرار و مهمانی را در کاتالوگ آروما ببین.",
);

export default function WearLayout({ children }: { children: React.ReactNode }) {
  return children;
}
