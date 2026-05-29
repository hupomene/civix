import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

type ProjectDocumentStorageRow = {
  storage_path: string | null;
};

const BUCKET_NAME = "civix-documents";

type DeleteProjectRequest = {
  projectId: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as DeleteProjectRequest;

    if (!body.projectId) {
      return NextResponse.json(
        {
          ok: false,
          error: "Missing projectId.",
        },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const { data: documents, error: documentsError } = await supabase
      .from("uploaded_documents")
      .select("storage_path")
      .eq("project_id", body.projectId);

    if (documentsError) {
      throw new Error(documentsError.message);
    }

    const documentRows =
      (documents ?? []) as unknown as ProjectDocumentStorageRow[];

    const storagePaths = documentRows
      .map((document) => document.storage_path)
      .filter((path): path is string => Boolean(path));

    if (storagePaths.length > 0) {
      const { error: storageError } = await supabase.storage
        .from(BUCKET_NAME)
        .remove(storagePaths);

      if (storageError) {
        throw new Error(storageError.message);
      }
    }

    const { error: deleteError } = await supabase
      .from("projects")
      .delete()
      .eq("id", body.projectId);

    if (deleteError) {
      throw new Error(deleteError.message);
    }

    return NextResponse.json({
      ok: true,
      deletedProjectId: body.projectId,
      deletedStorageFiles: storagePaths.length,
    });
  } catch (error) {
    console.error("Project delete failed:", error);

    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error ? error.message : "Failed to delete project.",
      },
      { status: 500 }
    );
  }
}