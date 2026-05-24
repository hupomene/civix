"use client";

import { useEffect, useState } from "react";
import { AIReviewPanel } from "@/components/projects/ai-review-panel";
import { ComplianceChecklist } from "@/components/projects/compliance-checklist";
import { DesignChangeForm } from "@/components/projects/design-change-form";
import { DocumentUploadPanel } from "@/components/projects/document-upload-panel";
import { ReviewReportPanel } from "@/components/projects/review-report-panel";
import type {
  AIReviewResult,
  AnalyzeDesignChangeResponse,
  ProjectWorkspaceResponse,
  UploadedDocument,
} from "@/types/ai-review";
import {
  AlertTriangle,
  Building2,
  CalendarDays,
  ClipboardCheck,
  FileText,
  MapPin,
} from "lucide-react";

const initialDocuments: UploadedDocument[] = [
  {
    id: "permit-package-current",
    name: "Permit_Package_Current.pdf",
    type: "application/pdf",
    size: 18400000,
  },
  {
    id: "architectural-drawings",
    name: "Architectural_Drawings_A-Series.pdf",
    type: "application/pdf",
    size: 9200000,
  },
  {
    id: "mep-review-set",
    name: "MEP_Review_Set.pdf",
    type: "application/pdf",
    size: 7800000,
  },
];

const initialReview: AIReviewResult = {
  impactSummary:
    "The proposed restroom relocation, wall adjustment, and exterior door addition may affect architectural, plumbing, accessibility, and permit narrative documents. CIVIX recommends reviewing ADA clearance, fixture schedules, egress impact, and city resubmission requirements before proceeding.",
  affectedDocuments: [
    "Architectural Floor Plan A-101",
    "Plumbing Plan P-101",
    "Accessibility Details A-501",
    "Fixture Schedule P-601",
    "Permit Application Narrative",
  ],
  risks: [
    {
      title: "ADA restroom clearance needs verification",
      level: "Medium",
    },
    {
      title: "Plumbing fixture schedule may require update",
      level: "Medium",
    },
    {
      title: "Exterior door may affect egress review",
      level: "High",
    },
  ],
  checklist: [
    "Update architectural floor plan A-101 to reflect restroom relocation.",
    "Update plumbing plan P-101 for new fixture locations.",
    "Verify ADA restroom turning radius and door clearance.",
    "Review new exterior door for egress and accessibility impact.",
    "Update fixture schedule and project narrative.",
    "Confirm whether the city requires permit resubmission.",
    "Route revised package to architect, MEP engineer, and permit consultant.",
  ],
};

export function ProjectWorkspace() {
  const [documents, setDocuments] =
    useState<UploadedDocument[]>(initialDocuments);

  const [designChange, setDesignChange] = useState(
    "We are relocating the restroom, moving two non-load-bearing interior walls, and adding one additional exterior door near the rear service area."
  );

  const [reviewResult, setReviewResult] =
    useState<AIReviewResult>(initialReview);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastAnalyzedChange, setLastAnalyzedChange] = useState(designChange);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [savedReviewId, setSavedReviewId] = useState<string | null>(null);
  const [modelUsed, setModelUsed] = useState<string | null>(null);
  const [isLoadingWorkspace, setIsLoadingWorkspace] = useState(true);
  const [workspaceLoadedFromDb, setWorkspaceLoadedFromDb] = useState(false);

  useEffect(() => {
    async function loadWorkspace() {
      try {
        setIsLoadingWorkspace(true);

        const response = await fetch("/api/projects/demo/workspace");

        if (!response.ok) {
          throw new Error("Failed to load workspace from Supabase.");
        }

        const data = (await response.json()) as ProjectWorkspaceResponse;

        if (!data.ok || !data.workspace) {
          throw new Error(data.error ?? "Workspace response was invalid.");
        }

        if (data.workspace.documents.length > 0) {
          setDocuments(data.workspace.documents);
        }

        if (data.workspace.reviewResult && data.workspace.latestReview) {
          setReviewResult(data.workspace.reviewResult);
          setDesignChange(data.workspace.latestReview.design_change);
          setLastAnalyzedChange(data.workspace.latestReview.design_change);
          setSavedReviewId(data.workspace.latestReview.id);
          setModelUsed(data.workspace.latestReview.model_used);
        }

        setWorkspaceLoadedFromDb(true);
      } catch (error) {
        console.error(error);
        setAnalysisError(
          error instanceof Error
            ? error.message
            : "Failed to load workspace from Supabase."
        );
      } finally {
        setIsLoadingWorkspace(false);
      }
    }

    loadWorkspace();
  }, []);
  function handleAddDocuments(files: FileList | null) {
    if (!files || files.length === 0) return;

    const newDocuments: UploadedDocument[] = Array.from(files).map((file) => ({
      id: `${file.name}-${file.lastModified}-${crypto.randomUUID()}`,
      name: file.name,
      type: file.type || "Unknown",
      size: file.size,
    }));

    setDocuments((current) => [...newDocuments, ...current]);
  }

  function handleRemoveDocument(documentId: string) {
    setDocuments((current) =>
      current.filter((document) => document.id !== documentId)
    );
  }

  async function handleRunAnalysis() {
    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      const response = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectName: "Lake Dallas Retail Renovation",
          projectLocation: "5008 S. Stemmons Freeway, Lake Dallas, TX",
          projectType: "Commercial Renovation",
          designChange,
          documents,
        }),
      });

      if (!response.ok) {
        const errorBody = (await response.json()) as { error?: string };
        throw new Error(errorBody.error ?? "AI analysis request failed.");
      }

      const data = (await response.json()) as AnalyzeDesignChangeResponse;

      setReviewResult(data.result);
      setLastAnalyzedChange(designChange);
      setSavedReviewId(data.savedReviewId ?? null);
      setModelUsed(data.modelUsed ?? null);
    } catch (error) {
      console.error(error);
      setAnalysisError(
        error instanceof Error
          ? error.message
          : "Failed to run AI impact analysis."
      );
    } finally {
      setIsAnalyzing(false);
    }
  }

  const highestRisk = reviewResult.risks.some((risk) => risk.level === "High")
    ? "High"
    : reviewResult.risks.some((risk) => risk.level === "Medium")
    ? "Medium"
    : "Low";

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-start">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50">
                <Building2 className="h-6 w-6 text-blue-600" />
              </div>

              <div>
                <h2 className="text-2xl font-semibold tracking-tight">
                  Lake Dallas Retail Renovation
                </h2>

                <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" />
                    5008 S. Stemmons Freeway, Lake Dallas, TX
                  </span>
                  <span>Commercial Renovation</span>
                </div>
              </div>
            </div>

            <p className="mt-5 max-w-3xl text-sm leading-6 text-slate-600">
              This workspace demonstrates the core CIVIX MVP workflow: upload an
              existing permit package, describe a design change, and generate an
              AI-assisted impact summary with affected documents and compliance
              checklist items.
            </p>

            {analysisError && (
              <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {analysisError}
              </div>
            )}
            {savedReviewId && (
              <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
                AI review saved to Supabase successfully.
                <span className="ml-2 font-mono text-xs text-emerald-700">
                  Review ID: {savedReviewId}
                </span>
                {modelUsed && (
                  <span className="ml-2 rounded-full bg-white px-2 py-1 text-xs font-semibold text-emerald-700">
                    {modelUsed}
                  </span>
                )}
              </div>
            )}
            {workspaceLoadedFromDb && !isLoadingWorkspace && (
              <div className="mt-5 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
                Latest project workspace data loaded from Supabase.
              </div>
            )}
          </div>

          <div className="grid min-w-full gap-3 sm:grid-cols-4 lg:min-w-[560px]">
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                <CalendarDays className="h-4 w-4" />
                Review Date
              </div>
              <p className="mt-2 font-semibold">May 23, 2026</p>
            </div>

            <div className="rounded-2xl bg-blue-50 p-4">
              <div className="flex items-center gap-2 text-xs font-medium text-blue-700">
                <FileText className="h-4 w-4" />
                Documents
              </div>
              <p className="mt-2 font-semibold text-blue-800">
                {documents.length}
              </p>
            </div>

            <div
              className={`rounded-2xl p-4 ${
                highestRisk === "High"
                  ? "bg-red-50"
                  : highestRisk === "Medium"
                  ? "bg-amber-50"
                  : "bg-emerald-50"
              }`}
            >
              <div
                className={`flex items-center gap-2 text-xs font-medium ${
                  highestRisk === "High"
                    ? "text-red-700"
                    : highestRisk === "Medium"
                    ? "text-amber-700"
                    : "text-emerald-700"
                }`}
              >
                <AlertTriangle className="h-4 w-4" />
                Risk Level
              </div>
              <p
                className={`mt-2 font-semibold ${
                  highestRisk === "High"
                    ? "text-red-800"
                    : highestRisk === "Medium"
                    ? "text-amber-800"
                    : "text-emerald-800"
                }`}
              >
                {highestRisk}
              </p>
            </div>

            <div className="rounded-2xl bg-emerald-50 p-4">
              <div className="flex items-center gap-2 text-xs font-medium text-emerald-700">
                <ClipboardCheck className="h-4 w-4" />
                Status
              </div>
              <p className="mt-2 font-semibold text-emerald-800">
                {isLoadingWorkspace
                  ? "Loading"
                  : isAnalyzing
                  ? "Analyzing"
                  : "Review Ready"}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-6">
          <DocumentUploadPanel
            documents={documents}
            onAddDocuments={handleAddDocuments}
            onRemoveDocument={handleRemoveDocument}
          />

          <DesignChangeForm
            value={designChange}
            onChange={setDesignChange}
            onRunAnalysis={handleRunAnalysis}
            isAnalyzing={isAnalyzing}
          />
        </div>

        <div className="space-y-6">
          <AIReviewPanel
            result={reviewResult}
            isAnalyzing={isAnalyzing}
            lastAnalyzedChange={lastAnalyzedChange}
          />

          <ComplianceChecklist checklist={reviewResult.checklist} />
        </div>
      </section>

      <ReviewReportPanel
        projectName="Lake Dallas Retail Renovation"
        projectLocation="5008 S. Stemmons Freeway, Lake Dallas, TX"
        projectType="Commercial Renovation"
        designChange={lastAnalyzedChange}
        documents={documents}
        result={reviewResult}
      />
    </div>
  );
}