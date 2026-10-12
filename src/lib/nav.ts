import { getBrand, getPerfume } from "@/lib/catalog";
import { getEntry } from "@/lib/knowledge";

/** Build `?from=` for perfume detail so Back returns to the real origin. */
export function perfumeFrom(path: string) {
  return `from=${encodeURIComponent(path)}`;
}

export function perfumeHref(slug: string, from: string) {
  return `/perfume/${slug}?${perfumeFrom(from)}`;
}

export function resolvePerfumeBack(from: string | null): { href: string; label: string } {
  const fallback = { href: "/results", label: "پیشنهادها" };
  if (!from) return fallback;

  let path = from;
  try {
    path = decodeURIComponent(from);
  } catch {
    path = from;
  }

  if (path === "/" || path === "home") return { href: "/", label: "خانه" };
  if (path === "/results" || path === "results") return fallback;
  if (path === "/shelf" || path === "shelf") return { href: "/shelf", label: "آرومای من" };
  if (path === "/brands" || path === "brands") return { href: "/brands", label: "برندها" };
  if (path === "/learn" || path === "learn") return { href: "/learn", label: "دانستنی‌ها" };
  if (path === "/guide") return { href: "/guide", label: "راهنما" };

  if (path.startsWith("/compare")) {
    return { href: path, label: "مقایسه" };
  }

  const brandMatch = path.match(/^\/brands\/([^/?#]+)/);
  if (brandMatch) {
    const brand = getBrand(decodeURIComponent(brandMatch[1]));
    return { href: path.split("?")[0], label: brand?.nameFa ?? "برندها" };
  }

  const learnMatch = path.match(/^\/learn\/([^/?#]+)/);
  if (learnMatch) {
    const entry = getEntry(decodeURIComponent(learnMatch[1]));
    return { href: path.split("?")[0], label: entry?.title ?? "دانستنی‌ها" };
  }

  const perfumeMatch = path.match(/^\/perfume\/([^/?#]+)/);
  if (perfumeMatch) {
    const perfume = getPerfume(decodeURIComponent(perfumeMatch[1]));
    return perfume
      ? { href: path.split("?")[0], label: perfume.nameFa }
      : fallback;
  }

  if (path.startsWith("/")) return { href: path, label: "برگشت" };
  return fallback;
}
