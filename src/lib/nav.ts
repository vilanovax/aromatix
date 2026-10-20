import { getBrand, getPerfume, occasionLabel, seasonShort } from "@/lib/catalog";
import { getEntry } from "@/lib/knowledge";
import { getReference } from "@/lib/references";

/** Build `?from=` for perfume detail so Back returns to the real origin. */
export function perfumeFrom(path: string) {
  return `from=${encodeURIComponent(path)}`;
}

export function perfumeHref(slug: string, from: string) {
  return `/perfume/${slug}?${perfumeFrom(from)}`;
}

export function referenceHref(id: string, from?: string) {
  const path = `/reference/${id}`;
  return from ? `${path}?${perfumeFrom(from)}` : path;
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
  if (path.startsWith("/search")) return { href: path, label: "جستجو" };

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

  const wearMatch = path.match(/^\/wear(\?|$)/);
  if (wearMatch) {
    return { href: path, label: wearLabel(path) };
  }

  const noteMatch = path.match(/^\/notes\/([^/?#]+)/);
  if (noteMatch) {
    let name = noteMatch[1];
    try {
      name = decodeURIComponent(noteMatch[1]);
    } catch {
      name = noteMatch[1];
    }
    return { href: path, label: name };
  }

  const referenceMatch = path.match(/^\/reference\/([^/?#]+)/);
  if (referenceMatch) {
    const reference = getReference(decodeURIComponent(referenceMatch[1]));
    return { href: path.split("?")[0], label: reference?.nameFa ?? "خانه" };
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

function wearLabel(path: string) {
  const query = path.split("?")[1] ?? "";
  const params = new URLSearchParams(query);
  const seasons = params.getAll("season");
  const occasions = params.getAll("occasion");
  if (seasons.length > 0) {
    return seasons.map((id) => (id === "mild" ? "معتدل" : seasonShort(id))).join("، ");
  }
  if (occasions.length > 0) return occasions.map((id) => occasionLabel(id)).join("، ");
  return "فهرست";
}
