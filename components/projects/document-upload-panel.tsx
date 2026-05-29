import type { UploadedDocument } from "@/types/ai-review";
import {
  ExternalLink,
  FileCheck2,
  FileText,
  Trash2,
  UploadCloud,
} from "lucide-react";

type DocumentUploadPanelProps = {
  documents: UploadedDocument[];
  onAddDocuments: (files: FileList | null) => void;
  onRemoveDocument: (documentId: string) => void;
  isUploading?: boolean;
  deletingDocumentId?: string | null;
};

function formatFileSize(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function formatFileType(type: string) {
  if (!type || type === "Unknown") return "Unknown";
  if (type.includes("pdf")) return "PDF";
  if (type.includes("word")) return "DOCX";
  if (type.includes("image")) return "Image";
  return type;
}

export function DocumentUploadPanel({
  documents,
  onAddDocuments,
  onRemoveDocument,
  isUploading = false,
  deletingDocumentId = null,
}: DocumentUploadPanelProps) {
  async function handleOpenDocument(documentId: string) {
    try {
      const response = await fetch("/api/documents/download", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ documentId }),
      });

      const data = (await response.json()) as {
        ok: boolean;
        signedUrl?: string;
        documentName?: string;
        error?: string;
      };

      if (!response.ok || !data.ok || !data.signedUrl) {
        throw new Error(data.error ?? "Failed to open document.");
      }

      window.open(data.signedUrl, "_blank", "noopener,noreferrer");
    } catch (error) {
      console.error(error);
      window.alert(
        error instanceof Error ? error.message : "Failed to open document."
      );
    }
  }
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50">
          <UploadCloud className="h-5 w-5 text-blue-600" />
        </div>

        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            Permit Package Upload
          </h2>
          <p className="text-sm text-slate-500">
            Upload the current permit package, drawings, and review files.
          </p>
        </div>
      </div>

      <label className="mt-6 block cursor-pointer rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50 p-8 text-center transition hover:border-blue-300 hover:bg-blue-50/40">
        <input
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
          className="hidden"
          disabled={isUploading}
          onChange={(event) => {
            onAddDocuments(event.target.files);
            event.target.value = "";
          }}
        />

        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm">
          <UploadCloud className="h-6 w-6 text-blue-600" />
        </div>

        <h3 className="mt-4 font-semibold">Click to select permit files</h3>
        <p className="mt-2 text-sm text-slate-500">
          PDF, DOCX, PNG, JPG supported for MVP testing.
        </p>

        <div className="mt-5 inline-flex rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
          {isUploading ? "Uploading..." : "Select Files"}
        </div>
      </label>

      <div className="mt-6 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900">
          Uploaded Documents
        </h3>

        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
          {documents.length} file{documents.length === 1 ? "" : "s"}
        </span>
      </div>

      <div className="mt-4 space-y-3">
        {documents.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">
            No documents uploaded yet. Add a permit package before running a
            final review.
          </div>
        ) : (
          documents.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 p-4"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50">
                  <FileCheck2 className="h-5 w-5 text-emerald-600" />
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {file.name}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {formatFileType(file.type)} · {formatFileSize(file.size)}
                    {file.extractionStatus && (
                      <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                        Text: {file.extractionStatus}
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <FileText className="h-4 w-4 text-slate-400" />

                <button
                  type="button"
                  onClick={() => handleOpenDocument(file.id)}
                  disabled={!file.storagePath}
                  className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-blue-50 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label={`Open ${file.name}`}
                >
                  <ExternalLink className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={() => onRemoveDocument(file.id)}
                  disabled={deletingDocumentId === file.id}
                  className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label={`Remove ${file.name}`}
                >
                  {deletingDocumentId === file.id ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-red-500" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}