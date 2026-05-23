import type { AIReviewResult } from "@/types/ai-review";
import {
  AlertTriangle,
  BadgeCheck,
  CheckCircle2,
  FileSearch,
  Loader2,
  ShieldAlert,
  Sparkles,
} from "lucide-react";

type AIReviewPanelProps = {
  result: AIReviewResult;
  isAnalyzing: boolean;
  lastAnalyzedChange: string;
};

export function AIReviewPanel({
  result,
  isAnalyzing,
  lastAnalyzedChange,
}: AIReviewPanelProps) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-50">
            {isAnalyzing ? (
              <Loader2 className="h-5 w-5 animate-spin text-violet-600" />
            ) : (
              <Sparkles className="h-5 w-5 text-violet-600" />
            )}
          </div>

          <div>
            <h2 className="text-lg font-semibold tracking-tight">
              AI Impact Analysis
            </h2>
            <p className="text-sm text-slate-500">
              AI-generated design change impact review.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
            <BadgeCheck className="h-3.5 w-3.5" />
            AI-generated draft
          </span>

          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
            <ShieldAlert className="h-3.5 w-3.5" />
            Needs professional validation
          </span>
        </div>
      </div>

      <div className="mt-6 rounded-2xl bg-slate-50 p-5">
        <h3 className="font-semibold text-slate-950">Impact Summary</h3>

        {isAnalyzing ? (
          <div className="mt-3 space-y-3">
            <div className="h-4 w-full animate-pulse rounded-full bg-slate-200" />
            <div className="h-4 w-5/6 animate-pulse rounded-full bg-slate-200" />
            <div className="h-4 w-2/3 animate-pulse rounded-full bg-slate-200" />
          </div>
        ) : (
          <p className="mt-3 text-sm leading-7 text-slate-600">
            {result.impactSummary}
          </p>
        )}

        {!isAnalyzing && (
          <div className="mt-4 rounded-xl border border-slate-200 bg-white p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
              Last analyzed design change
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {lastAnalyzedChange}
            </p>
          </div>
        )}
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <div>
          <div className="mb-3 flex items-center gap-2">
            <FileSearch className="h-4 w-4 text-blue-600" />
            <h3 className="font-semibold">Affected Documents</h3>
          </div>

          <div className="space-y-2">
            {result.affectedDocuments.map((doc) => (
              <div
                key={doc}
                className="flex items-center gap-3 rounded-2xl border border-slate-200 p-3 text-sm"
              >
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                <span>{doc}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-3 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <h3 className="font-semibold">Detected Risks</h3>
          </div>

          <div className="space-y-2">
            {result.risks.map((risk) => (
              <div
                key={risk.title}
                className="rounded-2xl border border-slate-200 p-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-medium text-slate-800">
                    {risk.title}
                  </p>

                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                      risk.level === "High"
                        ? "bg-red-50 text-red-700"
                        : risk.level === "Medium"
                        ? "bg-amber-50 text-amber-700"
                        : "bg-emerald-50 text-emerald-700"
                    }`}
                  >
                    {risk.level}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}