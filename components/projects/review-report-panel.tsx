"use client";

import { useMemo, useState } from "react";
import type { AIReviewResult, UploadedDocument } from "@/types/ai-review";
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
};

function formatReportText({
  projectName,
  projectLocation,
  projectType,
  designChange,
  documents,
  result,
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

  return `CIVIX AI-ASSISTED PERMIT REVIEW REPORT

Project Information
Project Name: ${projectName}
Location: ${projectLocation}
Project Type: ${projectType}

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

Important Notice
This report is an AI-generated draft for project coordination and preliminary review support. It does not replace review by licensed architects, engineers, permit consultants, code officials, or other qualified professionals. Final compliance and permit decisions must be validated by the appropriate professionals and authorities having jurisdiction.`;
}

function getHighestRisk(result: AIReviewResult) {
  if (result.risks.some((risk) => risk.level === "High")) return "High";
  if (result.risks.some((risk) => risk.level === "Medium")) return "Medium";
  return "Low";
}

export function ReviewReportPanel({
  projectName,
  projectLocation,
  projectType,
  designChange,
  documents,
  result,
}: ReviewReportPanelProps) {
  const [copied, setCopied] = useState(false);

  const highestRisk = getHighestRisk(result);

  const reportText = useMemo(
    () =>
      formatReportText({
        projectName,
        projectLocation,
        projectType,
        designChange,
        documents,
        result,
      }),
    [projectName, projectLocation, projectType, designChange, documents, result]
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
                .map((risk) => `<li><strong>[${risk.level}]</strong> ${risk.title}</li>`)
                .join("")}
            </ol>

            <h2>Compliance Checklist</h2>
            <ol>
            ${result.checklist.map((item) => `<li>${item}</li>`).join("")}
            </ol>

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

        <div className="grid gap-4 md:grid-cols-4 print:grid-cols-2">
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