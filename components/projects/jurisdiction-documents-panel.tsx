"use client";

import {
  Building2,
  CheckCircle2,
  FileText,
  Loader2,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";

type JurisdictionDocument = {
  id: string;
  jurisdiction_id: string;
  name: string;
  document_type: string;
  source_type: string;
  source_url: string | null;
  storage_path: string | null;
  mime_type: string | null;
  size_bytes: number | null;
  extraction_status: string;
  extracted_at: string | null;
  created_at: string;
};

type Jurisdiction = {
  id: string;
  name: string;
  state: string;
  county: string | null;
  city: string | null;
  jurisdiction_type: string;
};

type JurisdictionDocumentsResponse = {
  ok: boolean;
  jurisdiction?: Jurisdiction;
  documents?: JurisdictionDocument[];
  error?: string;
};

type JurisdictionDocumentsPanelProps = {
  jurisdictionId: string;
};

function formatFileSize(sizeBytes: number | null) {
  if (!sizeBytes) return "Unknown size";

  if (sizeBytes < 1024) {
    return `${sizeBytes} B`;
  }

  if (sizeBytes < 1024 * 1024) {
    return `${(sizeBytes / 1024).toFixed(1)} KB`;
  }

  return `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(value: string | null) {
  if (!value) return "Not available";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function getDocumentTypeLabel(documentType: string) {
  return documentType
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

const DOCUMENT_TYPE_OPTIONS = [
  { value: "permit_checklist", label: "Permit Checklist" },
  { value: "revision_resubmittal", label: "Revision / Resubmittal" },
  { value: "adopted_code", label: "Adopted Code" },
  { value: "local_amendment", label: "Local Amendment" },
  { value: "fire_marshal", label: "Fire Marshal" },
  { value: "accessibility", label: "Accessibility" },
  { value: "energy_code", label: "Energy Code" },
  { value: "portal_instruction", label: "Portal Instruction" },
  { value: "other", label: "Other" },
];

export function JurisdictionDocumentsPanel({
  jurisdictionId,
}: JurisdictionDocumentsPanelProps) {
  const [jurisdiction, setJurisdiction] = useState<Jurisdiction | null>(null);
  const [documents, setDocuments] = useState<JurisdictionDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState("permit_checklist");
  const [sourceUrl, setSourceUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [deletingDocumentId, setDeletingDocumentId] = useState<string | null>(
  null
  );

  async function loadJurisdictionDocuments() {
    try {
        setIsLoading(true);
        setErrorMessage(null);

        const response = await fetch(
        `/api/jurisdictions/${jurisdictionId}/documents`
        );

        const data = (await response.json()) as JurisdictionDocumentsResponse;

        if (!response.ok || !data.ok) {
        throw new Error(data.error ?? "Failed to load jurisdiction documents.");
        }

        setJurisdiction(data.jurisdiction ?? null);
        setDocuments(data.documents ?? []);
    } catch (error) {
        setErrorMessage(
        error instanceof Error
            ? error.message
            : "Failed to load jurisdiction documents."
        );
    } finally {
        setIsLoading(false);
    }
   }

  useEffect(() => {
    if (jurisdictionId) {
        loadJurisdictionDocuments();
    }
  }, [jurisdictionId]);

  async function handleUploadDocument(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedFile) {
        setUploadMessage("Please select a PDF or TXT file to upload.");
        return;
    }

    try {
        setIsUploading(true);
        setUploadMessage(null);
        setErrorMessage(null);

        const formData = new FormData();
        formData.append("jurisdictionId", jurisdictionId);
        formData.append("documentType", documentType);
        formData.append("sourceUrl", sourceUrl);
        formData.append("file", selectedFile);

        const response = await fetch("/api/jurisdictions/documents/upload", {
        method: "POST",
        body: formData,
        });

        const data = (await response.json()) as {
        ok: boolean;
        documentName?: string;
        chunkCount?: number;
        error?: string;
        };

        if (!response.ok || !data.ok) {
        throw new Error(data.error ?? "Failed to upload jurisdiction document.");
        }

        setUploadMessage(
        `Uploaded ${data.documentName ?? "document"} and created ${
            data.chunkCount ?? 0
        } chunk(s).`
        );

        setSelectedFile(null);
        setSourceUrl("");
        setDocumentType("permit_checklist");

        await loadJurisdictionDocuments();
    } catch (error) {
        setUploadMessage(null);
        setErrorMessage(
        error instanceof Error
            ? error.message
            : "Failed to upload jurisdiction document."
        );
    } finally {
        setIsUploading(false);
    }
  }

  async function handleDeleteDocument(documentId: string, documentName: string) {
    const confirmed = window.confirm(
        `Delete "${documentName}" from this jurisdiction pack? This will also remove its stored chunks.`
    );

    if (!confirmed) return;

    try {
        setDeletingDocumentId(documentId);
        setErrorMessage(null);
        setUploadMessage(null);

        const response = await fetch("/api/jurisdictions/documents/delete", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ documentId }),
        });

        const data = (await response.json()) as {
        ok: boolean;
        deletedDocumentId?: string;
        deletedDocumentName?: string;
        error?: string;
        };

        if (!response.ok || !data.ok) {
        throw new Error(data.error ?? "Failed to delete jurisdiction document.");
        }

        setUploadMessage(
        `Deleted ${data.deletedDocumentName ?? documentName} from jurisdiction documents.`
        );

        await loadJurisdictionDocuments();
    } catch (error) {
        setErrorMessage(
        error instanceof Error
            ? error.message
            : "Failed to delete jurisdiction document."
        );
    } finally {
        setDeletingDocumentId(null);
    }
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50">
            <Building2 className="h-5 w-5 text-indigo-600" />
          </div>

          <div>
            <h2 className="text-lg font-semibold tracking-tight text-slate-900">
              Jurisdiction Documents
            </h2>
            <p className="text-sm text-slate-500">
              County/city checklist, rule, and reference documents connected to
              this jurisdiction pack.
            </p>
          </div>
        </div>

        {isLoading && <Loader2 className="h-5 w-5 animate-spin text-slate-400" />}
      </div>

      {jurisdiction && (
        <div className="mt-5 rounded-2xl border border-indigo-100 bg-indigo-50 p-4">
          <p className="text-sm font-semibold text-indigo-900">
            {jurisdiction.name}
          </p>
          <p className="mt-1 text-xs text-indigo-700">
            Type: {jurisdiction.jurisdiction_type}
            {jurisdiction.county ? ` · County: ${jurisdiction.county}` : ""}
            {jurisdiction.city ? ` · City: ${jurisdiction.city}` : ""}
          </p>
        </div>
      )}

      <form
        onSubmit={handleUploadDocument}
        className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4"
        >
        <div className="flex items-center justify-between gap-4">
            <div>
            <h3 className="text-sm font-semibold text-slate-900">
                Upload Jurisdiction Document
            </h3>
            <p className="mt-1 text-xs leading-5 text-slate-500">
                Upload county/city checklist, revision, fire marshal, accessibility,
                or code reference documents as PDF or TXT.
            </p>
            </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
            <label className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                Document Type
            </span>
            <select
                value={documentType}
                onChange={(event) => setDocumentType(event.target.value)}
                disabled={isUploading}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-indigo-300 focus:ring-4 focus:ring-indigo-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
                {DOCUMENT_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                    {option.label}
                </option>
                ))}
            </select>
            </label>

            <label className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                Source URL
            </span>
            <input
                type="url"
                value={sourceUrl}
                onChange={(event) => setSourceUrl(event.target.value)}
                placeholder="https://..."
                disabled={isUploading}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-indigo-300 focus:ring-4 focus:ring-indigo-50 disabled:cursor-not-allowed disabled:opacity-60"
            />
            </label>
        </div>

        <label className="mt-4 block">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
            PDF or TXT File
            </span>
            <input
            type="file"
            accept=".pdf,.txt,application/pdf,text/plain"
            disabled={isUploading}
            onChange={(event) => {
                const file = event.target.files?.[0] ?? null;
                setSelectedFile(file);
                setUploadMessage(null);
            }}
            className="mt-2 w-full rounded-xl border border-dashed border-slate-300 bg-white px-3 py-3 text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-indigo-700 hover:border-indigo-300 disabled:cursor-not-allowed disabled:opacity-60"
            />
        </label>

        {selectedFile && (
            <p className="mt-2 text-xs text-slate-500">
            Selected: {selectedFile.name} · {formatFileSize(selectedFile.size)}
            </p>
        )}

        {uploadMessage && (
            <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
            {uploadMessage}
            </div>
        )}

        <div className="mt-4 flex justify-end">
            <button
            type="submit"
            disabled={isUploading || !selectedFile}
            className="inline-flex items-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
            {isUploading ? (
                <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
                </>
            ) : (
                "Upload Document"
            )}
            </button>
        </div>
      </form>

      {errorMessage && (
        <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      {!isLoading && !errorMessage && documents.length === 0 && (
        <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
          No jurisdiction documents have been uploaded yet.
        </div>
      )}

      <div className="mt-5 space-y-3">
        {documents.map((document) => (
          <div
            key={document.id}
            className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex min-w-0 gap-3">
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white">
                  <FileText className="h-4 w-4 text-slate-500" />
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {document.name}
                  </p>

                  <div className="mt-2 flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full bg-blue-50 px-2.5 py-1 font-semibold text-blue-700">
                      {getDocumentTypeLabel(document.document_type)}
                    </span>

                    <span className="rounded-full bg-slate-200 px-2.5 py-1 font-semibold text-slate-700">
                      {document.source_type}
                    </span>

                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 font-semibold text-emerald-700">
                      {document.extraction_status}
                    </span>
                  </div>

                  <p className="mt-2 text-xs leading-5 text-slate-500">
                    Uploaded: {formatDate(document.created_at)} · Size:{" "}
                    {formatFileSize(document.size_bytes)}
                  </p>

                  {document.source_url && (
                    <p className="mt-1 truncate text-xs text-slate-500">
                      Source: {document.source_url}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                {document.extraction_status === "completed" && (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                )}

                <button
                    type="button"
                    onClick={() => handleDeleteDocument(document.id, document.name)}
                    disabled={deletingDocumentId === document.id}
                    className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label={`Delete ${document.name}`}
                >
                    {deletingDocumentId === document.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                    <Trash2 className="h-4 w-4" />
                    )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}