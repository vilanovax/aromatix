export type RecentVisit = { href: string; label: string };

const KEY = "aroma-recent";

export function rememberVisit(visit: RecentVisit) {
  try {
    localStorage.setItem(KEY, JSON.stringify(visit));
  } catch {
    /* مرورگر ذخیره را بسته است. */
  }
}

export function readVisit(): RecentVisit | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as Partial<RecentVisit>;
    if (!data.href || !data.label) return null;
    if (!data.href.startsWith("/")) return null;
    return { href: data.href, label: data.label };
  } catch {
    return null;
  }
}
