export type RiskLevel = "Low" | "Medium" | "High";

export type UploadedDocument = {
  id: string;
  name: string;
  type: string;
  size: number;
  storagePath?: string | null;
  extractionStatus?: string | null;
};

export type AIReviewRisk = {
  title: string;
  level: RiskLevel;
};

export type AIReviewResult = {
  impactSummary: string;
  affectedDocuments: string[];
  risks: AIReviewRisk[];
  checklist: string[];
  evidenceNotes?: string[];
};

export type AnalyzeDesignChangeRequest = {
  projectId?: string;
  projectName: string;
  projectLocation: string;
  projectType: string;
  designChange: string;
  documents: UploadedDocument[];
  documentContext?: string;
};

export type AnalyzeDesignChangeResponse = {
  ok: boolean;
  result?: AIReviewResult;
  savedReviewId?: string;
  savedProjectId?: string;
  modelUsed?: string;
  retrievedChunks?: RetrievedDocumentChunk[];
  jurisdictionChunks?: RetrievedJurisdictionChunk[];
  error?: string;
};

export type ProjectWorkspaceResponse = {
  ok: boolean;
  workspace?: {
    project: {
      id: string;
      user_id: string | null;
      name: string;
      location: string | null;
      project_type: string | null;
      jurisdiction_id: string | null;
      status: string;
      risk_level: string;
      created_at: string;
      updated_at: string;
    };
    documents: UploadedDocument[];
    latestReview: {
      id: string;
      project_id: string;
      design_change: string;
      impact_summary: string;
      affected_documents: Json;
      risks: Json;
      checklist: Json;
      model_used: string | null;
      created_at: string;
    } | null;
    reviewResult: AIReviewResult | null;
  };
  error?: string;
};

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type RetrievedDocumentChunk = {
  documentName: string;
  chunkIndex: number;
  relevanceScore: number;
  contentPreview: string;
};

export type AIReviewHistoryItem = {
  id: string;
  project_id: string;
  design_change: string;
  impact_summary: string;
  affected_documents: Json;
  risks: Json;
  checklist: Json;
  evidence_notes?: Json;
  model_used: string | null;
  retrieved_permit_chunks?: Json;
  retrieved_jurisdiction_chunks?: Json;
  created_at: string;
};

export type AIReviewHistoryResponse = {
  ok: boolean;
  reviews?: AIReviewHistoryItem[];
  error?: string;
};

export type Jurisdiction = {
  id: string;
  name: string;
  state: string;
  county: string | null;
  city: string | null;
  jurisdiction_type: string;
  description: string | null;
  source_url: string | null;
  is_active: boolean;
  created_at: string;
};

export type JurisdictionDocument = {
  id: string;
  jurisdiction_id: string;
  name: string;
  document_type: string;
  source_type: string;
  source_url: string | null;
  storage_path: string | null;
  mime_type: string | null;
  size_bytes: number | null;
  extracted_text: string | null;
  extracted_text_preview: string | null;
  extraction_status: string;
  extracted_at: string | null;
  created_at: string;
};

export type JurisdictionChunk = {
  id: string;
  jurisdiction_document_id: string;
  jurisdiction_id: string;
  chunk_index: number;
  content: string;
  token_estimate: number | null;
  document_type: string;
  created_at: string;
};

export type JurisdictionDocumentType =
  | "permit_checklist"
  | "revision_resubmittal"
  | "adopted_code"
  | "local_amendment"
  | "fire_marshal"
  | "accessibility"
  | "energy_code"
  | "portal_instruction"
  | "other";

export type RetrievedJurisdictionChunk = {
  id: string;
  jurisdictionId: string;
  jurisdictionName: string;
  jurisdictionDocumentId: string;
  documentName: string;
  documentType: string;
  chunkIndex: number;
  content: string;
  relevanceScore: number;
};