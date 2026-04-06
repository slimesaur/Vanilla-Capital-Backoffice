#!/usr/bin/env python3
"""
Match Figma layer names (under a parent frame) to CSV rows by "Nome ERP" using fuzzy matching.

Usage:
  export FIGMA_TOKEN="your_token"
  python pair_figma_csv.py --csv /path/to/Produtos-CADASTROS.csv

Or put FIGMA_TOKEN in scripts/brew-pedizap/.env (see env.example).
"""

from __future__ import annotations

import argparse
import csv
import json
import os
import sys
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

try:
    from rapidfuzz import fuzz, process
except ImportError:
    print("Install deps: pip install -r scripts/brew-pedizap/requirements.txt", file=sys.stderr)
    raise

SCRIPT_DIR = Path(__file__).resolve().parent
DEFAULT_ENV = SCRIPT_DIR / ".env"


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
    # figd_ tokens work with X-Figma-Token; try that first, then Bearer.
    return [
        ("X-Figma-Token", token),
        ("Authorization", f"Bearer {token}"),
    ]


def figma_get(path: str, token: str) -> dict:
    """GET https://api.figma.com + path. Tries auth header variants."""
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
    raise RuntimeError(
        f"Figma auth failed (401/403). Check FIGMA_TOKEN. Last error: {last_err}"
    ) from last_err


def find_node(node: dict, target_id: str) -> dict | None:
    if node.get("id") == target_id:
        return node
    for child in node.get("children") or []:
        found = find_node(child, target_id)
        if found:
            return found
    return None


def collect_named_leaves(node: dict, out: list[tuple[str, str]]) -> None:
    """Collect (id, name) for nodes that look like exportable product layers."""
    children = node.get("children") or []
    if not children:
        out.append((node["id"], node.get("name", "")))
        return
    for ch in children:
        collect_named_leaves(ch, out)


def collect_direct_children(node: dict) -> list[tuple[str, str]]:
    return [(c["id"], c.get("name", "")) for c in (node.get("children") or [])]


def discover_product_frames(document: dict) -> list[tuple[str, str]]:
    """
    Collect FRAME nodes whose names look like catalog lines (e.g. 'BRAND LATA 350ML - STYLE').
    The file URL node-id often points at one product; the full file must be scanned.
    """
    out: list[tuple[str, str]] = []

    def walk(n: dict) -> None:
        nm = (n.get("name") or "").strip()
        if n.get("type") == "FRAME" and " - " in nm and len(nm) > 12:
            out.append((n["id"], nm))
        for ch in n.get("children") or []:
            walk(ch)

    walk(document)
    return out


def _figma_choice_scorer(q: str, choice: object, **kwargs: object) -> float:
    if isinstance(choice, tuple):
        return float(fuzz.token_set_ratio(q, choice[1]))
    return float(fuzz.token_set_ratio(q, str(choice)))


def pair_greedy(
    erp_names: list[str],
    figma_layers: list[tuple[str, str]],
    min_review: int = 70,
    min_ok: int = 85,
) -> list[dict]:
    """
    Greedily assign each Figma layer to at most one ERP row (highest score wins).
    Unassigned ERP rows get best remaining layer if any.
    """
    # All candidate (erp, fid, figma_name, score) — use tuple choices so duplicate names keep distinct ids.
    candidates: list[tuple[str, str, str, float]] = []
    for erp in erp_names:
        if not erp.strip():
            continue
        hit = process.extractOne(erp, figma_layers, scorer=_figma_choice_scorer)
        if hit is None:
            continue
        choice, score, _idx = hit
        fid, fname = choice[0], choice[1]
        candidates.append((erp, fid, fname, float(score)))

    candidates.sort(key=lambda x: x[3], reverse=True)

    used_figma: set[str] = set()
    assigned: dict[str, tuple[str, str, float]] = {}  # erp -> (figma_name, figma_id, score)

    for erp, fid, fname, score in candidates:
        if erp in assigned:
            continue
        if fid in used_figma:
            continue
        assigned[erp] = (fname, fid, score)
        used_figma.add(fid)

    # Second pass: ERP rows still missing — try next-best unmatched layers
    unmatched_erps = [e for e in erp_names if e.strip() and e not in assigned]
    remaining = [(fid, name) for fid, name in figma_layers if fid not in used_figma]

    for erp in unmatched_erps:
        if not remaining:
            break
        hit = process.extractOne(erp, remaining, scorer=_figma_choice_scorer)
        if hit is None:
            continue
        choice, score, idx = hit
        fid, fname = choice[0], choice[1]
        assigned[erp] = (fname, fid, float(score))
        used_figma.add(fid)
        remaining.pop(idx)

    rows_out: list[dict] = []
    for erp in erp_names:
        if not erp.strip():
            rows_out.append(
                {
                    "Nome ERP": erp,
                    "figma_layer_name": "",
                    "figma_node_id": "",
                    "match_score": "",
                    "match_status": "empty_name",
                }
            )
            continue
        if erp not in assigned:
            rows_out.append(
                {
                    "Nome ERP": erp,
                    "figma_layer_name": "",
                    "figma_node_id": "",
                    "match_score": "",
                    "match_status": "no_match",
                }
            )
            continue
        fname, fid, score = assigned[erp]
        if score >= min_ok:
            status = "ok"
        elif score >= min_review:
            status = "review"
        else:
            status = "weak_match"
        rows_out.append(
            {
                "Nome ERP": erp,
                "figma_layer_name": fname,
                "figma_node_id": fid,
                "match_score": f"{score:.1f}",
                "match_status": status,
            }
        )
    return rows_out


def main() -> int:
    p = argparse.ArgumentParser(description="Pair Figma layers to CSV Nome ERP column.")
    p.add_argument(
        "--csv",
        type=Path,
        default=Path("/Users/guilhermesilva/Downloads/Produtos-CADASTROS.csv"),
        help="Input CSV path",
    )
    p.add_argument(
        "--out",
        type=Path,
        default=SCRIPT_DIR / "out" / "Produtos-CADASTROS_figma_paired.csv",
        help="Output CSV path",
    )
    p.add_argument(
        "--mode",
        choices=("discover", "parent"),
        default="discover",
        help="discover: scan whole file for product FRAMEs; parent: use one container node id",
    )
    p.add_argument(
        "--parent-node",
        default=os.environ.get("FIGMA_PRODUCTS_NODE_ID", "1:48"),
        help="With --mode parent: Figma node id whose children are products",
    )
    p.add_argument(
        "--file-key",
        default=os.environ.get("FIGMA_FILE_KEY", "zf0mOHD6LQqGmYfhXeJj9q"),
    )
    p.add_argument(
        "--children-mode",
        choices=("direct", "deep"),
        default="direct",
        help="With --mode parent only: direct vs deep children",
    )
    p.add_argument("--min-review", type=int, default=70)
    p.add_argument("--min-ok", type=int, default=85)
    args = p.parse_args()

    env_file = load_dotenv(DEFAULT_ENV)
    token = os.environ.get("FIGMA_TOKEN") or env_file.get("FIGMA_TOKEN", "")
    if not token:
        print(
            "Missing FIGMA_TOKEN. Set env var or add it to scripts/brew-pedizap/.env",
            file=sys.stderr,
        )
        return 1

    if not args.csv.is_file():
        print(f"CSV not found: {args.csv}", file=sys.stderr)
        return 1

    if args.mode == "discover":
        data = figma_get(f"/v1/files/{args.file_key}", token)
        doc = data.get("document")
        if not doc:
            print("Figma file response missing document.", file=sys.stderr)
            return 1
        figma_layers = discover_product_frames(doc)
    else:
        node_path = f"/v1/files/{args.file_key}/nodes?ids={urllib.parse.quote(args.parent_node)}"
        data = figma_get(node_path, token)
        nodes = data.get("nodes") or {}
        entry = nodes.get(args.parent_node)
        if not entry:
            print(
                f"Parent node {args.parent_node!r} not in API response. Keys: {list(nodes.keys())}",
                file=sys.stderr,
            )
            return 1
        doc = entry.get("document")
        if not doc:
            print("No document on parent node.", file=sys.stderr)
            return 1
        if args.children_mode == "direct":
            figma_layers = collect_direct_children(doc)
        else:
            layers: list[tuple[str, str]] = []
            for ch in doc.get("children") or []:
                collect_named_leaves(ch, layers)
            figma_layers = layers

    figma_layers = [(fid, name.strip()) for fid, name in figma_layers if name.strip()]
    print(f"Figma product frames collected: {len(figma_layers)} ({args.mode})", file=sys.stderr)

    with args.csv.open(newline="", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        fieldnames = list(reader.fieldnames or [])
        if "Nome ERP" not in fieldnames:
            print('CSV must have a column named exactly "Nome ERP".', file=sys.stderr)
            return 1
        rows = list(reader)

    erp_order = [row.get("Nome ERP") or "" for row in rows]
    pairs = pair_greedy(
        erp_order,
        figma_layers,
        min_review=args.min_review,
        min_ok=args.min_ok,
    )
    pair_by_erp = {p["Nome ERP"]: p for p in pairs}

    extra = [
        "figma_layer_name",
        "figma_node_id",
        "match_score",
        "match_status",
    ]
    out_fields = fieldnames + [c for c in extra if c not in fieldnames]
    args.out.parent.mkdir(parents=True, exist_ok=True)

    with args.out.open("w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=out_fields, extrasaction="ignore")
        w.writeheader()
        for row in rows:
            erp = row.get("Nome ERP") or ""
            patch = pair_by_erp.get(erp, {})
            merged = {**row, **{k: patch.get(k, "") for k in extra}}
            w.writerow(merged)

    ok = sum(1 for p in pairs if p.get("match_status") == "ok")
    review = sum(1 for p in pairs if p.get("match_status") == "review")
    bad = sum(
        1
        for p in pairs
        if p.get("match_status") in ("no_match", "weak_match", "empty_name")
    )
    print(
        f"Wrote {args.out}\n"
        f"  ok: {ok}, review: {review}, no_match/weak/empty: {bad}",
        file=sys.stderr,
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
