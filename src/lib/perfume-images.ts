import imageFile from "../../data/catalog/perfume-images.v1.json";

const images = imageFile.images as Record<string, string>;

/** آدرس شیشهٔ ذخیره‌شده؛ اگر خود عطر عکس داشته باشد همان می‌ماند. */
export function catalogImage(slug: string, current?: string | null) {
  const own = current?.trim() ?? "";
  if (own.startsWith("/") || own.startsWith("https://")) return own;
  return images[slug] ?? "";
}
