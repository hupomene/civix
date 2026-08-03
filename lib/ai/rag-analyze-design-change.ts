import type {
  AIReviewResult,
  AnalyzeDesignChangeRequest,
  RiskLevel,
} from "@/types/ai-review";

type RagCitation = {
  id?: string;
  document_id?: string;
  source?: string | null;
  document?: string;
  section?: string;
  page?: number;
  text?: string;
};

type RagClaim = {
  claim?: string;
  text?: string;
  supported?: boolean;
};

type RagApiResponse = {
  status?: string;
  answer?: string;
  evidence_sufficient?: boolean;
  citations?: RagCitation[];
  claims?: RagClaim[];
  warnings?: string[];
  error_code?: string | null;
};

function getRagApiUrl(): string {
  const url = process.env.CIVIX_RAG_API_URL?.trim();

  if (!url) {
    throw new Error("CIVIX_RAG_API_URL is not configured.");
  }

  return url.replace(/\/+$/, "");
}

function normalizeJurisdiction(projectLocation: string): string {
  const normalized = projectLocation.trim().toLowerCase();

  if (normalized.includes("lake dallas")) {
    return "Lake Dallas";
  }

  return projectLocation.trim();
}

function citationToEvidenceNote(
  citation: RagCitation,
  index: number
): string {
  const source =
    citation.document?.trim() ||
    citation.document_id?.trim() ||
    citation.source?.trim() ||
    citation.id?.trim() ||
    `Retrieved source ${index + 1}`;

  const formattedSource = formatDocumentName(source);

  const locationParts: string[] = [];

  if (citation.section?.trim()) {
    locationParts.push(`section ${citation.section.trim()}`);
  }

  if (typeof citation.page === "number") {
    locationParts.push(`page ${citation.page}`);
  }

  const location =
    locationParts.length > 0 ? ` (${locationParts.join(", ")})` : "";

  const excerpt = citation.text?.trim()
    ? `: ${citation.text.trim()}`
    : "";

  return `[Jurisdiction Evidence] ${formattedSource}${location}${excerpt}`;
}

function buildRisks(response: RagApiResponse): AIReviewResult["risks"] {
  const risks: AIReviewResult["risks"] = [];

  if (response.evidence_sufficient === false) {
    risks.push({
      title:
        "Available jurisdiction evidence is insufficient to confirm the proposed change requirements.",
      level: "High",
    });
  }

  const unsupportedClaims =
    response.claims?.filter((claim) => claim.supported === false) ?? [];

  if (unsupportedClaims.length > 0) {
    risks.push({
      title: `${unsupportedClaims.length} analysis claim(s) require additional source validation.`,
      level: "High",
    });
  }

  for (const warning of response.warnings ?? []) {
    if (!warning.trim()) {
      continue;
    }

    risks.push({
      title: warning.trim(),
      level: "Medium",
    });
  }

  if (risks.length === 0) {
    risks.push({
      title:
        "Confirm the RAG findings against the complete permit package and current jurisdiction records.",
      level: "Medium",
    });
  }

  return risks.slice(0, 7);
}

function buildChecklist(response: RagApiResponse): string[] {
  const checklist = [
    "Review the cited jurisdiction evidence supporting the analysis.",
    "Verify the findings against the current permit package and approved drawings.",
    "Confirm whether revised documents or permit resubmittal are required.",
    "Coordinate the proposed change with the responsible architect or engineer.",
  ];

  if (response.evidence_sufficient === false) {
    checklist.push(
      "Obtain additional jurisdiction documents before relying on the analysis."
    );
  }

  if (response.claims?.some((claim) => claim.supported === false)) {
    checklist.push(
      "Validate unsupported claims before including them in the permit revision."
    );
  }

  return checklist;
}

function formatDocumentName(value: string): string {
  return value
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

export async function ragAnalyzeDesignChange(
  input: AnalyzeDesignChangeRequest
): Promise<AIReviewResult> {
  const ragApiUrl = getRagApiUrl();

  const response = await fetch(`${ragApiUrl}/query`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      question: input.designChange,
      jurisdiction: normalizeJurisdiction(input.projectLocation),
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(120_000),
  });

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      `CIVIX RAG request failed with HTTP ${response.status}: ${errorText}`
    );
  }

  const ragResponse = (await response.json()) as RagApiResponse;

  if (
    ragResponse.status !== "success" ||
    !ragResponse.answer?.trim()
  ) {
    throw new Error(
      ragResponse.error_code
        ? `CIVIX RAG failed: ${ragResponse.error_code}`
        : "CIVIX RAG returned no usable answer."
    );
  }

  const evidenceNotes =
    ragResponse.citations
      ?.map(citationToEvidenceNote)
      .filter(Boolean) ?? [];

  if (evidenceNotes.length === 0) {
    evidenceNotes.push(
      "[Jurisdiction Evidence] No citation details were returned by the RAG service."
    );
  }

  const affectedDocuments = Array.from(
    new Set(
      (ragResponse.citations ?? [])
        .map(
          (citation) =>
            citation.document?.trim() ||
            citation.document_id?.trim()
        )
        .filter((value): value is string => Boolean(value))
        .map(formatDocumentName)
    )
  );

  return {
    impactSummary: ragResponse.answer.trim(),

    affectedDocuments:
      affectedDocuments.length > 0
        ? affectedDocuments
        : ["Jurisdiction review documents"],

    risks: buildRisks(ragResponse),

    checklist: buildChecklist(ragResponse),

    evidenceNotes,
  };
}