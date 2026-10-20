#!/usr/bin/env python3
"""Build reminds-of map + thin reference stubs from PM-approved sources."""

from __future__ import annotations

import json
import re
import unicodedata
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "src" / "lib" / "reminds-of.json"
OUT_COPY = ROOT / "data" / "catalog" / "reminds-of.v1.json"
SHOP = Path.home() / "Downloads" / "pending-approval.reminds-of.high.v1.PM_DECIDED.json"
PILOT = Path.home() / "Downloads" / "reminds-of.pilot.v2.xlsx"
FRAG = Path.home() / "Downloads" / "reminds-of.fragrantica-browser.approved.v1.csv"
REFS_TS = ROOT / "src" / "lib" / "references.ts"


def slugify(text: str) -> str:
    text = unicodedata.normalize("NFKD", text)
    text = text.encode("ascii", "ignore").decode("ascii")
    text = text.lower()
    text = re.sub(r"[^a-z0-9]+", "-", text).strip("-")
    return text[:64] or "ref"


def parse_target(raw: str):
    raw = (raw or "").strip()
    m = re.match(r"^(.+?)\s*\(([^)]+)\)\s*$", raw)
    if m:
        return m.group(1).strip(), m.group(2).strip()
    return raw, None


def load_existing_refs():
    text = REFS_TS.read_text(encoding="utf-8")
    ids = re.findall(r'^\s*id:\s*"([^"]+)"', text, re.M)
    ens = re.findall(r'nameEn:\s*"([^"]+)"', text)
    fas = re.findall(r'nameFa:\s*"([^"]+)"', text)
    alias_blocks = re.findall(r"aliases:\s*\[(.*?)\]", text, re.S)
    by_en = {}
    refs = {}
    for i, (rid, en, fa) in enumerate(zip(ids, ens, fas)):
        refs[rid] = {"id": rid, "nameFa": fa, "nameEn": en, "thin": False}
        by_en[en.lower()] = rid
        by_en[fa.replace("\u200c", "").lower()] = rid
        if i < len(alias_blocks):
            for alias in re.findall(r'"([^"]+)"', alias_blocks[i]):
                by_en[alias.lower()] = rid
                by_en[alias.replace("\u200c", "").lower()] = rid
    # common English variants
    extras = {
        "dior sauvage": "sauvage",
        "creed aventus": "aventus",
        "by kilian angels' share": "angels",
        "angels share": "angels",
        "parfums de marly althaïr": "althair",
        "parfums de marly althair": "althair",
        "althaïr": "althair",
        "creed silver mountain water": "silver-mountain",
        "silver mountain water": "silver-mountain",
        "creed green irish tweed": "irish-tweed",
        "green irish tweed": "irish-tweed",
        "maison francis kurkdjian baccarat rouge 540": "baccarat",
        "baccarat rouge 540": "baccarat",
        "rabanne invictus": "invictus",
        "paco rabanne invictus": "invictus",
        "yves saint laurent y": "ysl-y",
        "xerjoff erba pura": "erba-pura",
        "jean paul gaultier le beau": "le-beau",
        "nishane ani": "ani",
        "giorgio armani acqua di gio profondo": "profondo",
        "parfums de marly layton": "layton",
        "tom ford lost cherry": "lost-cherry",
        "chanel bleu de chanel": "bleu",
    }
    for k, v in extras.items():
        if v in refs:
            by_en[k] = v
    return refs, by_en


def resolve_id(name_en: str | None, name_fa: str, by_en: dict, stubs: dict) -> str:
    keys = []
    if name_en:
        keys.append(name_en.lower().strip())
        keys.append(re.sub(r"\s+", " ", name_en.lower()))
    keys.append(name_fa.replace("\u200c", "").lower())
    for key in keys:
        if key in by_en:
            return by_en[key]
    # already created stub this run
    for key in keys:
        if key in stubs:
            return stubs[key]["id"]
    rid = slugify(name_en or name_fa)
    # avoid colliding with rich refs accidentally
    base = rid
    n = 2
    while rid in by_en.values() or rid in {s["id"] for s in stubs.values()}:
        # if same id intended, reuse
        if rid in by_en.values():
            # find
            for k, v in by_en.items():
                if v == rid:
                    return rid
        rid = f"{base}-{n}"
        n += 1
    stubs[name_en.lower() if name_en else name_fa] = {
        "id": rid,
        "nameFa": name_fa,
        "nameEn": name_en or name_fa,
        "thin": True,
    }
    if name_en:
        by_en[name_en.lower()] = rid
    by_en[name_fa.replace("\u200c", "").lower()] = rid
    return rid


def relation_of(raw: str | None) -> str:
    text = raw or ""
    if "الهام" in text:
        return "inspired"
    return "similar"


def main() -> None:
    existing, by_en = load_existing_refs()
    stubs: dict = {}
    by_slug: dict[str, list] = defaultdict(list)
    seen_link = set()

    def add(slug: str, ref_id: str, relation: str, source: str, label_fa: str, label_en: str | None):
        key = (slug, ref_id)
        if key in seen_link:
            return
        seen_link.add(key)
        # prefer shop over fragrantica if both
        by_slug[slug].append(
            {
                "id": ref_id,
                "relation": relation,
                "source": source,
                "nameFa": label_fa,
                "nameEn": label_en,
            }
        )

    # 1) shop high approve
    shop = json.loads(SHOP.read_text(encoding="utf-8"))
    for item in shop.get("items") or []:
        if item.get("pm_decision") != "approve":
            continue
        slug = item["slug"]
        fa, en = parse_target(item.get("target") or "")
        if not fa:
            continue
        rid = resolve_id(en, fa, by_en, stubs)
        add(slug, rid, relation_of(item.get("relation")), "shop", fa, en)

    # 2) pilot high
    if PILOT.is_file():
        from openpyxl import load_workbook

        wb = load_workbook(PILOT, data_only=True)
        ws = wb.active
        for row in ws.iter_rows(min_row=2, values_only=True):
            slug = row[2]
            target = row[3]
            conf = str(row[5] or "")
            rel = str(row[4] or "")
            if not slug or not target or target.startswith("—"):
                continue
            if "بالا" not in conf and "high" not in conf.lower():
                continue
            fa, en = parse_target(target)
            rid = resolve_id(en, fa, by_en, stubs)
            add(str(slug), rid, relation_of(rel), "pilot", fa, en)

    # 3) fragrantica: only attach when card maps to a known/stub reference
    if FRAG.is_file():
        import csv

        with FRAG.open(encoding="utf-8") as f:
            for row in csv.DictReader(f):
                slug = row["target_slug"]
                en = (row.get("card_name") or "").strip()
                if not en:
                    continue
                key = en.lower()
                rid = by_en.get(key)
                if not rid:
                    # try without brand fluff
                    rid = by_en.get(re.sub(r"\s+", " ", key))
                if not rid:
                    continue
                # find label from stub or existing
                label_fa = None
                label_en = en
                if rid in existing:
                    label_fa = existing[rid]["nameFa"]
                    label_en = existing[rid]["nameEn"]
                else:
                    for s in stubs.values():
                        if s["id"] == rid:
                            label_fa = s["nameFa"]
                            label_en = s["nameEn"]
                            break
                if not label_fa:
                    continue
                add(slug, rid, "similar", "fragrantica", label_fa, label_en)

    # stable order: shop/pilot first already; cap 3 per perfume
    for slug in list(by_slug):
        items = by_slug[slug]
        # dedupe keep order
        out = []
        seen = set()
        for item in items:
            if item["id"] in seen:
                continue
            seen.add(item["id"])
            out.append(item)
            if len(out) >= 3:
                break
        by_slug[slug] = out

    thin_refs = sorted(stubs.values(), key=lambda r: r["id"])
    payload = {
        "_meta": {
            "shop": str(SHOP.name),
            "pilot": str(PILOT.name) if PILOT.is_file() else None,
            "fragrantica": str(FRAG.name) if FRAG.is_file() else None,
            "perfumeCount": len(by_slug),
            "linkCount": sum(len(v) for v in by_slug.values()),
            "thinReferenceCount": len(thin_refs),
            "note": "Shop/pilot approved reminds-of. Thin references get full copy later.",
        },
        "references": thin_refs,
        "bySlug": dict(sorted(by_slug.items())),
    }
    text = json.dumps(payload, ensure_ascii=False, indent=2) + "\n"
    OUT.write_text(text, encoding="utf-8")
    OUT_COPY.parent.mkdir(parents=True, exist_ok=True)
    OUT_COPY.write_text(text, encoding="utf-8")
    print(
        f"perfumes={len(by_slug)} links={payload['_meta']['linkCount']} "
        f"thin_refs={len(thin_refs)} -> {OUT}"
    )
    for slug in ("hawas-black", "liquid-brun", "asad", "khamrah", "turathi-electric"):
        print(slug, by_slug.get(slug))


if __name__ == "__main__":
    main()
