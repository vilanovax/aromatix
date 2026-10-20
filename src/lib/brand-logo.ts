import "server-only";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const MAX_INPUT_BYTES = 8 * 1024 * 1024;
const EDGE = 512;
const TARGET_BYTES = 80 * 1024;

const FORMATS = new Set(["jpeg", "png", "webp", "avif", "gif", "tiff"]);

/** لوگو را به مربع شفاف ۵۱۲ و وب‌پی سبک تبدیل می‌کند. */
export async function standardizeLogo(input: Buffer) {
  if (input.byteLength === 0) throw new Error("فایل لوگو خالی است.");
  if (input.byteLength > MAX_INPUT_BYTES) throw new Error("حجم لوگو باید کمتر از ۸ مگابایت باشد.");

  const meta = await sharp(input, { failOn: "error" }).metadata();
  if (!meta.format || !FORMATS.has(meta.format) || !meta.width || !meta.height) {
    throw new Error("فقط تصویر پی‌ان‌جی، جی‌پگ یا وب‌پی پذیرفته می‌شود.");
  }

  let quality = 82;
  let output = await render(input, quality);
  while (output.byteLength > TARGET_BYTES && quality > 50) {
    quality -= 8;
    output = await render(input, quality);
  }
  return output;
}

async function render(input: Buffer, quality: number) {
  return sharp(input, { failOn: "error" })
    .rotate()
    .resize(EDGE, EDGE, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
      withoutEnlargement: false,
    })
    .webp({ quality, effort: 4, alphaQuality: quality })
    .toBuffer();
}

export async function storeBrandLogo(slug: string, input: Buffer) {
  const bytes = await standardizeLogo(input);
  const dir = path.join(process.cwd(), "public", "brands");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, `${slug}.webp`), bytes);
  return `/brands/${slug}.webp?v=${Date.now()}`;
}
