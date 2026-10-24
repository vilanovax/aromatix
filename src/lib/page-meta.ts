import type { Metadata } from "next";

const SITE = "آروما";

export function pageMeta(title: string, description: string): Metadata {
  const full = `${title} · ${SITE}`;
  return {
    title: full,
    description,
    openGraph: {
      title: full,
      description,
      locale: "fa_IR",
      siteName: SITE,
      type: "website",
    },
  };
}
