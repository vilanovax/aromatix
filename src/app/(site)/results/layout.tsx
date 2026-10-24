import { pageMeta } from "@/lib/page-meta";

export const metadata = pageMeta(
  "پیشنهاد عطر",
  "عطرهایی که با موقعیت، فصل، بودجه و سلیقه‌ات جورند، با قیمت فروشگاه‌های ایران.",
);

export default function ResultsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
