import { createAdminClient } from "@/lib/supabase/admin";
import type { AIReviewResult, UploadedDocument } from "@/types/ai-review";
import type { Database } from "@/types/database";

type UploadedDocumentInsert =
  Database["public"]["Tables"]["uploaded_documents"]["Insert"];

type SaveAIReviewInput = {
  projectId: string;
  designChange: string;
  result: AIReviewResult;
  documents: UploadedDocument[];
  modelUsed: string;
};

async function upsertUploadedDocumentMetadata({
  projectId,
  documents,
}: {
  projectId: string;
  documents: UploadedDocument[];
}) {
  if (documents.length === 0) return;

  const supabase = createAdminClient();

  for (const document of documents) {
    const { data: existingDocuments, error: selectError } = await supabase
      .from("uploaded_documents")
      .select("id")
      .eq("project_id", projectId)
      .eq("name", document.name)
      .eq("file_size", document.size)
      .limit(1);

    if (selectError) {
      throw new Error(selectError.message);
    }

    if (existingDocuments && existingDocuments.length > 0) {
      continue;
    }

    const documentRow: UploadedDocumentInsert = {
      project_id: projectId,
      name: document.name,
      file_type: document.type,
      file_size: document.size,
      storage_path: null,
    };

    const { error: insertError } = await supabase
      .from("uploaded_documents")
      .insert(documentRow as any);

    if (insertError) {
      throw new Error(insertError.message);
    }
  }
}

export async function saveAIReview({
  projectId,
  designChange,
  result,
  documents,
  modelUsed,
}: SaveAIReviewInput) {
  const supabase = createAdminClient();

  const { data: review, error: reviewError } = await supabase
    .from("ai_reviews")
    .insert({
      project_id: projectId,
      design_change: designChange,
      impact_summary: result.impactSummary,
      affected_documents: result.affectedDocuments,
      risks: result.risks,
      checklist: result.checklist,
      model_used: modelUsed,
    })
    .select("*")
    .single();

  if (reviewError) {
    throw new Error(reviewError.message);
  }

  await upsertUploadedDocumentMetadata({
    projectId,
    documents,
  });

  return review;
}