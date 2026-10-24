import type { Metadata } from "next";
import { loadCatalog } from "@/lib/catalog-server";
import { faNum } from "@/lib/format";
import { noteEnglish } from "@/lib/note-glossary";
import { noteNameFromSlug, perfumesWithNote } from "@/lib/notes";
import { pageMeta } from "@/lib/page-meta";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  await loadCatalog();
  const { slug } = await params;
  const name = noteNameFromSlug(slug);
  const hits = name ? perfumesWithNote(name) : [];
  if (!name || hits.length === 0) {
    return pageMeta("نت عطر", "این نت در کاتالوگ آروما نیست.");
  }
  const english = noteEnglish(name);
  const aka = english ? ` به انگلیسی ${english}.` : "";
  return pageMeta(
    `نت ${name}`,
    `${faNum(hits.length)} عطر در آروما این نت را دارند.${aka} قیمت‌ها از فروشگاه‌های ایران.`,
  );
}

export default function NoteLayout({ children }: { children: React.ReactNode }) {
  return children;
}
