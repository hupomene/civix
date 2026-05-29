import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
type DocumentDownloadRow = {
  id: string;
  name: string;
  storage_path: string | null;
};

const BUCKET_NAME = "civix-documents";

type DownloadDocumentRequest = {
  documentId: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as DownloadDocumentRequest;

    if (!body.documentId) {
      return NextResponse.json(
        {
          ok: false,
          error: "Missing documentId.",
        },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const { data: documentRow, error: selectError } = await supabase
      .from("uploaded_documents")
      .select("*")
      .eq("id", body.documentId)
      .single();

    if (selectError) {
      throw new Error(selectError.message);
    }

    const documentForDownload = documentRow as DocumentDownloadRow;

    if (!documentForDownload.storage_path) {
      return NextResponse.json(
        {
          ok: false,
          error: "Document storage path not found.",
        },
        { status: 404 }
      );
    }

    const { data: signedUrlData, error: signedUrlError } =
      await supabase.storage
        .from(BUCKET_NAME)
        .createSignedUrl(documentForDownload.storage_path, 60 * 5);

    if (signedUrlError) {
      throw new Error(signedUrlError.message);
    }

    return NextResponse.json({
      ok: true,
      documentName: documentForDownload.name,
      signedUrl: signedUrlData.signedUrl,
    });
  } catch (error) {
    console.error("Document download failed:", error);

    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to create document download link.",
      },
      { status: 500 }
    );
  }
}