import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const BUCKET_NAME = "civix-jurisdiction-documents";

type DeleteJurisdictionDocumentRequest = {
  documentId: string;
};

type JurisdictionDocumentDeleteRow = {
  id: string;
  name: string;
  storage_path: string | null;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as DeleteJurisdictionDocumentRequest;

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
      .from("jurisdiction_documents")
      .select("id, name, storage_path")
      .eq("id", body.documentId)
      .maybeSingle();

    if (selectError) {
      throw new Error(selectError.message);
    }

    if (!documentRow) {
      return NextResponse.json(
        {
          ok: false,
          error: `Jurisdiction document not found for id: ${body.documentId}`,
        },
        { status: 404 }
      );
    }

    const documentForDelete = documentRow as JurisdictionDocumentDeleteRow;

    if (documentForDelete.storage_path) {
      const { error: storageError } = await supabase.storage
        .from(BUCKET_NAME)
        .remove([documentForDelete.storage_path]);

      if (storageError) {
        throw new Error(storageError.message);
      }
    }

    const { error: deleteError } = await supabase
      .from("jurisdiction_documents")
      .delete()
      .eq("id", body.documentId);

    if (deleteError) {
      throw new Error(deleteError.message);
    }

    return NextResponse.json({
      ok: true,
      deletedDocumentId: body.documentId,
      deletedDocumentName: documentForDelete.name,
    });
  } catch (error) {
    console.error("Jurisdiction document delete failed:", error);

    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to delete jurisdiction document.",
      },
      { status: 500 }
    );
  }
}