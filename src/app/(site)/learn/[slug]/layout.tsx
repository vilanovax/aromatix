import type { Metadata } from "next";
import { getEntry } from "@/lib/knowledge";
import { loadArticles } from "@/lib/knowledge-server";
import { joinFa } from "@/lib/format";
import { pageMeta } from "@/lib/page-meta";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  await loadArticles();
  const { slug } = await params;
  const entry = getEntry(decodeURIComponent(slug));
  if (!entry) return pageMeta("دانستنی", "این نوشته در آروما نیست.");
  const aka = entry.aliases.slice(0, 3);
  const extra = aka.length > 0 ? ` واژه‌های مرتبط: ${joinFa(aka)}.` : "";
  return pageMeta(entry.title, `${entry.summary}${extra}`);
}

export default function LearnEntryLayout({ children }: { children: React.ReactNode }) {
  return children;
}
