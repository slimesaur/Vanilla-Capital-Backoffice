#!/usr/bin/env python3
"""
Add column "IMAGE NAME" (filename without extension) to the paired + local paths CSV.

Algorithm (aligned with common data-pipeline practice: derive labels from canonical paths):
  1. Primary: pathlib.Path(path).stem — cross-platform, handles separators and final suffix
     (see Python pathlib docs / Real Python pathlib guide).
  2. If local_image_path is empty but figma_node_id exists: reconstruct the same stem the
     exporter would use (slugify Nome ERP + disambiguation), via build_node_file_stems.
  3. Optional --validate: warn when path is set but file missing on disk.

Usage:
  python add_image_name_column.py
  python add_image_name_column.py --csv ~/Desktop/Produtos-CADASTROS_figma_paired_with_local_images.csv --validate
"""

from __future__ import annotations

import argparse
import csv
import importlib.util
import sys
import unicodedata
from pathlib import Path
from urllib.parse import unquote, urlparse

SCRIPT_DIR = Path(__file__).resolve().parent


def _load_exporter():
    spec = importlib.util.spec_from_file_location(
        "brew_export", SCRIPT_DIR / "export_figma_imgur.py"
    )
    mod = importlib.util.module_from_spec(spec)
    assert spec.loader
    spec.loader.exec_module(mod)
    return mod


def normalize_path_string(raw: str) -> str:
    """Strip, NFC unicode, collapse accidental wrapping quotes."""
    s = (raw or "").strip().strip('"').strip("'")
    if not s:
        return ""
    return unicodedata.normalize("NFC", s)


def image_name_from_local_path(path_str: str) -> str:
    """
    Authoritative image name from a filesystem path.
    Uses Path.stem (last path segment, final suffix removed) — recommended for CSV pipelines.
    """
    s = normalize_path_string(path_str)
    if not s:
        return ""
    p = Path(s)
    return p.stem


def image_name_from_url(url_str: str) -> str:
    """If image_url points to a hosted file, derive stem from last path segment."""
    s = normalize_path_string(url_str)
    if not s or "://" not in s:
        return ""
    path = unquote(urlparse(s).path)
    if not path or path.endswith("/"):
        return ""
    return Path(path).stem


def main() -> int:
    p = argparse.ArgumentParser(description='Add "IMAGE NAME" column from paths / ERP stems.')
    p.add_argument(
        "--csv",
        type=Path,
        default=Path.home()
        / "Desktop"
        / "Produtos-CADASTROS_figma_paired_with_local_images.csv",
    )
    p.add_argument(
        "--out",
        type=Path,
        default=None,
        help="Default: input stem + _image_names.csv on Desktop",
    )
    p.add_argument(
        "--name-column",
        default="Nome ERP",
        help="Used with figma_node_id when local_image_path is empty",
    )
    p.add_argument(
        "--validate",
        action="store_true",
        help="Print stderr warnings if local_image_path points to a missing file",
    )
    args = p.parse_args()

    if not args.csv.is_file():
        print(f"Input not found: {args.csv}", file=sys.stderr)
        return 1

    out_path = args.out
    if out_path is None:
        out_path = args.csv.with_name(
            args.csv.stem + "_image_names" + args.csv.suffix
        )

    exp = _load_exporter()

    with args.csv.open(newline="", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        fieldnames = list(reader.fieldnames or [])
        rows = list(reader)

    if args.name_column not in fieldnames:
        print(f'Missing column "{args.name_column}".', file=sys.stderr)
        return 1

    col_image = "IMAGE NAME"
    if col_image in fieldnames:
        fieldnames = [c for c in fieldnames if c != col_image]
    fieldnames.append(col_image)

    unique_ids: list[str] = []
    seen: set[str] = set()
    for row in rows:
        nid = (row.get("figma_node_id") or "").strip()
        if nid and nid not in seen:
            seen.add(nid)
            unique_ids.append(nid)

    node_stems: dict[str, str] = exp.build_node_file_stems(
        unique_ids, rows, args.name_column
    )

    missing_files = 0
    path_mismatch = 0

    for row in rows:
        local = row.get("local_image_path") or ""
        url = row.get("image_url") or ""
        nid = (row.get("figma_node_id") or "").strip()

        name = image_name_from_local_path(local)
        if not name and url:
            name = image_name_from_url(url)
        if not name and nid:
            name = node_stems.get(nid, "")

        row[col_image] = name

        if args.validate and local.strip():
            ps = normalize_path_string(local)
            path_obj = Path(ps)
            if not path_obj.is_file():
                print(f"Missing file: {ps}", file=sys.stderr)
                missing_files += 1
            elif nid:
                expected = node_stems.get(nid, "")
                if expected and path_obj.stem != expected:
                    print(
                        f"Stem mismatch for {nid}: path={path_obj.stem!r} expected={expected!r}",
                        file=sys.stderr,
                    )
                    path_mismatch += 1

    with out_path.open("w", newline="", encoding="utf-8-sig") as f:
        w = csv.DictWriter(f, fieldnames=fieldnames, extrasaction="ignore")
        w.writeheader()
        w.writerows(rows)

    print(f"Wrote {out_path} ({len(rows)} rows)", file=sys.stderr)
    if args.validate and (missing_files or path_mismatch):
        print(
            f"validate: missing_files={missing_files} stem_mismatches={path_mismatch}",
            file=sys.stderr,
        )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
