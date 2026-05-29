import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { extractPdfText } from "@/lib/documents/extract-pdf-text";
import { chunkText } from "@/lib/documents/chunk-text";

export const runtime = "nodejs";

const BUCKET_NAME = "civix-documents";

type UploadedDocumentRow = {
  id: string;
  name: string;
  file_type: string | null;
  file_size: number | null;
  storage_path: string | null;
};

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const projectId = formData.get("projectId");
    const files = formData.getAll("files");

    if (!projectId || typeof projectId !== "string") {
      return NextResponse.json(
        {
          ok: false,
          error: "Missing projectId.",
        },
        { status: 400 }
      );
    }

    if (!files || files.length === 0) {
      return NextResponse.json(
        {
          ok: false,
          error: "No files uploaded.",
        },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const uploadedDocuments = [];

    for (const fileEntry of files) {
      if (!(fileEntry instanceof File)) {
        continue;
      }

      const file = fileEntry;

      const safeFileName = file.name
        .replace(/[^a-zA-Z0-9.\-_]+/g, "-")
        .replace(/-+/g, "-");

      const storagePath = `${projectId}/${Date.now()}-${crypto.randomUUID()}-${safeFileName}`;

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);


      let extractedText: string | null = null;
      let extractedTextPreview: string | null = null;
      let extractionStatus = "not_processed";

      if (
        file.type === "application/pdf" ||
        file.name.toLowerCase().endsWith(".pdf")
      ) {
        try {
          const extracted = await extractPdfText(buffer);
          extractedText = extracted.text;
          extractedTextPreview = extracted.preview;
          extractionStatus = extracted.text ? "completed" : "empty";
        } catch (error) {
          console.error("PDF text extraction failed:", error);
          extractionStatus = "failed";
        }
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

      const { data: documentRow, error: insertError } = await supabase
        .from("uploaded_documents")
        .insert({
          project_id: projectId,
          name: file.name,
          file_type: file.type || "Unknown",
          file_size: file.size,
          storage_path: storagePath,
          extracted_text: extractedText,
          extracted_text_preview: extractedTextPreview,
          extraction_status: extractionStatus,
          extracted_at:
            extractionStatus === "completed" || extractionStatus === "empty"
              ? new Date().toISOString()
              : null,
        } as any)
        .select("*")
        .single();

      if (insertError) {
        throw new Error(insertError.message);
      }

      const uploadedDocument = documentRow as UploadedDocumentRow;

      if (extractedText && extractionStatus === "completed") {
        const chunks = chunkText(extractedText);

        if (chunks.length > 0) {
          const chunkRows = chunks.map((chunk) => ({
            document_id: uploadedDocument.id,
            project_id: projectId,
            chunk_index: chunk.chunkIndex,
            content: chunk.content,
            content_preview: chunk.contentPreview,
            token_estimate: chunk.tokenEstimate,
          }));

          const { error: chunkInsertError } = await supabase
            .from("document_chunks")
            .insert(chunkRows as any);

          if (chunkInsertError) {
            console.error("Document chunk insert failed:", chunkInsertError);
          }
        }
      }

      uploadedDocuments.push({
        id: uploadedDocument.id,
        name: uploadedDocument.name,
        type: uploadedDocument.file_type ?? "Unknown",
        size: uploadedDocument.file_size ?? 0,
        storagePath: uploadedDocument.storage_path,
      });
    }

    return NextResponse.json({
      ok: true,
      documents: uploadedDocuments,
    });
  } catch (error) {
    console.error("Document upload failed:", error);

    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error ? error.message : "Failed to upload documents.",
      },
      { status: 500 }
    );
  }
}