export type RiskLevel = "Low" | "Medium" | "High";

export type UploadedDocument = {
  id: string;
  name: string;
  type: string;
  size: number;
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
};

export type AnalyzeDesignChangeRequest = {
  projectName: string;
  projectLocation: string;
  projectType: string;
  designChange: string;
  documents: UploadedDocument[];
};

export type AnalyzeDesignChangeResponse = {
  result: AIReviewResult;
  savedReviewId?: string;
  savedProjectId?: string;
  modelUsed?: string;
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