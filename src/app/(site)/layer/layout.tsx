import { pageMeta } from "@/lib/page-meta";

export const metadata = pageMeta(
  "لایه‌کردن عطر",
  "دو عطر را انتخاب کن تا بگوییم کدام را اول بزنی. از روی ماندگاری، پخش بو و نوت مشترک، بدون نمرهٔ ساختگی.",
);

export default function LayerLayout({ children }: { children: React.ReactNode }) {
  return children;
}
