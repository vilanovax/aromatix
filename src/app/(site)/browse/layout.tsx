import { pageMeta } from "@/lib/page-meta";

export const metadata = pageMeta(
  "فیلتر عطر",
  "فصل، موقعیت، بودجه و حداکثر دو آکورد را انتخاب کن و پیشنهاد عطر با قیمت ایران را ببین.",
);

export default function BrowseLayout({ children }: { children: React.ReactNode }) {
  return children;
}
