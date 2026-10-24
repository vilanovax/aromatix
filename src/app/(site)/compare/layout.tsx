import { pageMeta } from "@/lib/page-meta";

export const metadata = pageMeta(
  "مقایسهٔ عطر",
  "دو عطر را کنار هم بسنج: حکم کوتاه، ماندگاری، پخش بو و قیمت تأییدشده در ایران.",
);

export default function CompareLayout({ children }: { children: React.ReactNode }) {
  return children;
}
