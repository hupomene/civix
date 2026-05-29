import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
type DocumentDeleteRow = {
  id: string;
  storage_path: string | null;
};

const BUCKET_NAME = "civix-documents";

type DeleteDocumentRequest = {
  documentId: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as DeleteDocumentRequest;

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

    const documentForDelete = documentRow as DocumentDeleteRow;

    if (documentForDelete.storage_path) {
      const { error: storageError } = await supabase.storage
        .from(BUCKET_NAME)
        .remove([documentForDelete.storage_path]);

      if (storageError) {
        throw new Error(storageError.message);
      }
    }

    const { error: deleteError } = await supabase
      .from("uploaded_documents")
      .delete()
      .eq("id", body.documentId);

    if (deleteError) {
      throw new Error(deleteError.message);
    }

    return NextResponse.json({
      ok: true,
      deletedDocumentId: body.documentId,
    });
  } catch (error) {
    console.error("Document delete failed:", error);

    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error ? error.message : "Failed to delete document.",
      },
      { status: 500 }
    );
  }
}