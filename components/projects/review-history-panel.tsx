"use client";

import type {
  AIReviewHistoryItem,
  AIReviewResult,
  RetrievedJurisdictionChunk,
} from "@/types/ai-review";

import { Clock3, History, Loader2, RotateCcw, Trash2 } from "lucide-react";

type ReviewHistoryPanelProps = {
  reviews: AIReviewHistoryItem[];
  isLoading: boolean;
  activeReviewId: string | null;
  deletingReviewId?: string | null;
  onLoadReview: (review: AIReviewHistoryItem) => void;
  onDeleteReview: (reviewId: string) => void;
};

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function safeArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function getRiskCount(review: AIReviewHistoryItem) {
  return safeArray<AIReviewResult["risks"][number]>(review.risks).length;
}

function getHighestRisk(review: AIReviewHistoryItem) {
  const risks = safeArray<AIReviewResult["risks"][number]>(review.risks);

  if (risks.some((risk) => risk.level === "High")) return "High";
  if (risks.some((risk) => risk.level === "Medium")) return "Medium";
  return "Low";
}

function getJurisdictionPackName(review: AIReviewHistoryItem) {
  const jurisdictionChunks = safeArray<RetrievedJurisdictionChunk>(
    review.retrieved_jurisdiction_chunks
  );

  return jurisdictionChunks[0]?.jurisdictionName ?? null;
}

function truncateText(text: string, maxLength = 110) {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trim()}...`;
}

export function ReviewHistoryPanel({
  reviews,
  isLoading,
  activeReviewId,
  deletingReviewId = null,
  onLoadReview,
  onDeleteReview,
}: ReviewHistoryPanelProps) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-50">
            <History className="h-5 w-5 text-violet-600" />
          </div>

          <div>
            <h2 className="text-lg font-semibold tracking-tight">
              AI Review History
            </h2>
            <p className="text-sm text-slate-500">
              Previously saved AI reviews for this project.
            </p>
          </div>
        </div>

        {isLoading && <Loader2 className="h-5 w-5 animate-spin text-slate-400" />}
      </div>

      <div className="mt-6 space-y-3">
        {!isLoading && reviews.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
            No AI review history yet. Run AI Impact Analysis to save the first
            review.
          </div>
        )}

        {reviews.map((review, index) => {
          const highestRisk = getHighestRisk(review);
          const riskCount = getRiskCount(review);
          const jurisdictionPackName = getJurisdictionPackName(review);
          const isActive = activeReviewId === review.id;
          const isLatest = index === 0;
          const isDeleting = deletingReviewId === review.id;

          return (
            <div
              key={review.id}
              className={`rounded-2xl border p-4 transition-all duration-200 ${
                isActive
                  ? "border-violet-300 bg-violet-50 shadow-sm"
                  : "border-slate-200 bg-white hover:-translate-y-0.5 hover:border-violet-200 hover:bg-violet-50/40 hover:shadow-md"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900">
                    {truncateText(review.design_change)}
                  </p>

                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1">
                      <Clock3 className="h-3.5 w-3.5" />
                      {formatDateTime(review.created_at)}
                    </span>

                    <span>·</span>

                    <span>{review.model_used ?? "unknown model"}</span>

                    <span>·</span>

                    <span>{riskCount} risk item{riskCount === 1 ? "" : "s"}</span>
                  </div>

                  <div className="mt-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                        jurisdictionPackName
                          ? "bg-indigo-50 text-indigo-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {jurisdictionPackName
                        ? `Jurisdiction Pack Used: ${jurisdictionPackName}`
                        : "Permit Package Only"}
                    </span>
                  </div>
                </div>

                <div className="flex shrink-0 flex-col items-end gap-2">
                 <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      highestRisk === "High"
                        ? "bg-red-50 text-red-700"
                        : highestRisk === "Medium"
                        ? "bg-amber-50 text-amber-700"
                        : "bg-emerald-50 text-emerald-700"
                    }`}
                 >
                    {highestRisk}
                 </span>

                 <div className="flex flex-wrap justify-end gap-1.5">
                   {isLatest && (
                     <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-blue-700">
                        Latest
                     </span>
                   )}

                   {isActive && (
                     <span className="rounded-full bg-violet-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-violet-700">
                        Loaded
                     </span>
                   )}
                 </div>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                    type="button"
                    onClick={() => onLoadReview(review)}
                    className={`inline-flex items-center rounded-xl border px-3 py-2 text-xs font-semibold transition-all duration-200 ${
                    isActive
                        ? "border-violet-200 bg-violet-600 text-white shadow-sm"
                        : "border-slate-200 bg-white text-slate-700 hover:-translate-y-0.5 hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700 hover:shadow-md active:translate-y-0"
                    }`}
                >
                    <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                    {isActive ? "Currently Loaded" : "Load Review"}
                </button>

                <button
                    type="button"
                    disabled={isDeleting}
                    onClick={() => onDeleteReview(review.id)}
                    className="inline-flex items-center rounded-xl border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 transition-all duration-200 hover:-translate-y-0.5 hover:bg-red-50 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {isDeleting ? (
                        <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    ) : (
                        <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                    )}
                    Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}