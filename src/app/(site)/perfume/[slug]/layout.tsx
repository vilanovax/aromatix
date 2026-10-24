import type { Metadata } from "next";
import { loadCatalog } from "@/lib/catalog-server";
import { getPerfume, isPublicPerfume } from "@/lib/catalog";
import { joinFa } from "@/lib/format";
import { pageMeta } from "@/lib/page-meta";
import { plainScentLine } from "@/lib/plain-scent";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  await loadCatalog();
  const { slug } = await params;
  const perfume = getPerfume(decodeURIComponent(slug));
  if (!isPublicPerfume(perfume) || !perfume) {
    return pageMeta("عطر", "این عطر در کاتالوگ آروما نیست.");
  }
  const aliases = (perfume.aliases ?? []).filter(Boolean).slice(0, 4);
  const aka = aliases.length > 0 ? ` نام‌های دیگر: ${joinFa(aliases)}.` : "";
  const plain = plainScentLine(perfume) ?? perfume.why;
  return pageMeta(
    `${perfume.nameFa} از ${perfume.brand}`,
    `${plain} قیمت فروشگاه‌های ایران و جایگزین ارزان‌تر.${aka}`,
  );
}

export default function PerfumeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
