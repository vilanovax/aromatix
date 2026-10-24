import { pageMeta } from "@/lib/page-meta";

export const metadata = pageMeta(
  "عطر از روی نت",
  "تا سه نت را انتخاب کن و عطرهایی را ببین که همان نت‌ها را دارند، با قیمت فروشگاه‌های ایران.",
);

export default function PaletteLayout({ children }: { children: React.ReactNode }) {
  return children;
}
