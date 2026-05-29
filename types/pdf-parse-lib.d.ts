declare module "pdf-parse/lib/pdf-parse.js" {
  type PdfParseResult = {
    text?: string;
    numpages?: number;
    numrender?: number;
    info?: unknown;
    metadata?: unknown;
    version?: string;
  };

  type PdfParseFunction = (
    dataBuffer: Buffer,
    options?: unknown
  ) => Promise<PdfParseResult>;

  const pdfParse: PdfParseFunction;

  export default pdfParse;
}