import { createRequire } from "module";

const require = createRequire(import.meta.url);

type PdfParseResult = {
  text?: string;
  numpages?: number;
};

type PdfParseFunction = (dataBuffer: Buffer) => Promise<PdfParseResult>;

export async function extractPdfText(buffer: Buffer) {
  const pdfParse = require("pdf-parse/lib/pdf-parse.js") as PdfParseFunction;

  const result = await pdfParse(buffer);

  const text = String(result.text ?? "")
    .replace(/\u0000/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return {
    text,
    pageCount: result.numpages ?? 0,
    preview: text.slice(0, 2000),
  };
}