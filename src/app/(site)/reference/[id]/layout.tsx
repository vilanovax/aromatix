import type { Metadata } from "next";
import { joinFa } from "@/lib/format";
import { pageMeta } from "@/lib/page-meta";
import { getReference } from "@/lib/references";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const reference = getReference(decodeURIComponent(id));
  if (!reference) return pageMeta("خانوادهٔ بو", "این خانواده در آروما نیست.");
  const aka = reference.aliases.filter((alias) => alias !== reference.nameFa).slice(0, 4);
  const extra = aka.length > 0 ? ` نام‌های دیگر: ${joinFa(aka)}.` : "";
  return pageMeta(reference.nameFa, `${reference.line} ${reference.why}${extra}`);
}

export default function ReferenceLayout({ children }: { children: React.ReactNode }) {
  return children;
}
