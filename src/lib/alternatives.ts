import { publicLead, publishedPerfumes, sharedAccordNames, sweetness } from "@/lib/catalog";
import { inspirationIds, sharesInspiration } from "@/lib/inspiration";
import { remindsOfFor } from "@/lib/reminds-of";
import { joinFa, millionToman } from "@/lib/format";
import { suggestForTaste } from "@/lib/match";
import type { ScentFace } from "@/lib/personal-fit";
import type { Perfume, UserPerfume } from "@/lib/types";

export type AltGroup = {
  id: "family" | "closest" | "milder" | "cheaper" | "escape";
  title: string;
  items: Array<{ perfume: Perfume; reason: string }>;
};

export function alternativeGroups(input: {
  face: ScentFace;
  pool: Perfume[];
  budget: number | null;
  escape: boolean;
  library: Record<string, UserPerfume | undefined>;
}): AltGroup[] {
  const affordable = input.pool.filter((perfume) => within(perfume, input.budget));
  if (affordable.length === 0) return [];
  if (affordable.length === 1) {
    return [
      {
        id: "family",
        title: "در همین حال‌وهوا",
        items: [{ perfume: affordable[0], reason: likeness(input.face, affordable[0]) }],
      },
    ];
  }

  const used = new Set<string>();
  const groups: AltGroup[] = [];
  const closest = pickClosest(input.face, affordable);
  if (closest) {
    used.add(closest.slug);
    groups.push({
      id: "closest",
      title: "نزدیک‌ترین حال‌وهوا",
      items: [{ perfume: closest, reason: likeness(input.face, closest) }],
    });
  }

  const cheaper = pickCheaper(affordable.filter((perfume) => !used.has(perfume.slug)), closest);
  if (cheaper) {
    used.add(cheaper.slug);
    groups.push({
      id: "cheaper",
      title: "ارزان‌تر در همین حال‌وهوا",
      items: [{ perfume: cheaper, reason: cheaperReason(input.face, cheaper) }],
    });
  }

  const milder = pickMilder(
    affordable.filter((perfume) => !used.has(perfume.slug)),
    closest,
  );
  if (milder) {
    used.add(milder.slug);
    groups.push({
      id: "milder",
      title: "ملایم‌تر",
      items: [{ perfume: milder, reason: milderReason(closest, milder) }],
    });
  }

  if (input.escape) {
    const banned = new Set([...used, ...affordable.map((perfume) => perfume.slug)]);
    if (input.face.slug) banned.add(input.face.slug);
    const escape = suggestForTaste(input.library, 4).find((perfume) => !banned.has(perfume.slug));
    if (escape) {
      groups.push({
        id: "escape",
        title: "اگر این حس را نپسندیدی",
        items: [{ perfume: escape, reason: "حال‌وهوای دیگری دارد و به امتیازهایی که دادی نزدیک‌تر است." }],
      });
    }
  }

  return groups;
}

function echoIds(perfume: Perfume): string[] {
  const ids = inspirationIds(perfume.inspiredBy);
  const links = perfume.remindsOf?.length ? perfume.remindsOf : remindsOfFor(perfume.slug);
  for (const link of links) {
    if (!ids.includes(link.id)) ids.push(link.id);
  }
  return ids;
}

export function perfumePool(perfume: Perfume) {
  const slugs = new Set<string>([...perfume.similar]);
  const mine = new Set(echoIds(perfume));
  for (const item of publishedPerfumes()) {
    if (item.slug === perfume.slug) continue;
    if (sharesInspiration(perfume.inspiredBy, item.inspiredBy)) slugs.add(item.slug);
    else if (echoIds(item).some((id) => mine.has(id))) slugs.add(item.slug);
  }
  return [...slugs]
    .map((slug) => publishedPerfumes().find((item) => item.slug === slug))
    .filter((item): item is Perfume => Boolean(item));
}

function within(perfume: Perfume, budget: number | null) {
  if (budget == null) return true;
  const price = publicLead(perfume)?.price;
  if (price == null) return true;
  return price <= budget * 1_000_000;
}

function pickClosest(face: ScentFace, pool: Perfume[]) {
  return [...pool].sort((a, b) => sharedAccordNames(asPerfume(face), b).length - sharedAccordNames(asPerfume(face), a).length || b.confidence - a.confidence)[0] ?? null;
}

function pickCheaper(pool: Perfume[], closest: Perfume | null) {
  const priced = pool
    .map((perfume) => ({ perfume, price: publicLead(perfume)?.price ?? null }))
    .filter((item): item is { perfume: Perfume; price: number } => item.price != null);
  if (priced.length === 0) return null;
  const closestPrice = closest ? publicLead(closest)?.price : null;
  const below = closestPrice != null ? priced.filter((item) => item.price < closestPrice) : priced;
  const source = below.length > 0 ? below : [];
  if (closestPrice == null) return priced.sort((a, b) => a.price - b.price)[0]?.perfume ?? null;
  return source.sort((a, b) => a.price - b.price)[0]?.perfume ?? null;
}

function pickMilder(pool: Perfume[], closest: Perfume | null) {
  if (!closest) return null;
  const quieter = pool.filter((perfume) => (perfume.sillage ?? 5) < (closest.sillage ?? 5));
  if (quieter.length > 0) {
    return quieter.sort((a, b) => (a.sillage ?? 5) - (b.sillage ?? 5))[0];
  }
  const lessSweet = pool.filter((perfume) => sweetness(perfume) + 0.05 < sweetness(closest));
  return lessSweet.sort((a, b) => sweetness(a) - sweetness(b))[0] ?? null;
}

function cheaperReason(face: ScentFace, perfume: Perfume) {
  const price = publicLead(perfume)?.price;
  const like = likeness(face, perfume);
  if (price == null) return like;
  return `${millionToman(price)}. ${like}`;
}

function milderReason(closest: Perfume | null, perfume: Perfume) {
  if (closest && (perfume.sillage ?? 5) < (closest.sillage ?? 5)) {
    return "پخش بوی کمتری در داده دارد.";
  }
  return "شیرینی کمتری دارد.";
}

function likeness(face: ScentFace, perfume: Perfume) {
  const accords = sharedAccordNames(asPerfume(face), perfume);
  if (accords.length > 0) return `هر دو ${joinFa(accords)} دارند.`;
  const notes = new Set(perfume.notes.map((note) => note.name));
  const shared = [...new Set(face.notes.map((note) => note.name).filter((name) => notes.has(name)))];
  if (shared.length > 0) return `نوت مشترک: ${joinFa(shared)}.`;
  return perfume.why;
}

function asPerfume(face: ScentFace): Perfume {
  return {
    slug: face.slug ?? "face",
    nameFa: face.nameFa,
    nameEn: "",
    brand: "",
    marketGender: "مشترک",
    concentration: null,
    volumeMl: null,
    bottle: "rect",
    cap: "",
    accords: face.accords,
    notes: face.notes,
    seasons: [],
    occasions: face.occasions,
    tags: [],
    longevity: null,
    sillage: null,
    why: "",
    similar: [],
    shops: [],
    confidence: 0,
  };
}
