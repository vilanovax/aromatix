/** شناسهٔ عطر مرجعی که این شیشه یادش می‌اندازد. یک شناسه یا چندتا. */
export type Inspiration = string | string[] | null | undefined;

export function inspirationIds(value: Inspiration): string[] {
  const raw = Array.isArray(value) ? value : typeof value === "string" ? [value] : [];
  const ids: string[] = [];
  for (const id of raw) {
    if (typeof id !== "string") continue;
    const trimmed = id.trim();
    if (!trimmed || trimmed === "none" || ids.includes(trimmed)) continue;
    ids.push(trimmed);
  }
  return ids;
}

export function inspirationValue(ids: string[]): string | string[] | null {
  if (ids.length === 0) return null;
  if (ids.length === 1) return ids[0]!;
  return ids;
}

export function sharesInspiration(left: Inspiration, right: Inspiration): boolean {
  const mine = inspirationIds(left);
  if (mine.length === 0) return false;
  const theirs = new Set(inspirationIds(right));
  return mine.some((id) => theirs.has(id));
}
