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
Analyze a proposed design change against the project context and uploaded document list.

Important limitations:
- You are not a licensed architect, engineer, attorney, or city official.
- Do not claim final code compliance approval.
- Provide practical review guidance for construction teams.
- Focus on affected documents, coordination risks, compliance review needs, and permit resubmission considerations.

Project:
- Name: ${input.projectName}
- Location: ${input.projectLocation}
- Type: ${input.projectType}

Uploaded documents:
${uploadedDocumentsSummary}

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
  "checklist": ["string"]
}

Rules:
- affectedDocuments should contain likely affected drawing sheets, permit forms, schedules, or narratives.
- risks should contain 3 to 6 practical risks.
- checklist should contain 5 to 10 actionable checklist items.
- Use concise professional construction language.
- Do not wrap the JSON in markdown.
`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    temperature: 0.2,
    messages: [
      {
        role: "system",
        content:
          "You produce concise, practical construction permit review analysis as strict JSON only.",
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