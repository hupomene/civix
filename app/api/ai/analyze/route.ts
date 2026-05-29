import { NextResponse } from "next/server";
import { mockAnalyzeDesignChange } from "@/lib/ai/mock-analyze-design-change";
import { openAIAnalyzeDesignChange } from "@/lib/ai/openai-analyze-design-change";
import { getOrCreateDemoProject } from "@/lib/database/demo-project";
import { saveAIReview } from "@/lib/database/ai-reviews";
import { createAdminClient } from "@/lib/supabase/admin";
import { getRelevantDocumentChunks } from "@/lib/database/relevant-document-chunks";
import type {
  AnalyzeDesignChangeRequest,
  AnalyzeDesignChangeResponse,
} from "@/types/ai-review";
import { getProjectDocumentContext } from "@/lib/database/document-context";
import { getRelevantJurisdictionChunks } from "@/lib/database/relevant-jurisdiction-chunks";

type ProjectForAnalyze = {
  id: string;
  name: string;
  location: string | null;
  project_type: string | null;
  jurisdiction_id: string | null;
};

type SavedAIReviewForAnalyze = {
  id: string;
};

type AnalyzeResponseWithPersistence = AnalyzeDesignChangeResponse & {
  savedReviewId?: string;
  savedProjectId?: string;
  modelUsed?: string;
  retrievedChunks?: {
    documentName: string;
    chunkIndex: number;
    relevanceScore: number;
    contentPreview: string;
  }[];
  jurisdictionChunks?: {
    id: string;
    jurisdictionId: string;
    jurisdictionName: string;
    jurisdictionDocumentId: string;
    documentName: string;
    documentType: string;
    chunkIndex: number;
    content: string;
    relevanceScore: number;
  }[];
};

async function getProjectForSave(body: AnalyzeDesignChangeRequest) {
  if (body.projectId && body.projectId !== "demo-project") {
    const supabase = createAdminClient();

    const { data: project, error } = await supabase
      .from("projects")
      .select("*")
      .eq("id", body.projectId)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return project;
  }

  return getOrCreateDemoProject();
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as AnalyzeDesignChangeRequest;

    if (!body.designChange || body.designChange.trim().length < 10) {
      return NextResponse.json(
        { error: "Design change description is too short." },
        { status: 400 }
      );
    }

    let result;
    let modelUsed = "gpt-4.1-mini";

    let enrichedBody: AnalyzeDesignChangeRequest & {
      jurisdictionContext?: string;
    } = body;

    let retrievedChunks: {
      documentName: string;
      chunkIndex: number;
      relevanceScore: number;
      contentPreview: string;
    }[] = [];

    let jurisdictionChunks: {
      id: string;
      jurisdictionId: string;
      jurisdictionName: string;
      jurisdictionDocumentId: string;
      documentName: string;
      documentType: string;
      chunkIndex: number;
      content: string;
      relevanceScore: number;
    }[] = [];

    if (body.projectId && body.projectId !== "demo-project") {
      try {
        const relevantDocumentChunks = await getRelevantDocumentChunks({
          projectId: body.projectId,
          designChange: body.designChange,
        });

        retrievedChunks = relevantDocumentChunks.retrievedChunks;

        let jurisdictionContext = "No jurisdiction-specific evidence was retrieved.";

        try {
          const project = await getProjectForSave(body);
          const projectForAnalyze = project as ProjectForAnalyze;


          jurisdictionChunks = await getRelevantJurisdictionChunks({
            projectLocation: projectForAnalyze.location,
            jurisdictionId: projectForAnalyze.jurisdiction_id ?? null,
            designChange: body.designChange,
            limit: 5,
          });

          jurisdictionContext =
            jurisdictionChunks.length > 0
              ? jurisdictionChunks
        .map(
          (chunk, index) => `
        JURISDICTION SOURCE ${index + 1}
        Jurisdiction: ${chunk.jurisdictionName}
        Document: ${chunk.documentName}
        Document Type: ${chunk.documentType}
        Chunk Index: ${chunk.chunkIndex}
        Relevance Score: ${chunk.relevanceScore}
        Content:
        ${chunk.content}
        `
        )
                  .join("\n")
              : "No jurisdiction-specific evidence was retrieved.";
        } catch (jurisdictionError) {
          console.warn("Failed to load jurisdiction chunks:", jurisdictionError);
        }

        enrichedBody = {
          ...body,
    documentContext: `
    RETRIEVED PERMIT PACKAGE EVIDENCE:
    ${relevantDocumentChunks.contextText}

    RETRIEVED JURISDICTION / COUNTY-CITY EVIDENCE:
    ${jurisdictionContext}
    `,
          jurisdictionContext,
        };
      } catch (contextError) {
        console.warn("Failed to load relevant document chunks:", contextError);

        try {
          const documentContext = await getProjectDocumentContext(body.projectId);
          enrichedBody = {
            ...body,
            documentContext,
          };
        } catch (fallbackContextError) {
          console.warn("Failed to load fallback document context:", fallbackContextError);
        }
      }
    }

    try {
      result = await openAIAnalyzeDesignChange(enrichedBody);
    } catch (openAIError) {
      console.warn(
        "OpenAI analysis failed. Falling back to mock analysis:",
        openAIError
      );

      result = mockAnalyzeDesignChange({
        designChange: body.designChange,
        documents: body.documents ?? [],
      });

      modelUsed = "mock-fallback";
    }

    let savedReviewId: string | undefined;
    let savedProjectId: string | undefined;

    try {
      const project = await getProjectForSave(body);
      const projectForAnalyze = project as ProjectForAnalyze;

      const savedReview = (await saveAIReview({
        projectId: projectForAnalyze.id,
        designChange: body.designChange,
        result,
        documents: body.documents ?? [],
        modelUsed,
        retrievedPermitChunks: retrievedChunks,
        retrievedJurisdictionChunks: jurisdictionChunks,
      })) as SavedAIReviewForAnalyze;

      savedReviewId = savedReview.id;
      savedProjectId = projectForAnalyze.id;

      savedReviewId = savedReview.id;
      savedProjectId = projectForAnalyze.id;
    } catch (dbError) {
      console.error("Supabase save failed:", dbError);
    }

    const response: AnalyzeResponseWithPersistence = {
      ok: true,
      result,
      savedReviewId,
      savedProjectId,
      modelUsed,
      retrievedChunks,
      jurisdictionChunks,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("AI analysis API error:", error);

    return NextResponse.json(
      { error: "Failed to analyze design change." },
      { status: 500 }
    );
  }
}