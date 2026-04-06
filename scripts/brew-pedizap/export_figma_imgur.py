#!/usr/bin/env python3
"""
Export Figma PNGs for each row that has figma_node_id.

Modes:
  • Local (recommended): save PNGs named from spreadsheet column (default: Nome ERP),
    write paths into local_image_path (and image_url left empty unless you use Imgur).
  • Imgur: set IMGUR_CLIENT_ID and omit --no-imgur to upload and fill image_url.

Requires FIGMA_TOKEN (env or scripts/brew-pedizap/.env).

Examples:
  python export_figma_imgur.py --local --csv ~/Desktop/Produtos-CADASTROS_figma_paired.csv
  python export_figma_imgur.py --no-imgur --save-dir ./pngs --csv ...
"""

from __future__ import annotations

import argparse
import base64
import csv
import json
import os
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
DEFAULT_ENV = SCRIPT_DIR / ".env"

INVALID_FS_CHARS = re.compile(r'[<>:"/\\|?\*\n\r\x00-\x1f]')


def slugify_filename(name: str, max_len: int = 180) -> str:
    """Safe single filename stem (no extension); keeps letters/numbers/spaces/accents where possible."""
    name = (name or "").strip()
    name = INVALID_FS_CHARS.sub("_", name)
    name = re.sub(r"\s+", "_", name)
    name = name.replace("..", "_").strip(" ._")
    if len(name) > max_len:
        name = name[:max_len].rstrip(" ._")
    return name or "unnamed"


def load_dotenv(path: Path) -> dict[str, str]:
    env: dict[str, str] = {}
    if not path.is_file():
        return env
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, _, v = line.partition("=")
        env[k.strip()] = v.strip().strip('"').strip("'")
    return env


def figma_headers(token: str) -> list[tuple[str, str]]:
    return [
        ("X-Figma-Token", token),
        ("Authorization", f"Bearer {token}"),
    ]


def figma_get(path: str, token: str) -> dict:
    last_err: Exception | None = None
    for name, value in figma_headers(token):
        req = urllib.request.Request(
            f"https://api.figma.com{path}",
            headers={name: value},
        )
        try:
            with urllib.request.urlopen(req, timeout=120) as resp:
                return json.loads(resp.read().decode("utf-8"))
        except urllib.error.HTTPError as e:
            last_err = e
            body = e.read().decode("utf-8", errors="replace")
            if e.code in (401, 403):
                continue
            raise RuntimeError(f"Figma API HTTP {e.code}: {body}") from e
    raise RuntimeError(f"Figma auth failed: {last_err}") from last_err


def http_get_bytes(url: str) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": "brew-pedizap-export/1.0"})
    with urllib.request.urlopen(req, timeout=120) as resp:
        return resp.read()


def _figma_images_one_batch(
    file_key: str, chunk: list[str], token: str, scale: int
) -> dict:
    qs = urllib.parse.urlencode(
        {"ids": ",".join(chunk), "format": "png", "scale": str(scale)}
    )
    return figma_get(f"/v1/images/{file_key}?{qs}", token)


def figma_export_png_urls(
    file_key: str,
    node_ids: list[str],
    token: str,
    scale: int = 1,
    batch_size: int = 8,
) -> dict[str, str]:
    """
    Batch-render PNG URLs. On Figma 400 / render timeout, splits batches recursively.
    Defaults: scale=1 and small batches to reduce "Render timeout" errors.
    """
    out: dict[str, str] = {}

    def process_chunk(chunk: list[str]) -> None:
        if not chunk:
            return
        try:
            data = _figma_images_one_batch(file_key, chunk, token, scale)
        except RuntimeError as e:
            msg = str(e).lower()
            if ("400" in str(e) or "timeout" in msg) and len(chunk) > 1:
                mid = (len(chunk) + 1) // 2
                process_chunk(chunk[:mid])
                process_chunk(chunk[mid:])
                return
            if len(chunk) == 1:
                print(f"Figma skip node {chunk[0]}: {e}", file=sys.stderr)
                return
            raise
        images = data.get("images") or {}
        err = data.get("err")
        if err and not any(images.values()) and len(chunk) > 1:
            mid = (len(chunk) + 1) // 2
            process_chunk(chunk[:mid])
            process_chunk(chunk[mid:])
            return
        if err:
            print(f"Figma images API note: {err}", file=sys.stderr)
        for nid, url in images.items():
            if url:
                out[nid] = url
        time.sleep(0.9)

    for i in range(0, len(node_ids), batch_size):
        process_chunk(node_ids[i : i + batch_size])
    return out


def imgur_upload_png(client_id: str, png: bytes, title: str = "") -> str:
    body = urllib.parse.urlencode(
        {
            "image": base64.standard_b64encode(png).decode(),
            "type": "base64",
            "title": title[:200] if title else "",
        }
    ).encode()
    req = urllib.request.Request(
        "https://api.imgur.com/3/image",
        data=body,
        headers={
            "Authorization": f"Client-ID {client_id}",
            "Content-Type": "application/x-www-form-urlencoded",
        },
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=120) as resp:
        payload = json.loads(resp.read().decode("utf-8"))
    if not payload.get("success"):
        raise RuntimeError(payload)
    return str(payload["data"]["link"])


def first_name_for_node(rows: list[dict[str, str]], node_id: str, name_col: str) -> str:
    for row in rows:
        if (row.get("figma_node_id") or "").strip() == node_id:
            return (row.get(name_col) or "").strip()
    return ""


def build_node_file_stems(
    unique_ids: list[str],
    rows: list[dict[str, str]],
    name_col: str,
) -> dict[str, str]:
    """node_id -> filename stem (no .png), unique on disk."""
    stem_owner: dict[str, str] = {}  # stem -> node_id
    out: dict[str, str] = {}
    for nid in unique_ids:
        raw = first_name_for_node(rows, nid, name_col)
        stem = slugify_filename(raw) if raw else ""
        nid_safe = nid.replace(":", "_")
        if not stem or stem == "unnamed":
            stem = f"figma_{nid_safe}"
        if stem in stem_owner and stem_owner[stem] != nid:
            stem = f"{stem}__{nid_safe}"
        while stem in stem_owner and stem_owner[stem] != nid:
            stem = f"{stem}_more"
        stem_owner[stem] = nid
        out[nid] = stem
    return out


def main() -> int:
    p = argparse.ArgumentParser(
        description="Export Figma PNGs; name files from spreadsheet; optional Imgur upload."
    )
    p.add_argument(
        "--csv",
        type=Path,
        default=Path.home() / "Desktop" / "Produtos-CADASTROS_figma_paired.csv",
        help="Input CSV (needs figma_node_id)",
    )
    p.add_argument("--out", type=Path, default=None, help="Output CSV path")
    p.add_argument(
        "--file-key",
        default=os.environ.get("FIGMA_FILE_KEY", "zf0mOHD6LQqGmYfhXeJj9q"),
    )
    p.add_argument(
        "--scale",
        type=int,
        default=1,
        help="1 = smaller/faster (default); 2 for higher resolution if batches succeed",
    )
    p.add_argument("--batch-size", type=int, default=8)
    p.add_argument(
        "--save-dir",
        type=Path,
        default=None,
        help="Folder for PNG files (required unless --local provides a default)",
    )
    p.add_argument(
        "--local",
        action="store_true",
        help="Save only: Desktop/brew_pedizap_product_images, no Imgur",
    )
    p.add_argument(
        "--name-column",
        default="Nome ERP",
        help="Column used for PNG filename (first row per figma_node_id wins)",
    )
    p.add_argument("--no-imgur", action="store_true", help="Do not upload to Imgur")
    p.add_argument("--sleep-imgur", type=float, default=0.75)
    args = p.parse_args()

    env_m = load_dotenv(DEFAULT_ENV)
    token = os.environ.get("FIGMA_TOKEN") or env_m.get("FIGMA_TOKEN", "")
    imgur_id = os.environ.get("IMGUR_CLIENT_ID") or env_m.get("IMGUR_CLIENT_ID", "")

    if args.local:
        args.no_imgur = True
        if args.save_dir is None:
            args.save_dir = Path.home() / "Desktop" / "brew_pedizap_product_images"

    if not token:
        print("Set FIGMA_TOKEN in env or scripts/brew-pedizap/.env", file=sys.stderr)
        return 1

    want_imgur = not args.no_imgur
    if want_imgur and not imgur_id:
        print(
            "Missing IMGUR_CLIENT_ID — use --local or --no-imgur --save-dir … for files only.",
            file=sys.stderr,
        )
        return 1
    if args.no_imgur and not args.save_dir:
        print("Local mode needs --save-dir (or use --local for a Desktop default).", file=sys.stderr)
        return 1

    if not args.csv.is_file():
        print(f"CSV not found: {args.csv}", file=sys.stderr)
        return 1

    out_path = args.out
    if out_path is None:
        if args.no_imgur:
            out_path = args.csv.with_name(
                args.csv.stem + "_with_local_images" + args.csv.suffix
            )
        else:
            out_path = args.csv.with_name(
                args.csv.stem + "_with_imgur_urls" + args.csv.suffix
            )

    with args.csv.open(newline="", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        fieldnames = list(reader.fieldnames or [])
        rows = list(reader)

    if "figma_node_id" not in fieldnames:
        print('CSV must include column "figma_node_id".', file=sys.stderr)
        return 1
    if args.name_column not in fieldnames:
        print(f'CSV must include name column "{args.name_column}".', file=sys.stderr)
        return 1

    unique_ids: list[str] = []
    seen: set[str] = set()
    for row in rows:
        nid = (row.get("figma_node_id") or "").strip()
        if nid and nid not in seen:
            seen.add(nid)
            unique_ids.append(nid)

    node_stems = build_node_file_stems(unique_ids, rows, args.name_column)

    print(f"Unique Figma nodes to export: {len(unique_ids)}", file=sys.stderr)
    figma_urls = figma_export_png_urls(
        args.file_key,
        unique_ids,
        token,
        scale=args.scale,
        batch_size=args.batch_size,
    )
    print(f"Figma returned {len(figma_urls)} render URLs", file=sys.stderr)

    assert args.save_dir is not None
    args.save_dir.mkdir(parents=True, exist_ok=True)
    save_abs = args.save_dir.resolve()

    node_to_imgur: dict[str, str] = {}
    node_to_local: dict[str, str] = {}
    failed: list[str] = []

    for i, nid in enumerate(unique_ids):
        furl = figma_urls.get(nid)
        if not furl:
            failed.append(nid)
            continue
        try:
            png = http_get_bytes(furl)
        except Exception as e:
            print(f"Download failed {nid}: {e}", file=sys.stderr)
            failed.append(nid)
            continue

        stem = node_stems[nid]
        fp = save_abs / f"{stem}.png"
        fp.write_bytes(png)
        node_to_local[nid] = str(fp)

        if args.no_imgur:
            continue

        try:
            link = imgur_upload_png(imgur_id, png, title=stem)
            node_to_imgur[nid] = link
        except Exception as e:
            print(f"Imgur failed {nid}: {e}", file=sys.stderr)
            failed.append(nid)
            continue

        time.sleep(args.sleep_imgur)
        if (i + 1) % 25 == 0:
            print(f"  uploaded {i + 1}/{len(unique_ids)}", file=sys.stderr)

    local_col = "local_image_path"
    url_col = "image_url"
    for col in (local_col, url_col):
        if col not in fieldnames:
            fieldnames.append(col)

    with out_path.open("w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=fieldnames, extrasaction="ignore")
        w.writeheader()
        for row in rows:
            nid = (row.get("figma_node_id") or "").strip()
            row[local_col] = node_to_local.get(nid, "")
            row[url_col] = node_to_imgur.get(nid, "") if not args.no_imgur else ""
            w.writerow(row)

    print(f"Wrote {out_path}", file=sys.stderr)
    print(f"PNGs folder: {save_abs}", file=sys.stderr)
    if failed:
        print(f"Failed nodes ({len(failed)}): first 10 {failed[:10]}", file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
