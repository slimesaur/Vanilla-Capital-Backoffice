/**
 * Builds Vanilla Capital letterhead .docx (header, footer, picture watermark).
 * Watermark: ~/Downloads/TEMPLATE_DOC.png or NEW WATERMARK.png (override: WATERMARK_PNG=...).
 * Image is resized in sharp to max edge WATERMARK_MAX_PX (default 2480) so Word embeds
 * a large bitmap and does not upscale a tiny file (avoids blur). Centered on the page.
 * Optional: WATERMARK_ALPHA=0.35 (multiplies PNG alpha channel).
 * Requires: npm install docx sharp
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import os from "os";
import sharp from "sharp";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Header,
  Footer,
  ImageRun,
  AlignmentType,
  SimpleField,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  VerticalAlignTable,
  HorizontalPositionRelativeFrom,
  VerticalPositionRelativeFrom,
  HorizontalPositionAlign,
  VerticalPositionAlign,
  TextWrappingType,
} from "docx";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const LOGO_SVG = path.join(root, "public/logos/LOGO LIGHT VERSION.svg");
function resolveWatermarkPng() {
  if (process.env.WATERMARK_PNG) {
    return path.resolve(process.env.WATERMARK_PNG);
  }
  const home = os.homedir();
  const candidates = [
    path.join(home, "Downloads/TEMPLATE_DOC.png"),
    path.join(home, "Downloads/NEW WATERMARK.png"),
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  return candidates[0];
}
const WATERMARK_PNG = resolveWatermarkPng();
/** Longest edge (px) after resize — print-friendly; keeps the PNG sharp in Word. */
const WATERMARK_MAX_PX = Number(process.env.WATERMARK_MAX_PX) || 2480;
const OUT = path.join(os.homedir(), "Desktop/Vanilla-Capital-Letterhead-Template.docx");
/** Second copy with a distinct name so Word/macOS cannot show a stale cached version of the same filename. */
const OUT_FRESH = path.join(
  os.homedir(),
  "Desktop/Vanilla-Capital-Letterhead-OPEN-THIS-COPY.docx"
);

async function fadeWatermarkPng(inputBuffer, fade = 0.12) {
  const { data, info } = await sharp(inputBuffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const out = Buffer.from(data);
  for (let i = 3; i < out.length; i += 4) {
    out[i] = Math.round(out[i] * fade);
  }
  return sharp(out, {
    raw: {
      width: info.width,
      height: info.height,
      channels: 4,
    },
  })
    .png()
    .toBuffer();
}

async function main() {
  if (!fs.existsSync(WATERMARK_PNG)) {
    console.error(
      `Missing watermark file:\n  ${WATERMARK_PNG}\n` +
        `Save "TEMPLATE_DOC.png" or "NEW WATERMARK.png" in Downloads, or set WATERMARK_PNG to the full path.`
    );
    process.exit(1);
  }

  const watermarkAlpha =
    process.env.WATERMARK_ALPHA !== undefined
      ? Number(process.env.WATERMARK_ALPHA)
      : 0.35;

  const svgBuf = fs.readFileSync(LOGO_SVG);

  const headerPng = await sharp(svgBuf)
    .resize({ width: 200, fit: "inside" })
    .png()
    .toBuffer();
  const headerMeta = await sharp(headerPng).metadata();
  const headerW = headerMeta.width ?? 200;
  const headerH = headerMeta.height ?? 110;

  const wmRaw = fs.readFileSync(WATERMARK_PNG);
  const wmBase = await sharp(wmRaw)
    .resize({
      width: WATERMARK_MAX_PX,
      height: WATERMARK_MAX_PX,
      fit: "inside",
      withoutEnlargement: false,
      kernel: sharp.kernel.lanczos3,
    })
    .ensureAlpha()
    .png({ compressionLevel: 3 })
    .toBuffer();

  const wmPng = await fadeWatermarkPng(wmBase, watermarkAlpha);
  const wmMeta = await sharp(wmPng).metadata();
  const wmW = wmMeta.width ?? 720;
  const wmH = wmMeta.height ?? 400;

  const header = new Header({
    children: [
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: {
          top: { style: BorderStyle.NONE },
          bottom: {
            style: BorderStyle.SINGLE,
            size: 6,
            color: "C8B991",
          },
          left: { style: BorderStyle.NONE },
          right: { style: BorderStyle.NONE },
          insideHorizontal: { style: BorderStyle.NONE },
          insideVertical: { style: BorderStyle.NONE },
        },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                width: { size: 35, type: WidthType.PERCENTAGE },
                verticalAlign: VerticalAlignTable.CENTER,
                margins: { top: 80, bottom: 120, left: 0, right: 200 },
                borders: {
                  top: { style: BorderStyle.NONE },
                  bottom: { style: BorderStyle.NONE },
                  left: { style: BorderStyle.NONE },
                  right: { style: BorderStyle.NONE },
                },
                children: [
                  new Paragraph({
                    children: [
                      new ImageRun({
                        type: "png",
                        data: headerPng,
                        transformation: {
                          width: headerW,
                          height: headerH,
                        },
                      }),
                    ],
                  }),
                ],
              }),
              new TableCell({
                width: { size: 65, type: WidthType.PERCENTAGE },
                verticalAlign: VerticalAlignTable.CENTER,
                margins: { top: 80, bottom: 120, left: 200, right: 0 },
                borders: {
                  top: { style: BorderStyle.NONE },
                  bottom: { style: BorderStyle.NONE },
                  left: { style: BorderStyle.NONE },
                  right: { style: BorderStyle.NONE },
                },
                children: [
                  new Paragraph({
                    alignment: AlignmentType.END,
                    children: [
                      new TextRun({
                        text: "Vanilla Capital",
                        bold: true,
                        size: 26,
                        color: "253A52",
                        font: "Calibri",
                      }),
                    ],
                  }),
                  new Paragraph({
                    alignment: AlignmentType.END,
                    spacing: { after: 80 },
                    children: [
                      new TextRun({
                        text: "Wealth Management",
                        italics: true,
                        size: 18,
                        color: "666666",
                        font: "Calibri",
                      }),
                    ],
                  }),
                  new Paragraph({
                    alignment: AlignmentType.END,
                    children: [
                      new TextRun({
                        text: "Av. Iguaçu, 2820 - Batel, Curitiba - PR, 80240-030",
                        size: 16,
                        color: "444444",
                        font: "Calibri",
                      }),
                    ],
                  }),
                  new Paragraph({
                    alignment: AlignmentType.END,
                    children: [
                      new TextRun({
                        text: "atendimento@vanillacapital.com.br  ·  ",
                        size: 16,
                        color: "444444",
                        font: "Calibri",
                      }),
                      new TextRun({
                        text: "www.vanillacapital.com.br",
                        size: 16,
                        color: "253A52",
                        font: "Calibri",
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });

  const footer = new Footer({
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
        children: [
          new TextRun({
            text: "Documento confidencial. Destinado exclusivamente ao destinatário. A reprodução ou encaminhamento sem autorização não é permitida.",
            size: 14,
            color: "666666",
            font: "Calibri",
            italics: true,
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 60 },
        children: [
          new TextRun({
            text: "CNPJ 63.046.208/0001-61 · ",
            size: 15,
            color: "444444",
            font: "Calibri",
          }),
          new TextRun({
            text: "vanillacapital.com.br",
            size: 15,
            color: "253A52",
            font: "Calibri",
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({ text: "Página ", size: 15, font: "Calibri", color: "444444" }),
          new SimpleField("PAGE"),
          new TextRun({ text: " de ", size: 15, font: "Calibri", color: "444444" }),
          new SimpleField("NUMPAGES"),
        ],
      }),
    ],
  });

  const watermarkParagraph = new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [
      new ImageRun({
        type: "png",
        data: wmPng,
        transformation: {
          width: wmW,
          height: wmH,
        },
        floating: {
          horizontalPosition: {
            relative: HorizontalPositionRelativeFrom.PAGE,
            align: HorizontalPositionAlign.CENTER,
          },
          verticalPosition: {
            relative: VerticalPositionRelativeFrom.PAGE,
            align: VerticalPositionAlign.CENTER,
          },
          behindDocument: true,
          allowOverlap: true,
          wrap: {
            type: TextWrappingType.NONE,
          },
        },
      }),
    ],
  });

  const doc = new Document({
    creator: "Vanilla Capital",
    title: "Modelo de papel timbrado",
    description:
      "Template institucional com marca d'água (ícone), cabeçalho e rodapé.",
    styles: {
      default: {
        document: {
          run: {
            font: "Calibri",
            size: 22,
          },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            size: {
              width: "210mm",
              height: "297mm",
            },
            margin: {
              top: "22mm",
              right: "20mm",
              bottom: "22mm",
              left: "20mm",
              header: "2mm",
              footer: "3mm",
            },
          },
        },
        headers: {
          default: header,
        },
        footers: {
          default: footer,
        },
        children: [
          watermarkParagraph,
          new Paragraph({ text: "" }),
          new Paragraph({
            children: [
              new TextRun({
                text: "[Data]",
                size: 20,
                color: "666666",
              }),
            ],
          }),
          new Paragraph({ text: "" }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Assunto: ",
                bold: true,
                size: 22,
              }),
              new TextRun({
                text: "[Inserir assunto]",
                size: 22,
              }),
            ],
          }),
          new Paragraph({ text: "" }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Prezado(a) [Nome],",
                size: 22,
              }),
            ],
          }),
          new Paragraph({ text: "" }),
          new Paragraph({
            children: [
              new TextRun({
                text: "[Corpo do documento — substitua este texto pelo conteúdo da sua comunicação.]",
                size: 22,
              }),
            ],
          }),
          new Paragraph({ text: "" }),
          new Paragraph({ text: "" }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Atenciosamente,",
                size: 22,
              }),
            ],
          }),
          new Paragraph({ text: "" }),
          new Paragraph({
            children: [
              new TextRun({
                text: "[Nome e cargo]",
                size: 22,
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Vanilla Capital",
                size: 22,
                bold: true,
                color: "253A52",
              }),
            ],
          }),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(OUT, buffer);
  fs.writeFileSync(OUT_FRESH, buffer);
  console.log("Wrote", OUT, `(${buffer.length} bytes)`);
  console.log("Also wrote", OUT_FRESH, "(open this if Word showed an old version)");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
