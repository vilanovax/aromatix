#!/usr/bin/env python3
"""Bulk upsert locked v16 catalog into aroma.CatalogBrand / CatalogPerfume."""

from __future__ import annotations

import json
import sys
import time
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import unquote, urlparse

ROOT = Path(__file__).resolve().parents[1]
SOURCE = Path(sys.argv[1] if len(sys.argv) > 1 else ROOT / "data/catalog/all-app-v16.LOCKED.json")

BRAND_REGISTRY = {
    "آتلیه ورنو": ("atelier-verno", "Atelier Verno"),
    "آرماف": ("armaf", "Armaf"),
    "آزارو": ("azzaro", "Azzaro"),
    "آمواج": ("amouage", "Amouage"),
    "اجمل": ("ajmal", "Ajmal"),
    "احمد المغربی": ("ahmed-al-maghribi", "Ahmed Al Maghribi"),
    "ارض الزعفران": ("ard-al-zaafaran", "Ard Al Zaafaran"),
    "افنان": ("afnan", "Afnan"),
    "الحرمین": ("al-haramin", "Al Haramain"),
    "الماجد عود": ("al-majed-oud", "Al Majed Oud"),
    "الوطنی": ("al-wataniah", "Al Wataniah"),
    "امپر": ("emper", "Emper"),
    "ایوروشه": ("yves-rocher", "Yves Rocher"),
    "باربری": ("burberry", "Burberry"),
    "بنتلی": ("bentley", "Bentley"),
    "بولگاری": ("bvlgari", "Bvlgari"),
    "بیلی ایلیش": ("billie-eilish", "Billie Eilish"),
    "جنیفر لوپز": ("jennifer-lopez", "Jennifer Lopez"),
    "جورجیو آرمانی": ("giorgio-armani", "Giorgio Armani"),
    "جوپ": ("joop", "Joop"),
    "جگوار": ("jaguar", "Jaguar"),
    "خدلج": ("khadlaj", "Khadlaj"),
    "دولچه اند گابانا": ("dolce-gabbana", "Dolce & Gabbana"),
    "دومونت پاریس": ("dumont-paris", "Dumont Paris"),
    "دیویدوف": ("davidoff", "Davidoff"),
    "رصاصی": ("rasasi", "Rasasi"),
    "رو بروکا": ("rue-broca", "Rue Broca"),
    "ریحان": ("rihan", "Rihan"),
    "ریفز": ("riiffs", "Riiffs"),
    "زودیاک": ("zodiac", "Zodiac"),
    "زیمایا": ("zimaya", "Zimaya"),
    "صمام": ("samam", "Samam"),
    "عربیات شوگر": ("arabiyat-sugar", "Arabiyat Sugar"),
    "عربیات پرستیژ": ("arabiyat-prestige", "Arabiyat Prestige"),
    "فرنچ اونیو": ("french-avenue", "French Avenue"),
    "فرگرانس ورد": ("fragrance-world", "Fragrance World"),
    "لالیک": ("lalique", "Lalique"),
    "لطافه": ("lattafa", "Lattafa"),
    "مرسدس بنز": ("mercedes-benz", "Mercedes-Benz"),
    "میسون الحمرا": ("maison-alhambra", "Maison Alhambra"),
    "ناتیکا": ("nautica", "Nautica"),
    "نورث استگ": ("north-stag", "North Stag"),
    "هالووین": ("halloween", "Halloween"),
    "وادی الخلیج": ("wadi-al-khaleej", "Wadi Al Khaleej"),
    "ورساچه": ("versace", "Versace"),
    "پاریس کرنر": ("paris-corner", "Paris Corner"),
    "پاکو رابان": ("paco-rabanne", "Paco Rabanne"),
    "ژاک بوگارت": ("jacques-bogart", "Jacques Bogart"),
    "کالوین کلین": ("calvin-klein", "Calvin Klein"),
    "کرانفورد": ("cranford", "Cranford"),
    "کلینیک": ("clinique", "Clinique"),
}

SEASONS = {"summer", "winter", "mild", "all"}
BOTTLES = ("rect", "slim", "round")


def bottle_for(slug: str) -> str:
    return BOTTLES[sum(map(ord, slug)) % 3]


def cap_for(accords: list) -> str:
    color = (accords[0] or {}).get("color", "") if accords else ""
    if isinstance(color, str) and len(color) == 7 and color.startswith("#"):
        return color
    return "#6E5436"


IMAGE_MAP_PATH = ROOT / "data" / "catalog" / "perfume-images.v2.json"


def load_image_map() -> dict:
    if not IMAGE_MAP_PATH.is_file():
        return {}
    data = json.loads(IMAGE_MAP_PATH.read_text(encoding="utf-8"))
    images = data.get("images") if isinstance(data, dict) else None
    if not isinstance(images, dict):
        return {}
    return {
        str(slug): url
        for slug, url in images.items()
        if isinstance(slug, str) and isinstance(url, str) and url.startswith("https://")
    }


def to_perfume(row, images=None):
    brand = row["brand"]
    if brand not in BRAND_REGISTRY:
        raise SystemExit(f"unknown brand: {brand} ({row['slug']})")
    seasons = [s for s in row.get("seasons") or [] if s in SEASONS]
    if not seasons:
        raise SystemExit(f"bad seasons: {row['slug']}")
    accords = row.get("accords") or []
    notes = row.get("notes") or []
    if not accords or not notes:
        raise SystemExit(f"empty accords/notes: {row['slug']}")
    conc = row.get("concentration")
    if isinstance(conc, str):
        conc = conc.strip() or None
    else:
        conc = None
    vol = row.get("volumeMl")
    if not isinstance(vol, (int, float)) or vol <= 0:
        vol = None
    else:
        vol = int(vol)
    perfume = {
        "slug": row["slug"],
        "nameFa": row["nameFa"],
        "nameEn": row["nameEn"],
        "brand": brand,
        "perfumer": row.get("perfumer"),
        "marketGender": row["marketGender"],
        "concentration": conc,
        "volumeMl": vol,
        "bottle": bottle_for(row["slug"]),
        "cap": cap_for(accords),
        "accords": accords,
        "notes": notes,
        "seasons": seasons,
        "occasions": [x for x in (row.get("occasions") or []) if isinstance(x, str) and x],
        "tags": [x for x in (row.get("tags") or []) if isinstance(x, str) and x],
        "longevity": row.get("longevity"),
        "sillage": row.get("sillage"),
        "inspiredBy": row.get("inspiredBy"),
        "why": row["why"],
        "similar": [x for x in (row.get("similar") or []) if isinstance(x, str) and x],
        "shops": [],
        "confidence": row["confidence"],
        "aliases": [x for x in (row.get("aliases") or []) if isinstance(x, str) and x],
        "family": row.get("family"),
        "priceMin": row.get("priceMin") if isinstance(row.get("priceMin"), (int, float)) else None,
        "priceMax": row.get("priceMax") if isinstance(row.get("priceMax"), (int, float)) else None,
        "sourceUrl": row.get("sourceUrl"),
    }
    raw_image = row.get("image")
    if isinstance(raw_image, str) and raw_image.startswith("https://"):
        perfume["image"] = raw_image
    elif images and row["slug"] in images:
        perfume["image"] = images[row["slug"]]
    return perfume


def db_connect():
    import psycopg2

    line = next(
        l for l in (ROOT / ".env").read_text().splitlines() if l.startswith("DATABASE_URL=")
    )
    p = urlparse(line.split("=", 1)[1].strip().strip('"').strip("'"))
    return psycopg2.connect(
        host=p.hostname,
        port=p.port,
        user=unquote(p.username or ""),
        password=unquote(p.password or ""),
        dbname=p.path.lstrip("/"),
        connect_timeout=30,
    )


def main() -> None:
    rows = json.loads(SOURCE.read_text())
    images = load_image_map()
    perfumes = [to_perfume(r, images) for r in rows]
    print(f"image_map={len(images)} with_image={sum(1 for p in perfumes if p.get('image'))}", flush=True)
    brands = sorted({p["brand"] for p in perfumes})
    now = datetime.now(timezone.utc).isoformat()

    print(f"source={SOURCE} n={len(perfumes)} brands={len(brands)}", flush=True)
    t0 = time.time()
    conn = db_connect()
    print(f"connected {time.time() - t0:.1f}s", flush=True)
    cur = conn.cursor()

    for name_fa in brands:
        slug, name_en = BRAND_REGISTRY[name_fa]
        cur.execute(
            """
            INSERT INTO aroma."CatalogBrand" (slug, "nameFa", "nameEn", description, active)
            VALUES (%s, %s, %s, %s, %s)
            ON CONFLICT (slug) DO UPDATE SET
              "nameFa" = EXCLUDED."nameFa",
              "nameEn" = EXCLUDED."nameEn",
              active = EXCLUDED.active
            """,
            (slug, name_fa, name_en, "", True),
        )
    conn.commit()
    print("brands upserted", flush=True)

    batch = []
    for perfume in perfumes:
        brand_slug = BRAND_REGISTRY[perfume["brand"]][0]
        batch.append(
            (
                perfume["slug"],
                perfume["nameFa"],
                perfume["nameEn"],
                brand_slug,
                json.dumps(perfume, ensure_ascii=False),
                now,
            )
        )

    # executemany with ON CONFLICT
    cur.executemany(
        """
        INSERT INTO aroma."CatalogPerfume"
          (slug, "nameFa", "nameEn", "brandSlug", document, "updatedAt")
        VALUES (%s, %s, %s, %s, %s, %s::timestamptz)
        ON CONFLICT (slug) DO UPDATE SET
          "nameFa" = EXCLUDED."nameFa",
          "nameEn" = EXCLUDED."nameEn",
          "brandSlug" = EXCLUDED."brandSlug",
          document = EXCLUDED.document,
          "updatedAt" = EXCLUDED."updatedAt"
        """,
        batch,
    )
    conn.commit()

    keep = {p["slug"] for p in perfumes}
    cur.execute('SELECT slug FROM aroma."CatalogPerfume"')
    extras = [slug for (slug,) in cur.fetchall() if slug not in keep]
    for slug in extras:
        cur.execute('DELETE FROM aroma."CatalogPerfume" WHERE slug = %s', (slug,))
    if extras:
        conn.commit()
        print("removed extras", extras, flush=True)

    cur.execute('SELECT count(*) FROM aroma."CatalogPerfume"')
    perfume_count = cur.fetchone()[0]
    cur.execute('SELECT count(*) FROM aroma."CatalogBrand"')
    brand_count = cur.fetchone()[0]
    # sanity: shops empty + has bottle
    cur.execute(
        """
        SELECT count(*) FROM aroma."CatalogPerfume"
        WHERE document::jsonb -> 'shops' = '[]'::jsonb
          AND document::jsonb ? 'bottle'
          AND document::jsonb ? 'priceMin'
        """
    )
    shaped = cur.fetchone()[0]
    conn.close()
    print(
        json.dumps(
            {
                "imported": len(perfumes),
                "catalogPerfumeRows": perfume_count,
                "catalogBrandRows": brand_count,
                "shapedOk": shaped,
                "removedExtras": extras,
                "seconds": round(time.time() - t0, 1),
                "shopsKeptSeparate": True,
            },
            ensure_ascii=False,
            indent=2,
        ),
        flush=True,
    )


if __name__ == "__main__":
    main()
