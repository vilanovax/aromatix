import { pageMeta } from "@/lib/page-meta";

export const metadata = pageMeta(
  "راهنمای انتخاب عطر",
  "با چهار سؤال کوتاه — موقعیت، فصل، بودجه و سلیقه — به پیشنهاد عطر برس.",
);

export default function GuideLayout({ children }: { children: React.ReactNode }) {
  return children;
}
