import { createAdminClient } from "@/lib/supabase/admin";
import { getOrCreateDemoProject } from "@/lib/database/demo-project";
import type { AIReviewResult, UploadedDocument } from "@/types/ai-review";

function safeJsonArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

export async function getDemoProjectWorkspaceData() {
  const supabase = createAdminClient();
  const project = await getOrCreateDemoProject();

  const { data: latestReview, error: reviewError } = await supabase
    .from("ai_reviews")
    .select("*")
    .eq("project_id", project.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (reviewError) {
    throw new Error(reviewError.message);
  }

  const { data: documents, error: documentsError } = await supabase
    .from("uploaded_documents")
    .select("*")
    .eq("project_id", project.id)
    .order("created_at", { ascending: false });

  if (documentsError) {
    throw new Error(documentsError.message);
  }

  const uploadedDocuments: UploadedDocument[] =
    documents?.map((document) => ({
      id: document.id,
      name: document.name,
      type: document.file_type ?? "Unknown",
      size: document.file_size ?? 0,
    })) ?? [];

  const reviewResult: AIReviewResult | null = latestReview
    ? {
        impactSummary: latestReview.impact_summary,
        affectedDocuments: safeJsonArray<string>(
          latestReview.affected_documents
        ),
        risks: safeJsonArray<AIReviewResult["risks"][number]>(
          latestReview.risks
        ),
        checklist: safeJsonArray<string>(latestReview.checklist),
      }
    : null;

  return {
    project,
    documents: uploadedDocuments,
    latestReview,
    reviewResult,
  };
}