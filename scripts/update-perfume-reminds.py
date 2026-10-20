#!/usr/bin/env python3
"""Write remindsOf onto CatalogPerfume.document from src/lib/reminds-of.json."""

from __future__ import annotations

import json
import time
from pathlib import Path
from urllib.parse import unquote, urlparse

ROOT = Path(__file__).resolve().parents[1]
MAP = ROOT / "src" / "lib" / "reminds-of.json"


def db_connect():
    import psycopg2

    line = next(l for l in (ROOT / ".env").read_text().splitlines() if l.startswith("DATABASE_URL="))
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
    payload = json.loads(MAP.read_text(encoding="utf-8"))
    by_slug: dict = payload.get("bySlug") or {}
    if not by_slug:
        raise SystemExit("empty bySlug")

    conn = db_connect()
    conn.autocommit = False
    updated = 0
    skipped = 0
    missing = 0
    t0 = time.time()
    try:
        with conn.cursor() as cur:
            for slug, links in by_slug.items():
                reminds = [
                    {
                        "id": item["id"],
                        "relation": "inspired" if item.get("relation") == "inspired" else "similar",
                        **({"source": item["source"]} if item.get("source") else {}),
                    }
                    for item in links
                ]
                cur.execute(
                    'SELECT document FROM aroma."CatalogPerfume" WHERE slug = %s',
                    (slug,),
                )
                row = cur.fetchone()
                if not row:
                    missing += 1
                    continue
                doc = json.loads(row[0])
                existing = doc.get("remindsOf")
                if existing == reminds:
                    skipped += 1
                    continue
                doc["remindsOf"] = reminds
                cur.execute(
                    'UPDATE aroma."CatalogPerfume" SET document = %s, "updatedAt" = NOW() WHERE slug = %s',
                    (json.dumps(doc, ensure_ascii=False), slug),
                )
                updated += 1
                if updated % 50 == 0:
                    conn.commit()
                    print(f"… {updated} updated", flush=True)
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()

    print(
        json.dumps(
            {
                "updated": updated,
                "skipped": skipped,
                "missing": missing,
                "seconds": round(time.time() - t0, 1),
            },
            ensure_ascii=False,
        )
    )


if __name__ == "__main__":
    main()
