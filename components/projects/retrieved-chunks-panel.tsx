"use client";

import { useState } from "react";
import type { RetrievedDocumentChunk } from "@/types/ai-review";
import {
  ChevronDown,
  ChevronRight,
  FileSearch,
  Layers3,
} from "lucide-react";

type RetrievedChunksPanelProps = {
  chunks: RetrievedDocumentChunk[];
};

function getUniqueDocumentCount(chunks: RetrievedDocumentChunk[]) {
  return new Set(chunks.map((chunk) => chunk.documentName)).size;
}

function truncateText(text: string, maxLength = 420) {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trim()}...`;
}

export function RetrievedChunksPanel({ chunks }: RetrievedChunksPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  const documentCount = getUniqueDocumentCount(chunks);
  const topScore =
    chunks.length > 0
      ? Math.max(...chunks.map((chunk) => chunk.relevanceScore))
      : 0;

  if (chunks.length === 0) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-50">
            <FileSearch className="h-5 w-5 text-slate-500" />
          </div>

          <div>
            <h2 className="text-lg font-semibold tracking-tight">
              Retrieved Evidence Chunks
            </h2>
            <p className="text-sm text-slate-500">
              No retrieved chunks yet. Run AI Impact Analysis after uploading a
              PDF document.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="flex w-full items-center justify-between gap-4 p-6 text-left"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50">
            <FileSearch className="h-5 w-5 text-blue-600" />
          </div>

          <div>
            <h2 className="text-lg font-semibold tracking-tight">
              Retrieved Evidence Chunks
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {chunks.length} chunk{chunks.length === 1 ? "" : "s"} retrieved
              from {documentCount} document{documentCount === 1 ? "" : "s"}.
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <span className="hidden rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 sm:inline-flex">
            Top Score {topScore}
          </span>

          <span className="inline-flex items-center rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700">
            {isOpen ? (
              <>
                <ChevronDown className="mr-1.5 h-4 w-4" />
                Hide
              </>
            ) : (
              <>
                <ChevronRight className="mr-1.5 h-4 w-4" />
                Show
              </>
            )}
          </span>
        </div>
      </button>

      {isOpen && (
        <div className="border-t border-slate-200 px-6 pb-6 pt-5">
          <div className="mb-4 flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
            <Layers3 className="mt-0.5 h-5 w-5 shrink-0 text-slate-500" />
            <p className="text-sm leading-6 text-slate-600">
              These chunks were retrieved from the uploaded permit package and
              used as RAG context for the current AI review. They help explain
              why CIVIX identified the affected documents, risks, checklist
              items, and evidence notes.
            </p>
          </div>

          <div className="space-y-4">
            {chunks.map((chunk, index) => (
              <div
                key={`${chunk.documentName}-${chunk.chunkIndex}-${index}`}
                className="rounded-2xl border border-slate-200 p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {chunk.documentName}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Chunk #{chunk.chunkIndex}
                    </p>
                  </div>

                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                    Score {chunk.relevanceScore}
                  </span>
                </div>

                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {truncateText(chunk.contentPreview)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}