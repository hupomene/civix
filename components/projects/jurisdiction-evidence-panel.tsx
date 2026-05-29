"use client";

import type { RetrievedJurisdictionChunk } from "@/types/ai-review";
import { Building2, ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";

type JurisdictionEvidencePanelProps = {
  chunks: RetrievedJurisdictionChunk[];
};

function truncateText(text: string, maxLength = 420) {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trim()}...`;
}

export function JurisdictionEvidencePanel({
  chunks,
}: JurisdictionEvidencePanelProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="flex w-full items-start justify-between gap-4 text-left"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50">
            <Building2 className="h-5 w-5 text-blue-600" />
          </div>

          <div>
            <h2 className="text-lg font-semibold tracking-tight">
              Jurisdiction Evidence
            </h2>
            <p className="text-sm text-slate-500">
              County/city checklist, rule, and revision context retrieved for
              this review.
            </p>
          </div>
        </div>

        <div className="mt-1 flex items-center gap-2 text-sm text-slate-500">
          <span>{chunks.length} chunks</span>
          {isOpen ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </div>
      </button>

      {isOpen && (
        <div className="mt-6 space-y-3">
          {chunks.length === 0 && (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
              No jurisdiction evidence was retrieved for the current review.
            </div>
          )}

          {chunks.map((chunk) => (
            <div
              key={chunk.id}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {chunk.jurisdictionName}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {chunk.documentName}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full bg-blue-100 px-2.5 py-1 font-semibold text-blue-700">
                    {chunk.documentType}
                  </span>
                  <span className="rounded-full bg-slate-200 px-2.5 py-1 font-semibold text-slate-700">
                    Chunk #{chunk.chunkIndex}
                  </span>
                  <span className="rounded-full bg-emerald-100 px-2.5 py-1 font-semibold text-emerald-700">
                    Score {chunk.relevanceScore}
                  </span>
                </div>
              </div>

              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                {truncateText(chunk.content)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}