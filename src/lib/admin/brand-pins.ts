import "server-only";
import { db } from "@/prisma/db";

export const BRAND_PINS_KEY = "admin.brandPins";

export function parseBrandPins(value: string | null | undefined) {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value) as unknown;
    if (!Array.isArray(parsed)) return [];
    const slugs = parsed.filter((item): item is string => typeof item === "string" && item.length > 0 && item.length <= 80);
    return [...new Set(slugs)].slice(0, 200);
  } catch {
    return [];
  }
}

export async function readBrandPins() {
  try {
    const row = await db.orm.aroma.AppSetting.where((item) => item.key.eq(BRAND_PINS_KEY)).select("value").first();
    return parseBrandPins(row?.value);
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function writeBrandPins(pins: string[]) {
  const value = JSON.stringify(parseBrandPins(JSON.stringify(pins)));
  const existing = await db.orm.aroma.AppSetting.where((row) => row.key.eq(BRAND_PINS_KEY)).select("key").first();
  if (existing) {
    await db.orm.aroma.AppSetting.where((row) => row.key.eq(BRAND_PINS_KEY)).update({ value });
    return;
  }
  await db.orm.aroma.AppSetting.create({ key: BRAND_PINS_KEY, value });
}
