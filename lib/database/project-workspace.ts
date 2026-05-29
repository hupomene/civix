import { createAdminClient } from "@/lib/supabase/admin";
import { getOrCreateDemoProject } from "@/lib/database/demo-project";
import type { AIReviewResult, UploadedDocument } from "@/types/ai-review";

type UploadedDocumentRow = {
  id: string;
  name: string;
  file_type: string | null;
  file_size: number | null;
  storage_path: string | null;
  extraction_status: string | null;
};

type ProjectRow = {
  id: string;
  name: string;
  location: string | null;
  project_type: string | null;
  jurisdiction_id: string | null;
  created_at: string;
};

function safeJsonArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function toReviewResult(latestReview: {
  impact_summary: string;
  affected_documents: unknown;
  risks: unknown;
  checklist: unknown;
  evidence_notes?: unknown;
}): AIReviewResult {
  return {
    impactSummary: latestReview.impact_summary,
    affectedDocuments: safeJsonArray<string>(latestReview.affected_documents),
    risks: safeJsonArray<AIReviewResult["risks"][number]>(latestReview.risks),
    checklist: safeJsonArray<string>(latestReview.checklist),
    evidenceNotes: safeJsonArray<string>(latestReview.evidence_notes),
  };
}

export async function getProjectWorkspaceData(projectId: string) {
  const supabase = createAdminClient();

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .single();

  if (projectError) {
    throw new Error(projectError.message);
  }

  const projectRow = project as ProjectRow;

  const { data: latestReview, error: reviewError } = await supabase
    .from("ai_reviews")
    .select("*")
    .eq("project_id", projectRow.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (reviewError) {
    throw new Error(reviewError.message);
  }

  const { data: documents, error: documentsError } = await supabase
    .from("uploaded_documents")
    .select("*")
    .eq("project_id", projectRow.id)
    .order("created_at", { ascending: false });

  if (documentsError) {
    throw new Error(documentsError.message);
  }

  const documentRows = (documents ?? []) as UploadedDocumentRow[];

  const uploadedDocuments: UploadedDocument[] = documentRows.map((document) => ({
    id: document.id,
    name: document.name,
    type: document.file_type ?? "Unknown",
    size: document.file_size ?? 0,
    storagePath: document.storage_path,
    extractionStatus: document.extraction_status,
  }));

  const reviewResult: AIReviewResult | null = latestReview
    ? toReviewResult(latestReview)
    : null;

  return {
    project: projectRow,
    documents: uploadedDocuments,
    latestReview,
    reviewResult,
  };
}

export async function getDemoProjectWorkspaceData() {
  const project = (await getOrCreateDemoProject()) as ProjectRow;
  return getProjectWorkspaceData(project.id);
}