import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const BUCKET_NAME = "civix-jurisdiction-documents";

type JurisdictionUploadRow = {
  id: string;
  name: string;
  state: string;
  county: string | null;
  city: string | null;
  jurisdiction_type: string;
};

type JurisdictionDocumentUploadRow = {
  id: string;
  name: string;
  jurisdiction_id: string;
  document_type: string;
  storage_path: string | null;
};

const ALLOWED_DOCUMENT_TYPES = new Set([
  "permit_checklist",
  "revision_resubmittal",
  "adopted_code",
  "local_amendment",
  "fire_marshal",
  "accessibility",
  "energy_code",
  "portal_instruction",
  "other",
]);

function sanitizeFileName(fileName: string) {
  return fileName
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .toLowerCase();
}

function splitIntoChunks(text: string, maxChars = 1400) {
  const paragraphs = text
    .split(/\n\s*\n/g)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  const chunks: string[] = [];
  let current = "";

  for (const paragraph of paragraphs) {
    if ((current + "\n\n" + paragraph).length > maxChars && current) {
      chunks.push(current.trim());
      current = paragraph;
    } else {
      current = current ? `${current}\n\n${paragraph}` : paragraph;
    }
  }

  if (current.trim()) {
    chunks.push(current.trim());
  }

  return chunks;
}

function estimateTokens(text: string) {
  return Math.ceil(text.length / 4);
}

async function extractTextFromFile(file: File, buffer: Buffer) {
  const fileName = file.name.toLowerCase();
  const mimeType = file.type;

  if (mimeType === "text/plain" || fileName.endsWith(".txt")) {
    return buffer.toString("utf8");
  }

  if (mimeType === "application/pdf" || fileName.endsWith(".pdf")) {
    const pdfParse = (await import("pdf-parse/lib/pdf-parse.js")).default;
    const parsed = await pdfParse(buffer);
    return parsed.text ?? "";
  }

  throw new Error("Only PDF and TXT files are supported for jurisdiction documents.");
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const jurisdictionId = formData.get("jurisdictionId");
    const documentType = formData.get("documentType");
    const sourceUrl = formData.get("sourceUrl");
    const file = formData.get("file");

    console.log("Jurisdiction upload form data:", {
      jurisdictionId,
      jurisdictionIdType: typeof jurisdictionId,
      documentType,
      sourceUrl,
      fileName: file instanceof File ? file.name : null,
    });

    if (typeof jurisdictionId !== "string" || !jurisdictionId) {
      return NextResponse.json(
        { ok: false, error: "Missing jurisdictionId." },
        { status: 400 }
      );
    }

    if (typeof documentType !== "string" || !ALLOWED_DOCUMENT_TYPES.has(documentType)) {
      return NextResponse.json(
        { ok: false, error: "Invalid or missing documentType." },
        { status: 400 }
      );
    }

    if (!(file instanceof File)) {
      return NextResponse.json(
        { ok: false, error: "Missing file." },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const { data: jurisdiction, error: jurisdictionError } = await supabase
      .from("jurisdictions")
      .select("id, name")
      .eq("id", jurisdictionId.trim())
      .maybeSingle();

    if (jurisdictionError) {
      throw new Error(jurisdictionError.message);
    }

    if (!jurisdiction) {
      return NextResponse.json(
        {
          ok: false,
          error: `Jurisdiction not found for id: ${jurisdictionId}`,
        },
        { status: 404 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const jurisdictionForUpload = jurisdiction as JurisdictionUploadRow;

    const safeFileName = sanitizeFileName(file.name);
    const storagePath = `${jurisdictionForUpload.id}/${Date.now()}-${safeFileName}`;

    const extractedText = await extractTextFromFile(file, buffer);

    if (!extractedText.trim()) {
      throw new Error("No text could be extracted from this document.");
    }

    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(storagePath, buffer, {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      });

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    const { data: documentRow, error: documentInsertError } = await supabase
      .from("jurisdiction_documents")
      .insert({
        jurisdiction_id: jurisdictionForUpload.id,
        name: file.name,
        document_type: documentType,
        source_type: "upload",
        source_url: typeof sourceUrl === "string" && sourceUrl ? sourceUrl : null,
        storage_path: storagePath,
        mime_type: file.type || null,
        size_bytes: file.size,
        extracted_text: extractedText,
        extracted_text_preview: extractedText.slice(0, 1000),
        extraction_status: "completed",
        extracted_at: new Date().toISOString(),
      } as any)
      .select("id, name")
      .single();

    if (documentInsertError) {
      throw new Error(documentInsertError.message);
    }

    const jurisdictionDocumentForUpload =
      documentRow as JurisdictionDocumentUploadRow;

    const chunks = splitIntoChunks(extractedText);

    const chunkRows = chunks.map((chunk, index) => ({
      jurisdiction_document_id: jurisdictionDocumentForUpload.id,
      jurisdiction_id: jurisdictionForUpload.id,
      chunk_index: index,
      content: chunk,
      token_estimate: estimateTokens(chunk),
      document_type: documentType,
    }));

    if (chunkRows.length > 0) {
      const { error: chunksError } = await supabase
        .from("jurisdiction_chunks")
        .insert(chunkRows as any);

      if (chunksError) {
        throw new Error(chunksError.message);
      }
    }

    return NextResponse.json({
      ok: true,
      jurisdictionId: jurisdictionForUpload.id,
      jurisdictionName: jurisdictionForUpload.name,
      documentId: jurisdictionDocumentForUpload.id,
      documentName: jurisdictionDocumentForUpload.name,
      documentType,
      storagePath,
      chunkCount: chunkRows.length,
    });
  } catch (error) {
    console.error("Jurisdiction document upload failed:", error);

    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to upload jurisdiction document.",
      },
      { status: 500 }
    );
  }
}