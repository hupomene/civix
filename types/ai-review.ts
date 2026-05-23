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
};