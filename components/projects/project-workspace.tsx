"use client";

import { useEffect, useState } from "react";
import { AIReviewPanel } from "@/components/projects/ai-review-panel";
import { ComplianceChecklist } from "@/components/projects/compliance-checklist";
import { DesignChangeForm } from "@/components/projects/design-change-form";
import { DocumentUploadPanel } from "@/components/projects/document-upload-panel";
import { ReviewReportPanel } from "@/components/projects/review-report-panel";
import { RetrievedChunksPanel } from "@/components/projects/retrieved-chunks-panel";
import { ReviewHistoryPanel } from "@/components/projects/review-history-panel";
import { JurisdictionEvidencePanel } from "@/components/projects/jurisdiction-evidence-panel";
import { JurisdictionDocumentsPanel } from "@/components/projects/jurisdiction-documents-panel";
import type {
  AIReviewHistoryItem,
  AIReviewHistoryResponse,
  AIReviewResult,
  AnalyzeDesignChangeResponse,
  ProjectWorkspaceResponse,
  RetrievedDocumentChunk,
  RetrievedJurisdictionChunk,
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

type JurisdictionListItem = {
  id: string;
  name: string;
  state: string;
  county: string | null;
  city: string | null;
  jurisdiction_type: string;
};

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

const emptyReview: AIReviewResult = {
  impactSummary:
    "No AI review has been generated for this project yet. Upload project documents, describe a design change, and run AI Impact Analysis.",
  affectedDocuments: [],
  risks: [
    {
      title: "No design change has been analyzed yet.",
      level: "Low",
    },
  ],
  checklist: [
    "Upload permit package or project documents.",
    "Describe the proposed design change.",
    "Run AI Impact Analysis to generate review results.",
  ],
};

type ProjectWorkspaceProps = {
  projectId: string;
};

export function ProjectWorkspace({ projectId }: ProjectWorkspaceProps) {
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [designChange, setDesignChange] = useState("");
  const [reviewResult, setReviewResult] = useState<AIReviewResult>(emptyReview);

  const [projectName, setProjectName] = useState("Loading project...");
  const [projectLocation, setProjectLocation] = useState("Loading location...");
  const [projectType, setProjectType] = useState("Construction Project");
  const [selectedJurisdictionId, setSelectedJurisdictionId] = useState<
    string | null
  >(null);

  const [selectedJurisdictionName, setSelectedJurisdictionName] = useState<
  string | null
  >(null);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastAnalyzedChange, setLastAnalyzedChange] = useState(designChange);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [savedReviewId, setSavedReviewId] = useState<string | null>(null);
  const [modelUsed, setModelUsed] = useState<string | null>(null);
  const [retrievedChunks, setRetrievedChunks] = useState<
    RetrievedDocumentChunk[]
  >([]);
  const [jurisdictionChunks, setJurisdictionChunks] = useState<
    RetrievedJurisdictionChunk[]
  >([]);

  const [isDeveloperMode, setIsDeveloperMode] = useState(false);
  const [showDeveloperEvidence, setShowDeveloperEvidence] = useState(false);

  const [reviewHistory, setReviewHistory] = useState<AIReviewHistoryItem[]>([]);
  const [isLoadingReviewHistory, setIsLoadingReviewHistory] = useState(false);
  const [deletingReviewId, setDeletingReviewId] = useState<string | null>(null);
  const [isLoadingWorkspace, setIsLoadingWorkspace] = useState(true);
  const [workspaceLoadedFromDb, setWorkspaceLoadedFromDb] = useState(false);
  const [isUploadingDocuments, setIsUploadingDocuments] = useState(false);
  const [deletingDocumentId, setDeletingDocumentId] = useState<string | null>(
    null
  );

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const devMode =
      params.get("dev") === "1" || params.get("debug") === "1";

    setIsDeveloperMode(devMode);
  }, []);
  
  function safeArray<T>(value: unknown): T[] {
    return Array.isArray(value) ? (value as T[]) : [];
  }

  function findMatchingJurisdiction(
    projectLocation: string,
    jurisdictions: JurisdictionListItem[]
  ) {
    const normalizedLocation = projectLocation.toLowerCase();

    return (
      jurisdictions.find((jurisdiction) =>
        normalizedLocation.includes(jurisdiction.name.toLowerCase())
      ) ??
      jurisdictions.find(
        (jurisdiction) =>
          jurisdiction.county &&
          normalizedLocation.includes(jurisdiction.county.toLowerCase())
      ) ??
      jurisdictions.find(
        (jurisdiction) =>
          jurisdiction.city &&
          normalizedLocation.includes(jurisdiction.city.toLowerCase())
      ) ??
      null
    );
  }

  function convertReviewHistoryItemToResult(
    review: AIReviewHistoryItem
  ): AIReviewResult {
    return {
      impactSummary: review.impact_summary,
      affectedDocuments: safeArray<string>(review.affected_documents),
      risks: safeArray<AIReviewResult["risks"][number]>(review.risks),
      checklist: safeArray<string>(review.checklist),
      evidenceNotes: safeArray<string>(review.evidence_notes),
    };
  }

  async function saveProjectJurisdiction(jurisdictionId: string | null) {
    try {
      const response = await fetch("/api/projects/jurisdiction", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectId,
          jurisdictionId,
        }),
      });

      const data = (await response.json()) as {
        ok: boolean;
        error?: string;
      };

      if (!response.ok || !data.ok) {
        throw new Error(data.error ?? "Failed to save project jurisdiction.");
      }
    } catch (error) {
      console.error("Failed to save matched jurisdiction:", error);
    }
  }

  async function loadProjectJurisdiction(
    location: string,
    existingJurisdictionId?: string | null
  ) {
    try {
      const response = await fetch("/api/jurisdictions");

      const data = (await response.json()) as {
        ok: boolean;
        jurisdictions?: JurisdictionListItem[];
        error?: string;
      };

      if (!response.ok || !data.ok) {
        throw new Error(data.error ?? "Failed to load jurisdictions.");
      }

      const jurisdictions = data.jurisdictions ?? [];

      const existingJurisdiction =
        existingJurisdictionId
          ? jurisdictions.find(
              (jurisdiction) => jurisdiction.id === existingJurisdictionId
            ) ?? null
          : null;

      if (existingJurisdiction) {
        setSelectedJurisdictionId(existingJurisdiction.id);
        setSelectedJurisdictionName(existingJurisdiction.name);
        return;
      }

      const matchedJurisdiction = findMatchingJurisdiction(
        location,
        jurisdictions
      );

      const matchedJurisdictionId = matchedJurisdiction?.id ?? null;

      setSelectedJurisdictionId(matchedJurisdictionId);
      setSelectedJurisdictionName(matchedJurisdiction?.name ?? null);

      await saveProjectJurisdiction(matchedJurisdictionId);
    } catch (error) {
      console.error("Failed to load project jurisdiction:", error);
      setSelectedJurisdictionId(null);
      setSelectedJurisdictionName(null);
    }
  }

  async function loadReviewHistory() {
    try {
      setIsLoadingReviewHistory(true);

      const response = await fetch(`/api/projects/${projectId}/reviews`);

      const data = (await response.json()) as AIReviewHistoryResponse;

      if (!response.ok || !data.ok) {
        throw new Error(data.error ?? "Failed to load review history.");
      }

      setReviewHistory(data.reviews ?? []);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingReviewHistory(false);
    }
  }

  useEffect(() => {
    async function loadWorkspace() {
      try {
        setIsLoadingWorkspace(true);

        const response = await fetch(`/api/projects/${projectId}/workspace`);

        if (!response.ok) {
          throw new Error("Failed to load workspace from Supabase.");
        }

        const data = (await response.json()) as ProjectWorkspaceResponse;

        if (!data.ok || !data.workspace) {
          throw new Error(data.error ?? "Workspace response was invalid.");
        }

        setProjectName(data.workspace.project.name);
        setProjectLocation(data.workspace.project.location ?? "No location provided");
        setProjectType(data.workspace.project.project_type ?? "Construction Project");
        await loadProjectJurisdiction(
          data.workspace.project.location ?? "",
          data.workspace.project.jurisdiction_id ?? null
        );

        setDocuments(data.workspace.documents);

        if (data.workspace.reviewResult && data.workspace.latestReview) {
          setReviewResult(data.workspace.reviewResult);
          setDesignChange(data.workspace.latestReview.design_change);
          setLastAnalyzedChange(data.workspace.latestReview.design_change);
          setSavedReviewId(data.workspace.latestReview.id);
          setModelUsed(data.workspace.latestReview.model_used);
        } else {
          setReviewResult(emptyReview);
          setDesignChange("");
          setLastAnalyzedChange("No design change analyzed yet.");
          setSavedReviewId(null);
          setModelUsed(null);
          setRetrievedChunks([]);
        }

        setWorkspaceLoadedFromDb(true);
        await loadReviewHistory();
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
  }, [projectId]);
  async function handleAddDocuments(files: FileList | null) {
    if (!files || files.length === 0) return;

    try {
      setIsUploadingDocuments(true);
      setAnalysisError(null);

      const formData = new FormData();
      formData.append("projectId", projectId);

      Array.from(files).forEach((file) => {
        formData.append("files", file);
      });

      const response = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData,
      });

      const contentType = response.headers.get("content-type") ?? "";

      if (!contentType.includes("application/json")) {
        const text = await response.text();
        console.error("Upload API returned non-JSON response:", text);

        throw new Error(
          "Upload API returned an HTML error page. Check the terminal for the real server error."
        );
      }

      const data = (await response.json()) as {
        ok: boolean;
        documents?: UploadedDocument[];
        error?: string;
      };

      if (!response.ok || !data.ok) {
        throw new Error(data.error ?? "Failed to upload documents.");
      }

      setDocuments((current) => [...(data.documents ?? []), ...current]);
    } catch (error) {
      setAnalysisError(
        error instanceof Error ? error.message : "Failed to upload documents."
      );
    } finally {
      setIsUploadingDocuments(false);
    }
  }

  async function handleRemoveDocument(documentId: string) {
    try {
      setDeletingDocumentId(documentId);
      setAnalysisError(null);

      const response = await fetch("/api/documents/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ documentId }),
      });

      const data = (await response.json()) as {
        ok: boolean;
        deletedDocumentId?: string;
        error?: string;
      };

      if (!response.ok || !data.ok) {
        throw new Error(data.error ?? "Failed to delete document.");
      }

      setDocuments((current) =>
        current.filter((document) => document.id !== documentId)
      );
    } catch (error) {
      setAnalysisError(
        error instanceof Error ? error.message : "Failed to delete document."
      );
    } finally {
      setDeletingDocumentId(null);
    }
  }

  function handleLoadReviewFromHistory(review: AIReviewHistoryItem) {
    const selectedResult = convertReviewHistoryItemToResult(review);

    const savedPermitChunks = safeArray<RetrievedDocumentChunk>(
      review.retrieved_permit_chunks
    );

    const savedJurisdictionChunks = safeArray<RetrievedJurisdictionChunk>(
      review.retrieved_jurisdiction_chunks
    );

    setReviewResult(selectedResult);
    setDesignChange(review.design_change);
    setLastAnalyzedChange(review.design_change);
    setSavedReviewId(review.id);
    setModelUsed(review.model_used);
    setRetrievedChunks(savedPermitChunks);
    setJurisdictionChunks(savedJurisdictionChunks);
  }

  async function handleDeleteReviewFromHistory(reviewId: string) {
    const confirmed = window.confirm(
      "Delete this AI review record? This will not delete uploaded documents or the project."
    );

    if (!confirmed) return;

    try {
      setDeletingReviewId(reviewId);
      setAnalysisError(null);

      const response = await fetch("/api/reviews/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reviewId }),
      });

      const data = (await response.json()) as {
        ok: boolean;
        deletedReviewId?: string;
        error?: string;
      };

      if (!response.ok || !data.ok) {
        throw new Error(data.error ?? "Failed to delete review.");
      }

      const remainingReviews = reviewHistory.filter(
        (review) => review.id !== reviewId
      );

      setReviewHistory(remainingReviews);

      if (savedReviewId === reviewId) {
        const nextReview = remainingReviews[0];

        if (nextReview) {
          handleLoadReviewFromHistory(nextReview);
        } else {
          setReviewResult(emptyReview);
          setDesignChange("");
          setLastAnalyzedChange("No design change analyzed yet.");
          setSavedReviewId(null);
          setModelUsed(null);
          setRetrievedChunks([]);
        }
      }
    } catch (error) {
      setAnalysisError(
        error instanceof Error ? error.message : "Failed to delete review."
      );
    } finally {
      setDeletingReviewId(null);
    }
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
          projectId,
          projectName,
          projectLocation,
          projectType,
          designChange,
          documents,
        }),
      });

      const data = (await response.json()) as AnalyzeDesignChangeResponse;

      if (!response.ok || !data.result) {
        throw new Error(data.error ?? "Failed to analyze design change.");
      }

      setReviewResult(data.result);
      setLastAnalyzedChange(designChange);
      setSavedReviewId(data.savedReviewId ?? null);
      setModelUsed(data.modelUsed ?? null);
      setRetrievedChunks(data.retrievedChunks ?? []);
      setJurisdictionChunks(data.jurisdictionChunks ?? []);
      await loadReviewHistory();
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
    <div className="max-w-full space-y-6 overflow-x-hidden">
      <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex min-w-0 flex-col justify-between gap-4 lg:flex-row lg:items-start">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50">
                <Building2 className="h-6 w-6 text-blue-600" />
              </div>

              <div>
                <h2 className="break-words text-2xl font-semibold leading-tight tracking-tight">
                  {projectName}
                </h2>

                <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" />
                    {projectLocation}
                  </span>
                  <span>{projectType}</span>
                </div>
              </div>
            </div>


            {analysisError && (
              <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {analysisError}
              </div>
            )}
            
            
          </div>

          <div className="grid w-full min-w-0 grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            <div className="rounded-2xl bg-slate-50 p-3">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                <CalendarDays className="h-4 w-4" />
                Review Date
              </div>
              <p className="mt-2 font-semibold">May 23, 2026</p>
            </div>

            <div className="rounded-2xl bg-blue-50 p-3">
              <div className="flex items-center gap-2 text-xs font-medium text-blue-700">
                <FileText className="h-4 w-4" />
                Documents
              </div>
              <p className="mt-2 font-semibold text-blue-800">
                {documents.length}
              </p>
            </div>

            <div
              className={`rounded-2xl p-3 ${
                selectedJurisdictionName ? "bg-indigo-50" : "bg-slate-50"
              }`}
            >
              <div
                className={`flex items-center gap-2 text-xs font-medium ${
                  selectedJurisdictionName ? "text-indigo-700" : "text-slate-500"
                }`}
              >
                <MapPin className="h-4 w-4" />
                Jurisdiction Pack
              </div>
              <p
                className={`mt-2 text-sm font-semibold leading-snug ${
                  selectedJurisdictionName ? "text-indigo-800" : "text-slate-700"
                }`}
              >
                {selectedJurisdictionName ?? "Not linked"}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {selectedJurisdictionName ? "Linked" : "Use county/state location"}
              </p>
            </div>

            <div
              className={`rounded-2xl p-3 ${
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

            <div className="rounded-2xl bg-emerald-50 p-3">
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

      <section className="grid min-w-0 gap-5">
        <div className="min-w-0 space-y-5">
          <DocumentUploadPanel
            documents={documents}
            onAddDocuments={handleAddDocuments}
            onRemoveDocument={handleRemoveDocument}
            isUploading={isUploadingDocuments}
            deletingDocumentId={deletingDocumentId}
          />
          {!selectedJurisdictionId && (
            <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800 shadow-sm">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
                <div>
                  <p className="font-semibold text-amber-900">
                    No Jurisdiction Pack Linked
                  </p>
                  <p className="mt-1 leading-6">
                    CIVIX can still analyze uploaded permit package documents for this
                    project, but county/city code evidence will not be included until a
                    jurisdiction pack is linked.
                  </p>
                  <p className="mt-2 text-xs font-medium text-amber-700">
                    Tip: Use a county/state location such as “Collin County, TX,” or
                    upload a jurisdiction pack for this county.
                  </p>
                </div>
              </div>
            </div>
          )}
          <DesignChangeForm
            value={designChange}
            onChange={setDesignChange}
            onRunAnalysis={handleRunAnalysis}
            isAnalyzing={isAnalyzing}
          />
        </div>

        <div className="min-w-0 space-y-5">
          <AIReviewPanel
            result={reviewResult}
            isAnalyzing={isAnalyzing}
            lastAnalyzedChange={lastAnalyzedChange}
          />

          <ComplianceChecklist checklist={reviewResult.checklist} />

          {isDeveloperMode && (
            <div className="rounded-3xl border border-slate-200 bg-white p-5 text-sm shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-slate-900">
                    Developer Evidence View
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Retrieved permit and jurisdiction chunks are hidden from regular demo
                    users. Use this section only for internal validation.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowDeveloperEvidence((current) => !current)}
                  className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  {showDeveloperEvidence ? "Hide Evidence" : "Show Evidence"}
                </button>
              </div>

              {showDeveloperEvidence && (
                <div className="mt-5 space-y-5">
                  <RetrievedChunksPanel chunks={retrievedChunks} />
                  <JurisdictionEvidencePanel chunks={jurisdictionChunks} />
                </div>
              )}
            </div>
          )}

          <div className="rounded-3xl border border-indigo-100 bg-indigo-50 p-5 text-sm shadow-sm">
            <p className="font-semibold text-indigo-900">
              Matched Jurisdiction Pack
            </p>
            <p className="mt-1 text-indigo-700">
              {selectedJurisdictionName ?? "No matching jurisdiction pack found"}
            </p>
          </div>

          {selectedJurisdictionId ? (
            <JurisdictionDocumentsPanel
              jurisdictionId={selectedJurisdictionId}
            />
          ) : (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
              No matching jurisdiction pack was found for this project location.
            </div>
          )}

          <ReviewHistoryPanel
            reviews={reviewHistory}
            isLoading={isLoadingReviewHistory}
            activeReviewId={savedReviewId}
            deletingReviewId={deletingReviewId}
            onLoadReview={handleLoadReviewFromHistory}
            onDeleteReview={handleDeleteReviewFromHistory}
          />
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">
              Review Output
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
              Report-ready AI review package
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
              Convert the current AI review into a copyable, downloadable, and
              printable coordination report for project teams.
            </p>
          </div>
        </div>

        <ReviewReportPanel
          projectName={projectName}
          projectLocation={projectLocation}
          projectType={projectType}
          designChange={lastAnalyzedChange}
          documents={documents}
          result={reviewResult}
          retrievedChunks={
            isDeveloperMode && showDeveloperEvidence ? retrievedChunks : []
          }
          jurisdictionChunks={
            isDeveloperMode && showDeveloperEvidence ? jurisdictionChunks : []
          }
        />
      </section>
    </div>

  );
}