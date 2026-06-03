"use client";

import { useMemo, useState } from "react";
import type {
  AIReviewResult,
  RetrievedDocumentChunk,
  RetrievedJurisdictionChunk,
  UploadedDocument,
} from "@/types/ai-review";
import {
  Check,
  Clipboard,
  Download,
  FileText,
  Printer,
  ShieldAlert,
} from "lucide-react";

type ReviewReportPanelProps = {
  projectName: string;
  projectLocation: string;
  projectType: string;
  designChange: string;
  documents: UploadedDocument[];
  result: AIReviewResult;
  retrievedChunks?: RetrievedDocumentChunk[];
  jurisdictionChunks?: RetrievedJurisdictionChunk[];
};

function formatReportText({
  projectName,
  projectLocation,
  projectType,
  designChange,
  documents,
  result,
  retrievedChunks = [],
  jurisdictionChunks = [],
}: ReviewReportPanelProps) {
  const documentList =
    documents.length > 0
      ? documents.map((doc, index) => `${index + 1}. ${doc.name}`).join("\n")
      : "No uploaded documents listed.";

  const affectedDocuments = result.affectedDocuments
    .map((doc, index) => `${index + 1}. ${doc}`)
    .join("\n");

  const risks = result.risks
    .map((risk, index) => `${index + 1}. [${risk.level}] ${risk.title}`)
    .join("\n");

  const checklist = result.checklist
    .map((item, index) => `${index + 1}. ${item}`)
    .join("\n");

  const {
    permitPackageEvidenceNotes,
    jurisdictionEvidenceNotes,
    otherEvidenceNotes,
  } = splitEvidenceNotes(result.evidenceNotes);

  const permitPackageEvidenceText =
    permitPackageEvidenceNotes.length > 0
      ? permitPackageEvidenceNotes
          .map((note, index) => `${index + 1}. ${cleanEvidencePrefix(note)}`)
          .join("\n")
      : "No permit package evidence notes were generated.";

  const jurisdictionEvidenceText =
    jurisdictionEvidenceNotes.length > 0
      ? jurisdictionEvidenceNotes
          .map((note, index) => `${index + 1}. ${cleanEvidencePrefix(note)}`)
          .join("\n")
      : "No jurisdiction evidence notes were generated.";

  const additionalEvidenceText =
    otherEvidenceNotes.length > 0
      ? `

  Additional Evidence Notes
  ${otherEvidenceNotes.map((note, index) => `${index + 1}. ${note}`).join("\n")}`
      : "";

  const retrievedPermitChunksText =
    retrievedChunks && retrievedChunks.length > 0
      ? retrievedChunks
          .slice(0, 5)
          .map(
            (chunk, index) =>
              `${index + 1}. ${chunk.documentName} | Chunk #${
                chunk.chunkIndex
              } | Score ${chunk.relevanceScore}
    ${chunk.contentPreview}`
          )
          .join("\n")
      : "No permit package chunks were attached.";

  const retrievedJurisdictionChunksText =
    jurisdictionChunks && jurisdictionChunks.length > 0
      ? jurisdictionChunks
          .slice(0, 5)
          .map(
            (chunk, index) =>
              `${index + 1}. ${chunk.jurisdictionName} | ${
                chunk.documentType
              } | Chunk #${chunk.chunkIndex} | Score ${chunk.relevanceScore}
    ${truncateSourceText(chunk.content)}`
          )
          .join("\n")
      : "No jurisdiction chunks were attached.";

  return `CIVIX AI-ASSISTED PERMIT REVIEW REPORT

Project Information
Project Name: ${projectName}
Location: ${projectLocation}
Project Type: ${projectType}
Jurisdiction Pack Used: ${
  jurisdictionChunks[0]?.jurisdictionName ?? "No jurisdiction pack used"
}

Design Change Reviewed
${designChange}

Uploaded Documents
${documentList}

Impact Summary
${result.impactSummary}

Affected Documents
${affectedDocuments}

Detected Risks
${risks}

Compliance Checklist
${checklist}

Permit Package Evidence
${permitPackageEvidenceText}

Jurisdiction Evidence
${jurisdictionEvidenceText}${additionalEvidenceText}

Retrieved Permit Package Source Chunks
${retrievedPermitChunksText}

Retrieved Jurisdiction Source Chunks
${retrievedJurisdictionChunksText}

Important Notice
This report is an AI-generated draft for project coordination and preliminary review support. It does not replace review by licensed architects, engineers, permit consultants, code officials, or other qualified professionals. Final compliance and permit decisions must be validated by the appropriate professionals and authorities having jurisdiction.`;
}

function getHighestRisk(result: AIReviewResult) {
  if (result.risks.some((risk) => risk.level === "High")) return "High";
  if (result.risks.some((risk) => risk.level === "Medium")) return "Medium";
  return "Low";
}

function splitEvidenceNotes(evidenceNotes: string[] | undefined) {
  const notes = evidenceNotes ?? [];

  const permitPackageEvidenceNotes = notes.filter((note) =>
    note.toLowerCase().includes("[permit package evidence]")
  );

  const jurisdictionEvidenceNotes = notes.filter((note) =>
    note.toLowerCase().includes("[jurisdiction evidence]")
  );

  const otherEvidenceNotes = notes.filter((note) => {
    const lowerNote = note.toLowerCase();

    return (
      !lowerNote.includes("[permit package evidence]") &&
      !lowerNote.includes("[jurisdiction evidence]")
    );
  });

  return {
    permitPackageEvidenceNotes,
    jurisdictionEvidenceNotes,
    otherEvidenceNotes,
  };
}

function cleanEvidencePrefix(note: string) {
  return note
    .replace(/^\[Permit Package Evidence\]\s*/i, "")
    .replace(/^\[Jurisdiction Evidence\]\s*/i, "")
    .trim();
}

function truncateSourceText(text: string, maxLength = 450) {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trim()}...`;
}

export function ReviewReportPanel({
  projectName,
  projectLocation,
  projectType,
  designChange,
  documents,
  result,
  retrievedChunks = [],
  jurisdictionChunks = [],
}: ReviewReportPanelProps) {
  const [copied, setCopied] = useState(false);

  const highestRisk = getHighestRisk(result);
  const jurisdictionPackName =
    jurisdictionChunks[0]?.jurisdictionName ?? "No jurisdiction pack used";

  const {
    permitPackageEvidenceNotes,
    jurisdictionEvidenceNotes,
    otherEvidenceNotes,
  } = splitEvidenceNotes(result.evidenceNotes);

  const reportText = useMemo(
    () =>
      formatReportText({
        projectName,
        projectLocation,
        projectType,
        designChange,
        documents,
        result,
        retrievedChunks,
        jurisdictionChunks,
      }),
    [
      projectName,
      projectLocation,
      projectType,
      designChange,
      documents,
      result,
      retrievedChunks,
      jurisdictionChunks,
    ]
  );

  async function handleCopyReport() {
    try {
      await navigator.clipboard.writeText(reportText);
      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 1800);
    } catch (error) {
      console.error("Failed to copy report:", error);
      setCopied(false);
    }
  }

  function handleDownloadReport() {
    const blob = new Blob([reportText], {
      type: "text/plain;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `${projectName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")}-civix-review-report.txt`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }

function handlePrintReport() {
  const permitPackageEvidenceHtml =
    permitPackageEvidenceNotes.length > 0
      ? permitPackageEvidenceNotes
          .map((note) => `<li>${cleanEvidencePrefix(note)}</li>`)
          .join("")
      : "<li>No permit package evidence notes were generated.</li>";

  const jurisdictionEvidenceHtml =
    jurisdictionEvidenceNotes.length > 0
      ? jurisdictionEvidenceNotes
          .map((note) => `<li>${cleanEvidencePrefix(note)}</li>`)
          .join("")
      : "<li>No jurisdiction evidence notes were generated.</li>";

  const additionalEvidenceHtml =
    otherEvidenceNotes.length > 0
      ? `
        <h2>Additional Evidence Notes</h2>
        <ol>
          ${otherEvidenceNotes.map((note) => `<li>${note}</li>`).join("")}
        </ol>
      `
      : "";

  const permitChunksHtml =
    retrievedChunks.length > 0
      ? retrievedChunks
          .slice(0, 5)
          .map(
            (chunk) => `
            <li>
              <strong>${chunk.documentName}</strong>
              — Chunk #${chunk.chunkIndex}, Score ${chunk.relevanceScore}<br />
              ${chunk.contentPreview}
            </li>
          `
          )
          .join("")
      : "<li>No permit package chunks were attached.</li>";

  const jurisdictionChunksHtml =
    jurisdictionChunks.length > 0
      ? jurisdictionChunks
          .slice(0, 5)
          .map(
            (chunk) => `
            <li>
              <strong>${chunk.jurisdictionName}</strong>
              — ${chunk.documentType}, Chunk #${chunk.chunkIndex}, Score ${chunk.relevanceScore}<br />
              ${truncateSourceText(chunk.content)}
            </li>
          `
          )
          .join("")
      : "<li>No jurisdiction chunks were attached.</li>";

    const printableHtml = `
      <!doctype html>
      <html>
        <head>
          <title>CIVIX Review Report</title>
          <style>
            @page {
              size: letter;
              margin: 0.65in;
            }

            body {
              font-family: Arial, Helvetica, sans-serif;
              color: #0f172a;
              line-height: 1.55;
              margin: 0;
            }

            h1 {
              font-size: 22px;
              margin: 0 0 6px 0;
            }

            h2 {
              font-size: 15px;
              margin: 24px 0 8px 0;
              padding-bottom: 4px;
              border-bottom: 1px solid #e2e8f0;
            }

            p {
              font-size: 12px;
              margin: 0 0 8px 0;
            }

            .subtitle {
              color: #64748b;
              font-size: 12px;
              margin-bottom: 20px;
            }

            .meta-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 10px;
              margin: 18px 0;
            }

            .meta-card {
              border: 1px solid #e2e8f0;
              padding: 10px;
              border-radius: 8px;
            }

            .label {
              font-size: 10px;
              text-transform: uppercase;
              letter-spacing: 0.08em;
              color: #64748b;
              margin-bottom: 4px;
            }

            .value {
              font-size: 12px;
              font-weight: 700;
            }

            ol {
              margin: 8px 0 0 18px;
              padding: 0;
            }

            li {
              font-size: 12px;
              margin-bottom: 5px;
            }

            .notice {
              margin-top: 24px;
              padding: 12px;
              border: 1px solid #fcd34d;
              background: #fffbeb;
              color: #78350f;
              border-radius: 8px;
              font-size: 12px;
            }
          </style>
        </head>

        <body>
          <h1>CIVIX AI-Assisted Permit Review Report</h1>
          <p class="subtitle">Generated from current project review data</p>

          <div class="meta-grid">
            <div class="meta-card">
              <div class="label">Project</div>
              <div class="value">${projectName}</div>
              <p>${projectLocation}</p>
            </div>

            <div class="meta-card">
              <div class="label">Project Type</div>
              <div class="value">${projectType}</div>
              <p>${documents.length} uploaded document${
                documents.length === 1 ? "" : "s"
              }</p>
            </div>

            <div class="meta-card">
              <div class="label">Jurisdiction Pack Used</div>
              <div class="value">${jurisdictionPackName}</div>
              <p>County/city source evidence used for this analysis</p>
            </div>
          </div>

          <h2>Design Change Reviewed</h2>
          <p>${designChange}</p>

          <h2>Uploaded Documents</h2>
          <ol>
            ${
              documents.length > 0
                ? documents.map((doc) => `<li>${doc.name}</li>`).join("")
                : "<li>No uploaded documents listed.</li>"
            }
          </ol>

          <h2>Impact Summary</h2>
          <p>${result.impactSummary}</p>

          <h2>Affected Documents</h2>
          <ol>
            ${result.affectedDocuments
              .map((doc) => `<li>${doc}</li>`)
              .join("")}
          </ol>

          <h2>Detected Risks</h2>
          <ol>
            ${result.risks
              .map(
                (risk) =>
                  `<li><strong>[${risk.level}]</strong> ${risk.title}</li>`
              )
              .join("")}
          </ol>

          <h2>Compliance Checklist</h2>
          <ol>
            ${result.checklist.map((item) => `<li>${item}</li>`).join("")}
          </ol>

          <h2>Permit Package Evidence</h2>
          <ol>
            ${permitPackageEvidenceHtml}
          </ol>

          <h2>Jurisdiction Evidence</h2>
          <ol>
            ${jurisdictionEvidenceHtml}
          </ol>

          ${additionalEvidenceHtml}

          ${
            retrievedChunks.length > 0 || jurisdictionChunks.length > 0
              ? `
                <h2>Retrieved Permit Package Source Chunks</h2>
                <ol>
                  ${permitChunksHtml}
                </ol>

                <h2>Retrieved Jurisdiction Source Chunks</h2>
                <ol>
                  ${jurisdictionChunksHtml}
                </ol>
              `
              : ""
          }

          <div class="notice">
            This report is an AI-generated draft for project coordination and preliminary review support.
            It does not replace review by licensed architects, engineers, permit consultants, code officials,
            or other qualified professionals. Final compliance and permit decisions must be validated by the
            appropriate professionals and authorities having jurisdiction.
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open("", "_blank", "width=900,height=1200");

    if (!printWindow) {
      return;
    }

    printWindow.document.open();
    printWindow.document.write(printableHtml);
    printWindow.document.close();

    printWindow.focus();

    window.setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 300);
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm print:rounded-none print:border-none print:p-0 print:shadow-none">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start print:hidden">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50">
            <FileText className="h-5 w-5 text-blue-600" />
          </div>

          <div>
            <h2 className="text-lg font-semibold">Review Report Preview</h2>
            <p className="text-sm text-slate-500">
              Report-ready summary generated from the current AI analysis.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleCopyReport}
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            {copied ? (
              <>
                <Check className="mr-2 h-4 w-4 text-emerald-600" />
                Copied
              </>
            ) : (
              <>
                <Clipboard className="mr-2 h-4 w-4" />
                Copy Report
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleDownloadReport}
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <Download className="mr-2 h-4 w-4" />
            Download TXT
          </button>

          <button
            type="button"
            onClick={handlePrintReport}
            className="inline-flex items-center justify-center rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            <Printer className="mr-2 h-4 w-4" />
            Print / Save PDF
          </button>
        </div>
      </div>

      <div
        id="civix-review-report"
        className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-6 print:mt-0 print:rounded-none print:border-none print:bg-white print:p-0"
      >
        <div className="hidden print:block">
          <div className="mb-6 border-b border-slate-300 pb-4">
            <h1 className="text-2xl font-bold text-slate-950">
              CIVIX AI-Assisted Permit Review Report
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Generated from current project review data
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-5 print:grid-cols-2">
          <div className="rounded-2xl bg-white p-4 print:rounded-none print:border print:border-slate-200">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
              Project
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-900">
              {projectName}
            </p>
            <p className="mt-1 text-sm text-slate-500">{projectLocation}</p>
          </div>

          <div className="rounded-2xl bg-white p-4 print:rounded-none print:border print:border-slate-200">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
              Project Type
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-900">
              {projectType}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              {documents.length} uploaded document
              {documents.length === 1 ? "" : "s"}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-4 print:rounded-none print:border print:border-slate-200">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
              Jurisdiction Pack Used
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-900">
              {jurisdictionPackName}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              County/city evidence source
            </p>
          </div>

          <div className="rounded-2xl bg-white p-4 print:rounded-none print:border print:border-slate-200">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
              Risk Level
            </p>
            <p
              className={`mt-2 text-sm font-semibold ${
                highestRisk === "High"
                  ? "text-red-700"
                  : highestRisk === "Medium"
                  ? "text-amber-700"
                  : "text-emerald-700"
              }`}
            >
              {highestRisk}
            </p>
            <p className="mt-1 text-sm text-slate-500">Current AI assessment</p>
          </div>

          <div className="rounded-2xl bg-white p-4 print:rounded-none print:border print:border-slate-200">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
              Review Status
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-900">
              AI-generated draft
            </p>
            <p className="mt-1 text-sm text-amber-600">
              Professional validation required
            </p>
          </div>
        </div>

        <div className="mt-5 rounded-2xl bg-white p-5 print:rounded-none print:border print:border-slate-200">
          <h3 className="text-sm font-semibold text-slate-900">
            Design Change Reviewed
          </h3>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            {designChange}
          </p>
        </div>

        <div className="mt-5 rounded-2xl bg-white p-5 print:rounded-none print:border print:border-slate-200">
          <h3 className="text-sm font-semibold text-slate-900">
            Uploaded Documents
          </h3>

          {documents.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500">
              No uploaded documents listed.
            </p>
          ) : (
            <ol className="mt-3 space-y-2">
              {documents.map((doc, index) => (
                <li
                  key={doc.id}
                  className="text-sm leading-6 text-slate-600"
                >
                  {index + 1}. {doc.name}
                </li>
              ))}
            </ol>
          )}
        </div>

        <div className="mt-5 rounded-2xl bg-white p-5 print:rounded-none print:border print:border-slate-200">
          <h3 className="text-sm font-semibold text-slate-900">
            Impact Summary
          </h3>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            {result.impactSummary}
          </p>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-2 print:grid-cols-1">
          <div className="rounded-2xl bg-white p-5 print:rounded-none print:border print:border-slate-200">
            <h3 className="text-sm font-semibold text-slate-900">
              Affected Documents
            </h3>

            <ol className="mt-3 space-y-2">
              {result.affectedDocuments.map((doc, index) => (
                <li
                  key={`${doc}-${index}`}
                  className="text-sm leading-6 text-slate-600"
                >
                  {index + 1}. {doc}
                </li>
              ))}
            </ol>
          </div>

          <div className="rounded-2xl bg-white p-5 print:rounded-none print:border print:border-slate-200">
            <h3 className="text-sm font-semibold text-slate-900">
              Detected Risks
            </h3>

            <div className="mt-3 space-y-3">
              {result.risks.map((risk, index) => (
                <div
                  key={`${risk.title}-${index}`}
                  className="rounded-xl border border-slate-200 p-3 print:rounded-none"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm leading-6 text-slate-700">
                      {risk.title}
                    </p>

                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold print:rounded-none ${
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

        <div className="mt-5 rounded-2xl bg-white p-5 print:rounded-none print:border print:border-slate-200">
          <h3 className="text-sm font-semibold text-slate-900">
            Compliance Checklist
          </h3>

          <ol className="mt-3 space-y-2">
            {result.checklist.map((item, index) => (
              <li
                key={`${item}-${index}`}
                className="text-sm leading-6 text-slate-600"
              >
                {index + 1}. {item}
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-2 print:grid-cols-1">
          <div className="rounded-2xl bg-white p-5 print:rounded-none print:border print:border-slate-200">
            <h3 className="text-sm font-semibold text-slate-900">
              Permit Package Evidence
            </h3>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Evidence derived from uploaded permit package sheets, schedules, notes,
              and extracted document context.
            </p>

            <ol className="mt-3 space-y-2">
              {permitPackageEvidenceNotes.length > 0 ? (
                permitPackageEvidenceNotes.map((item, index) => (
                  <li
                    key={`${item}-${index}`}
                    className="text-sm leading-6 text-slate-600"
                  >
                    {index + 1}. {cleanEvidencePrefix(item)}
                  </li>
                ))
              ) : (
                <li className="text-sm leading-6 text-slate-500">
                  No permit package evidence notes were generated.
                </li>
              )}
            </ol>
          </div>

          <div className="rounded-2xl bg-white p-5 print:rounded-none print:border print:border-slate-200">
            <h3 className="text-sm font-semibold text-slate-900">
              Jurisdiction Evidence
            </h3>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Evidence derived from county/city checklist, revision, resubmittal, rule,
              or local review context.
            </p>

            <ol className="mt-3 space-y-2">
              {jurisdictionEvidenceNotes.length > 0 ? (
                jurisdictionEvidenceNotes.map((item, index) => (
                  <li
                    key={`${item}-${index}`}
                    className="text-sm leading-6 text-slate-600"
                  >
                    {index + 1}. {cleanEvidencePrefix(item)}
                  </li>
                ))
              ) : (
                <li className="text-sm leading-6 text-slate-500">
                  No jurisdiction evidence notes were generated.
                </li>
              )}
            </ol>
          </div>
        </div>

        {otherEvidenceNotes.length > 0 && (
          <div className="mt-5 rounded-2xl bg-white p-5 print:rounded-none print:border print:border-slate-200">
            <h3 className="text-sm font-semibold text-slate-900">
              Additional Evidence Notes
            </h3>

            <ol className="mt-3 space-y-2">
              {otherEvidenceNotes.map((item, index) => (
                <li
                  key={`${item}-${index}`}
                  className="text-sm leading-6 text-slate-600"
                >
                  {index + 1}. {item}
                </li>
              ))}
            </ol>
          </div>
        )}

        {(retrievedChunks.length > 0 || jurisdictionChunks.length > 0) && (
          <div className="mt-5 rounded-2xl bg-white p-5 print:rounded-none print:border print:border-slate-200">
            <h3 className="text-sm font-semibold text-slate-900">
              Retrieved Source Chunks
            </h3>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Source chunks retrieved by CIVIX to support this AI-assisted permit review.
            </p>

            <div className="mt-4 grid gap-4 lg:grid-cols-2 print:grid-cols-1">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 print:rounded-none">
                <h4 className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Permit Package Chunks
                </h4>

                <div className="mt-3 space-y-3">
                  {retrievedChunks.length > 0 ? (
                    retrievedChunks.slice(0, 5).map((chunk, index) => (
                      <div
                        key={`${chunk.documentName}-${chunk.chunkIndex}-${index}`}
                        className="rounded-xl bg-white p-3 text-xs leading-5 text-slate-700 print:rounded-none"
                      >
                        <p className="font-semibold text-slate-900">
                          {chunk.documentName}
                        </p>
                        <p className="mt-1 text-slate-500">
                          Chunk #{chunk.chunkIndex} · Score {chunk.relevanceScore}
                        </p>
                        <p className="mt-2">{chunk.contentPreview}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">
                      No permit package chunks were attached.
                    </p>
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 print:rounded-none">
                <h4 className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Jurisdiction Chunks
                </h4>

                <div className="mt-3 space-y-3">
                  {jurisdictionChunks.length > 0 ? (
                    jurisdictionChunks.slice(0, 5).map((chunk) => (
                      <div
                        key={chunk.id}
                        className="rounded-xl bg-white p-3 text-xs leading-5 text-slate-700 print:rounded-none"
                      >
                        <p className="font-semibold text-slate-900">
                          {chunk.jurisdictionName}
                        </p>
                        <p className="mt-1 text-slate-500">
                          {chunk.documentType} · Chunk #{chunk.chunkIndex} · Score{" "}
                          {chunk.relevanceScore}
                        </p>
                        <p className="mt-2">{truncateSourceText(chunk.content)}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">
                      No jurisdiction chunks were attached.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 print:rounded-none">
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
          <p className="text-sm leading-6 text-amber-900">
            This report is an AI-generated draft for project coordination and
            preliminary review support. It does not replace review by licensed
            architects, engineers, permit consultants, code officials, or other
            qualified professionals. Final compliance and permit decisions must
            be validated by the appropriate professionals and authorities having
            jurisdiction.
          </p>
        </div>
      </div>
    </section>
  );
}