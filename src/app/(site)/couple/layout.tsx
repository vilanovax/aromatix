import { pageMeta } from "@/lib/page-meta";

export const metadata = pageMeta(
  "ست دونفره",
  "دو عطر را کنار هم بگذار و ببین برای مهمانی، ماشین و تابستان کدام پرصداتر است و کجا باید کمتر زده شود.",
);

export default function CoupleLayout({ children }: { children: React.ReactNode }) {
  return children;
}
