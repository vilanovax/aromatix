import { pageMeta } from "@/lib/page-meta";

export const metadata = pageMeta(
  "دانستنی‌های عطر",
  "غلظت، هرم بو، ماندگاری و خرید عطر را به فارسی و کوتاه بخوان.",
);

export default function LearnLayout({ children }: { children: React.ReactNode }) {
  return children;
}
