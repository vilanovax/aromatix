import { pageMeta } from "@/lib/page-meta";

export const metadata = pageMeta("جستجوی عطر", "اسم عطر، برند یا واژه‌ای را در سنتیا جستجو کن.");

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return children;
}
