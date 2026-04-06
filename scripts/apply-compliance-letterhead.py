#!/usr/bin/env python3
"""
Apply Vanilla Capital letterhead (header, footer, watermark) from the built
template onto compliance Word documents.

Prerequisite:
  node scripts/build-letterhead.mjs

Template path:
  ~/Desktop/Vanilla-Capital-Letterhead-Template.docx

Writes:
  Desktop/compliance/<name> - Letterhead.docx
"""

from __future__ import annotations

import io
import os
import re
import sys
import xml.etree.ElementTree as ET
import zipfile

W_NS = "{http://schemas.openxmlformats.org/wordprocessingml/2006/main}"

HEADER_T = "http://schemas.openxmlformats.org/officeDocument/2006/relationships/header"
FOOTER_T = "http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer"
IMAGE_T = "http://schemas.openxmlformats.org/officeDocument/2006/relationships/image"


def _extract_body_inner(xml: str) -> tuple[str, str, str]:
    """Return (open_tag, inner_without_sectpr, close_tag) for w:body."""
    m = re.search(r"(<w:body[^>]*>)(.*)(</w:body>)", xml, re.DOTALL)
    if not m:
        raise ValueError("No w:body in document")
    open_tag, inner, close_tag = m.group(1), m.group(2), m.group(3)
    inner_wo = re.sub(r"<w:sectPr>.*?</w:sectPr>\s*$", "", inner, flags=re.DOTALL)
    return open_tag, inner_wo.strip(), close_tag


def _extract_first_two_paragraphs_and_sectpr(template_doc_xml: str) -> tuple[str, str, str]:
    """First two w:p and w:sectPr from template body (XML parse)."""
    root = ET.fromstring(template_doc_xml.encode("utf-8"))
    body = root.find(f".//{W_NS}body")
    if body is None:
        raise ValueError("No w:body in template")
    p_nodes: list[ET.Element] = []
    sect = None
    for child in body:
        tag = child.tag
        if tag == f"{W_NS}p":
            p_nodes.append(child)
            if len(p_nodes) >= 2:
                break
        elif tag == f"{W_NS}sectPr":
            sect = child
    if len(p_nodes) < 2:
        raise ValueError("Template needs at least two w:p in body")
    if sect is None:
        for child in body:
            if child.tag == f"{W_NS}sectPr":
                sect = child
                break
    if sect is None:
        raise ValueError("No w:sectPr in template")
    p1 = ET.tostring(p_nodes[0], encoding="unicode")
    p2 = ET.tostring(p_nodes[1], encoding="unicode")
    sectpr = ET.tostring(sect, encoding="unicode")
    return p1, p2, sectpr


def _inject_politica(template_z: zipfile.ZipFile, source_z: zipfile.ZipFile, out_z: zipfile.ZipFile) -> None:
    tpl_doc = template_z.read("word/document.xml").decode("utf-8")
    src_doc = source_z.read("word/document.xml").decode("utf-8")
    src_rels = source_z.read("word/_rels/document.xml.rels").decode("utf-8")

    p1, p2, sectpr = _extract_first_two_paragraphs_and_sectpr(tpl_doc)
    remap = {"rId7": "rId9", "rId8": "rId10", "rId9": "rId11"}
    for old, new in remap.items():
        p1 = p1.replace(old, new)
        p2 = p2.replace(old, new)
        sectpr = sectpr.replace(old, new)

    m = re.search(r"(<w:body[^>]*>)(.*)(</w:body>)", src_doc, re.DOTALL)
    if not m:
        raise ValueError("No w:body in source")
    full_inner = m.group(2)
    inner_wo = re.sub(r"<w:sectPr>.*?</w:sectPr>\s*$", "", full_inner, flags=re.DOTALL).strip()
    new_inner = p1 + p2 + inner_wo + sectpr
    new_doc = src_doc[: m.start(2)] + new_inner + src_doc[m.end(2) :]

    # document.xml.rels: append header, footer, watermark (template uses rId7–rId9 → rId9–rId11)
    insert = (
        f'<Relationship Id="rId9" Type="{HEADER_T}" Target="header1.xml"/>'
        f'<Relationship Id="rId10" Type="{FOOTER_T}" Target="footer1.xml"/>'
    )
    tpl_rels = template_z.read("word/_rels/document.xml.rels").decode("utf-8")
    wm = re.search(
        rf'<Relationship Id="rId9" Type="{re.escape(IMAGE_T)}" Target="([^"]+)"/>',
        tpl_rels,
    )
    if not wm:
        wm = re.search(r'Type="' + re.escape(IMAGE_T) + r'" Target="([^"]+)"', tpl_rels)
    if not wm:
        raise ValueError("Could not find watermark image relationship in template")
    wm_target = wm.group(1)
    insert += f'<Relationship Id="rId11" Type="{IMAGE_T}" Target="{wm_target}"/>'

    rels_out = src_rels.replace("</Relationships>", insert + "</Relationships>")

    for name in source_z.namelist():
        if name in ("word/document.xml", "word/_rels/document.xml.rels", "[Content_Types].xml"):
            continue
        out_z.writestr(name, source_z.read(name))

    for name in (
        "word/header1.xml",
        "word/footer1.xml",
        "word/_rels/header1.xml.rels",
        "word/_rels/footer1.xml.rels",
    ):
        out_z.writestr(name, template_z.read(name))

    for name in template_z.namelist():
        if name.startswith("word/media/"):
            out_z.writestr(name, template_z.read(name))

    ct = source_z.read("[Content_Types].xml").decode("utf-8")
    tpl_ct = template_z.read("[Content_Types].xml").decode("utf-8")
    for block in re.findall(r"<Override[^/>]+/>", tpl_ct):
        pn = re.search(r'PartName="([^"]+)"', block)
        if pn and pn.group(1) not in ct:
            ct = ct.replace("</Types>", block + "</Types>")

    out_z.writestr("[Content_Types].xml", ct.encode("utf-8"))
    out_z.writestr("word/document.xml", new_doc.encode("utf-8"))
    out_z.writestr("word/_rels/document.xml.rels", rels_out.encode("utf-8"))


def _inject_manual(template_z: zipfile.ZipFile, source_z: zipfile.ZipFile, out_z: zipfile.ZipFile) -> None:
    tpl_doc = template_z.read("word/document.xml").decode("utf-8")
    src_doc = source_z.read("word/document.xml").decode("utf-8")
    src_rels = source_z.read("word/_rels/document.xml.rels").decode("utf-8")

    p1, p2, _ = _extract_first_two_paragraphs_and_sectpr(tpl_doc)

    ids = [int(x) for x in re.findall(r'Id="rId(\d+)"', src_rels)]
    wm_rid = f"rId{max(ids) + 1 if ids else 1}"

    p1m = p1
    p1m = re.sub(r'r:embed="rId9"', f'r:embed="{wm_rid}"', p1m)
    p1m = re.sub(r'r:link="rId9"', f'r:link="{wm_rid}"', p1m)
    p1m = re.sub(r'r:id="rId9"', f'r:id="{wm_rid}"', p1m)

    m = re.search(r"(<w:body[^>]*>)(.*)(</w:body>)", src_doc, re.DOTALL)
    if not m:
        raise ValueError("No body")
    src_body_inner = m.group(2)
    sect_m = re.search(r"<w:sectPr>.*?</w:sectPr>\s*$", src_body_inner, re.DOTALL)
    if not sect_m:
        raise ValueError("No sectPr in source")
    sectpr = sect_m.group(0)
    inner_wo = src_body_inner[: sect_m.start()].strip()

    new_inner = p1m + p2 + inner_wo + sectpr
    new_doc = src_doc[: m.start(2)] + new_inner + src_doc[m.end(2) :]

    tpl_rels = template_z.read("word/_rels/document.xml.rels").decode("utf-8")
    wm = re.search(r'Type="' + re.escape(IMAGE_T) + r'" Target="([^"]+)"', tpl_rels)
    if not wm:
        raise ValueError("No watermark in template")
    wm_target = wm.group(1)
    insert = f'<Relationship Id="{wm_rid}" Type="{IMAGE_T}" Target="{wm_target}"/>'
    rels_out = src_rels.replace("</Relationships>", insert + "</Relationships>")

    for name in source_z.namelist():
        if name in (
            "word/document.xml",
            "word/_rels/document.xml.rels",
            "word/header1.xml",
            "word/header2.xml",
            "word/footer1.xml",
            "[Content_Types].xml",
        ):
            continue
        out_z.writestr(name, source_z.read(name))

    hdr1 = template_z.read("word/header1.xml")
    out_z.writestr("word/header1.xml", hdr1)
    out_z.writestr("word/header2.xml", hdr1)
    out_z.writestr("word/footer1.xml", template_z.read("word/footer1.xml"))
    out_z.writestr("word/_rels/header1.xml.rels", template_z.read("word/_rels/header1.xml.rels"))
    out_z.writestr("word/_rels/footer1.xml.rels", template_z.read("word/_rels/footer1.xml.rels"))

    for name in template_z.namelist():
        if name.startswith("word/media/"):
            out_z.writestr(name, template_z.read(name))

    ct = source_z.read("[Content_Types].xml").decode("utf-8")
    tpl_ct = template_z.read("[Content_Types].xml").decode("utf-8")
    for block in re.findall(r"<Override[^/>]+/>", tpl_ct):
        pn = re.search(r'PartName="([^"]+)"', block)
        if pn and pn.group(1) not in ct:
            ct = ct.replace("</Types>", block + "</Types>")

    out_z.writestr("[Content_Types].xml", ct.encode("utf-8"))
    out_z.writestr("word/document.xml", new_doc.encode("utf-8"))
    out_z.writestr("word/_rels/document.xml.rels", rels_out.encode("utf-8"))


def main() -> int:
    home = os.path.expanduser("~")
    template = os.path.join(home, "Desktop/Vanilla-Capital-Letterhead-Template.docx")
    compliance_dir = os.path.join(home, "Desktop/compliance")

    if not os.path.isfile(template):
        print(
            "Missing letterhead template. Run:\n  node scripts/build-letterhead.mjs",
            file=sys.stderr,
        )
        return 1

    jobs = [
        (
            os.path.join(compliance_dir, "VANILLA - POLÍTICA DE INVESTIMENTOS PESSOAIS .docx"),
            "politica",
        ),
        (
            os.path.join(compliance_dir, "VANILLA - MANUAL DE COMPLIANCE .docx"),
            "manual",
        ),
    ]

    for path, kind in jobs:
        if not os.path.isfile(path):
            print(f"Missing: {path}", file=sys.stderr)
            return 1

    tpl = zipfile.ZipFile(template, "r")

    for path, kind in jobs:
        base = os.path.basename(path).removesuffix(".docx").strip()
        out_name = f"{base} - Letterhead.docx"
        out_path = os.path.join(compliance_dir, out_name)
        buf = io.BytesIO()
        with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as out_z:
            with zipfile.ZipFile(path, "r") as src_z:
                if kind == "politica":
                    _inject_politica(tpl, src_z, out_z)
                else:
                    _inject_manual(tpl, src_z, out_z)
        with open(out_path, "wb") as f:
            f.write(buf.getvalue())
        print(f"Wrote {out_path}")

    tpl.close()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
