import "dotenv/config";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import postgres from "@prisma/orm-postgres/runtime";
import type { Contract } from "../src/prisma/contract.d";
import contractJson from "../src/prisma/contract.json" with { type: "json" };

/** عطرهایی که شباهتشان در بازار عطر شناخته‌شده است. فقط جاهای خالی پر می‌شود. */
const ECHOES: Record<string, string> = {
  qahwa: "angels",
  "khamrah-dukhan": "angels",
  "khamrah-waha": "angels",
  "kismet-angel": "angels",
  "9pm": "ultra-male",
  "9-pm-elixir": "ultra-male",
  "turathi-blue": "bleu",
  "blue-by-ahmed": "bleu",
  "club-de-nuit-blue-iconic": "bleu",
  fakhar: "ysl-y",
  "fakhar-platin": "ysl-y",
  "fakhar-black": "ysl-y",
  "hayaati-lattafa": "invictus",
  "hayaati-ard-al-zaafaran": "invictus",
  "hawas-for-him": "invictus",
  "hawas-ice-for-him": "invictus",
  "liquid-brun": "althair",
  "liquid-brun-limited-edition": "althair",
  eclaire: "bianco-latte",
  "eclaire-banoffi": "bianco-latte",
  "eclaire-pistache": "bianco-latte",
  "tres-nuit": "irish-tweed",
  "tres-nuit-lyric": "irish-tweed",
  "tres-nuit-lyric-pour-homme": "irish-tweed",
  "club-de-nuit-sillage": "silver-mountain",
  "club-de-nuit-milestone": "millesime",
  "club-de-nuit-untold": "baccarat",
  "ameer-al-oudh": "fireplace",
  "ameer-al-oudh-intense-oud": "fireplace",
  "bade-e-al-oud-oud-for-glory": "oud-greatness",
  "asad-zanzibar": "le-beau",
  "asad-bourbon": "sauvage",
  "asad-elixir": "sauvage",
  angham: "goddess",
  "qaed-al-fursan": "erba-pura",
  "qaed-al-fursan-unlimited": "erba-pura",
  "al-fursan": "erba-pura",
  "vintage-radio": "paragon",
  spectre: "ani",
  "spectre-ghost": "ani",
  "spectre-wraith": "layton",
  kaaf: "profondo",
  "royal-cherry": "lost-cherry",
  "club-de-nuit-intense-overdose": "aventus",
  "club-de-nuit-man": "aventus",
  "intense-man-deluxe-edition": "aventus",
};

const sourcePath = resolve("data/catalog/all-app-v16.LOCKED.json");

const db = postgres<Contract>({
  contractJson,
  url: process.env["DATABASE_URL"]!,
});

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.close();
  });

async function main() {
  const rows = JSON.parse(readFileSync(sourcePath, "utf8")) as Array<{
    slug: string;
    inspiredBy?: string | string[] | null;
  }>;
  let fileHits = 0;
  for (const row of rows) {
    const next = ECHOES[row.slug];
    if (!next || row.inspiredBy) continue;
    row.inspiredBy = next;
    fileHits += 1;
  }
  writeFileSync(sourcePath, `${JSON.stringify(rows, null, 1)}\n`);

  let dbHits = 0;
  let missing = 0;
  for (const [slug, inspiredBy] of Object.entries(ECHOES)) {
    const existing = await db.orm.aroma.CatalogPerfume.where((row) => row.slug.eq(slug)).select("document").first();
    if (!existing) {
      missing += 1;
      continue;
    }
    const document = JSON.parse(existing.document) as { inspiredBy?: string | string[] | null };
    if (document.inspiredBy) continue;
    document.inspiredBy = inspiredBy;
    await db.orm.aroma.CatalogPerfume.where((row) => row.slug.eq(slug)).update({
      document: JSON.stringify(document),
      updatedAt: new Date().toISOString(),
    });
    dbHits += 1;
  }

  console.log(JSON.stringify({ fileHits, dbHits, missing }));
}
