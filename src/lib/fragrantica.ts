/** فقط لینک https خود فراگرانتیکا قابل باز شدن است. */
export function fragranticaHref(value: string | null | undefined) {
  const text = value?.trim() ?? "";
  if (!text) return "";
  try {
    const url = new URL(text);
    if (url.protocol !== "https:") return "";
    const host = url.hostname.toLowerCase();
    if (host !== "fragrantica.com" && !host.endsWith(".fragrantica.com")) return "";
    return url.toString();
  } catch {
    return "";
  }
}
