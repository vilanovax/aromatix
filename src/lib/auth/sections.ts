export const ADMIN_SECTIONS = [
  { id: "overview", label: "نمای کلی", href: "/admin", group: "کار" },
  { id: "reports", label: "گزارش", href: "/admin/reports", group: "کار" },
  { id: "perfumes", label: "عطرها", href: "/admin/perfumes", group: "کاتالوگ" },
  { id: "brands", label: "برندها", href: "/admin/brands", group: "کاتالوگ" },
  { id: "shops", label: "فروشگاه‌ها", href: "/admin/shops", group: "کاتالوگ" },
  { id: "learn", label: "دانستنی‌ها", href: "/admin/learn", group: "کاتالوگ" },
  { id: "users", label: "کاربران", href: "/admin/users", group: "حساب‌ها" },
  { id: "settings", label: "تنظیمات", href: "/admin/settings", group: "حساب‌ها" },
] as const;

export type AdminSection = (typeof ADMIN_SECTIONS)[number]["id"];

const IDS = ADMIN_SECTIONS.map((section) => section.id);

export function isAdminSection(value: string): value is AdminSection {
  return IDS.some((id) => id === value);
}

/** `*` is every section. Anything else is an explicit list; unknown names are dropped. */
export function parseAccess(value: string | null | undefined): AdminSection[] {
  const raw = (value ?? "").trim();
  if (raw === "*") return [...IDS];
  const wanted = new Set(raw.split(",").map((item) => item.trim()));
  return IDS.filter((id) => wanted.has(id));
}

export function encodeAccess(ids: readonly string[]): string {
  const picked = IDS.filter((id) => ids.includes(id));
  if (picked.length === IDS.length) return "*";
  return picked.join(",");
}

export function firstSectionHref(ids: readonly AdminSection[]) {
  return ADMIN_SECTIONS.find((section) => ids.includes(section.id))?.href ?? null;
}

export function sectionAllows(pathname: string, ids: readonly AdminSection[]) {
  const section = ADMIN_SECTIONS.find((item) => (item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href)));
  return section ? ids.includes(section.id) : false;
}
