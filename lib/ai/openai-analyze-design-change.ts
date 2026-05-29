import type {
  AIReviewResult,
  AnalyzeDesignChangeRequest,
  RiskLevel,
} from "@/types/ai-review";
import { getOpenAIClient } from "@/lib/ai/openai";

type RawOpenAIReviewResult = {
  impactSummary?: unknown;
  affectedDocuments?: unknown;
  risks?: unknown;
  checklist?: unknown;
  evidenceNotes?: unknown;
};

function normalizeRiskLevel(value: unknown): RiskLevel {
  if (value === "High" || value === "Medium" || value === "Low") {
    return value;
  }

  return "Medium";
}

function normalizeStringArray(value: unknown, fallback: string[]): string[] {
  if (!Array.isArray(value)) {
    return fallback;
  }

  const normalized = value
    .filter((item) => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);

  return normalized.length > 0 ? normalized : fallback;
}

function normalizeAIReviewResult(raw: RawOpenAIReviewResult): AIReviewResult {
  const risks =
    Array.isArray(raw.risks) && raw.risks.length > 0
      ? raw.risks
          .map((risk) => {
            if (
              typeof risk === "object" &&
              risk !== null &&
              "title" in risk &&
              "level" in risk
            ) {
              const title =
                typeof risk.title === "string"
                  ? risk.title.trim()
                  : "Review risk requires further validation.";

              return {
                title: title || "Review risk requires further validation.",
                level: normalizeRiskLevel(risk.level),
              };
            }

            return null;
          })
          .filter((risk): risk is AIReviewResult["risks"][number] =>
            Boolean(risk)
          )
      : [
          {
            title: "AI review completed. Manual validation is still recommended.",
            level: "Medium" as RiskLevel,
          },
        ];

  return {
    impactSummary:
      typeof raw.impactSummary === "string" && raw.impactSummary.trim()
        ? raw.impactSummary.trim()
        : "CIVIX completed an AI-assisted review of the proposed design change. Manual validation by the project team is recommended before permit resubmission.",

    affectedDocuments: normalizeStringArray(raw.affectedDocuments, [
      "Permit Application Narrative",
      "Architectural Floor Plan",
    ]),

    risks,

    checklist: normalizeStringArray(raw.checklist, [
      "Review affected drawings and permit documents.",
      "Confirm whether city resubmission is required.",
      "Route revised package to architect, engineer, and permit consultant.",
    ]),

    evidenceNotes: normalizeStringArray(raw.evidenceNotes, [
      "Review was generated from the available project description, uploaded document list, and retrieved document context.",
    ]),

  };
}

function extractJsonObject(text: string) {
  const trimmed = text.trim();

  try {
    return JSON.parse(trimmed) as RawOpenAIReviewResult;
  } catch {
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");

    if (start === -1 || end === -1 || end <= start) {
      throw new Error("OpenAI response did not contain a valid JSON object.");
    }

    return JSON.parse(trimmed.slice(start, end + 1)) as RawOpenAIReviewResult;
  }
}

export async function openAIAnalyzeDesignChange(
  input: AnalyzeDesignChangeRequest
): Promise<AIReviewResult> {
  const openai = getOpenAIClient();

  if (!openai) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }

  const uploadedDocumentsSummary =
    input.documents.length > 0
      ? input.documents
          .map(
            (document, index) =>
              `${index + 1}. ${document.name} (${document.type}, ${document.size} bytes)`
          )
          .join("\n")
      : "No documents uploaded.";

  const prompt = `
You are CIVIX, an AI-assisted construction permit package review assistant.

Your task:
Analyze a proposed design change against the project context, uploaded permit package evidence, and jurisdiction-specific county/city evidence when provided.

Important limitations:
- You are not a licensed architect, engineer, attorney, permit official, or code official.
- Do not claim final code compliance approval.
- Provide practical review guidance for construction teams, permit consultants, architects, engineers, and project managers.
- Focus on affected documents, coordination risks, compliance review needs, jurisdiction review triggers, and permit revision or resubmission considerations.
- Clearly distinguish between permit package evidence and jurisdiction evidence when explaining the basis for your analysis.
- Do not invent county-specific requirements unless supported by jurisdiction evidence.
- If a jurisdiction issue is inferred from general review context rather than directly stated, describe it as a likely review trigger, not a confirmed rule.

Project:
- Name: ${input.projectName}
- Location: ${input.projectLocation}
- Type: ${input.projectType}

Uploaded documents:
${uploadedDocumentsSummary}

Retrieved evidence context:
The context below may include two source categories:
1. RETRIEVED PERMIT PACKAGE EVIDENCE
2. RETRIEVED JURISDICTION / COUNTY-CITY EVIDENCE

${input.documentContext ?? "No retrieved evidence context provided."}

Design change:
${input.designChange}

Return ONLY valid JSON with exactly this structure:
{
  "impactSummary": "string",
  "affectedDocuments": ["string"],
  "risks": [
    {
      "title": "string",
      "level": "Low" | "Medium" | "High"
    }
  ],
  "checklist": ["string"],
  "evidenceNotes": ["string"]
}

Rules:
- affectedDocuments should contain likely affected drawing sheets, permit forms, schedules, narratives, or jurisdiction review documents.
- When sheet numbers are available, write affectedDocuments in this format: "A-101 Architectural Floor Plan", not just "A-101".
- Do not list generic document names if a more specific sheet number and sheet title are available in the retrieved permit package evidence.
- risks should contain 4 to 7 practical risks written from the perspective of a permit reviewer, architect, engineer, permit consultant, or construction project manager.
- Each risk title should be specific enough to explain what may need review, not just a broad category.
- checklist should contain 6 to 10 actionable checklist items.
- Each checklist item should start with a clear action verb such as "Update", "Verify", "Coordinate", "Confirm", "Route", or "Review".
- When permit package evidence is available, use it to identify approved sheets, drawings, schedules, notes, and project-specific affected documents.
- When jurisdiction evidence is available, use it to identify county/city review triggers, revision or resubmittal implications, portal routing, accessibility review concerns, life safety review concerns, fire marshal coordination, and MEP coordination requirements.
- Separate the role of the sources:
  - Permit package evidence tells you what was approved or documented in the project plan set.
  - Jurisdiction evidence tells you what the county/city review process, checklist, or rule context may require.
- Do not invent county-specific requirements unless supported by jurisdiction evidence.
- If a jurisdiction issue is inferred rather than directly stated, say it is a likely review trigger rather than a confirmed rule.
- Do not claim final code compliance approval.
- Use concise professional construction language.
- Do not wrap the JSON in markdown.
- evidenceNotes should contain 4 to 8 short notes explaining which source supports the analysis.
- Each evidence note should start with either "[Permit Package Evidence]" or "[Jurisdiction Evidence]".
- Each permit package evidence note should mention a sheet number or document reference when available.
- Each jurisdiction evidence note should mention the jurisdiction document type, checklist, revision/resubmittal context, or county/city review trigger when available.
`;
  const completion = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    temperature: 0.2,
    messages: [
      {
        role: "system",
        content:
          "You are a senior construction permit review assistant. You produce practical, project-specific permit package and jurisdiction-aware impact analysis as strict JSON only. Use retrieved evidence context when available, preserve sheet numbers with sheet titles, and distinguish permit package evidence from jurisdiction evidence.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    response_format: {
      type: "json_object",
    },
  });

  const content = completion.choices[0]?.message?.content;

  if (!content) {
    throw new Error("OpenAI returned an empty response.");
  }

  const raw = extractJsonObject(content);

  return normalizeAIReviewResult(raw);
}