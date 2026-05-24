import { NextResponse } from "next/server";
import { mockAnalyzeDesignChange } from "@/lib/ai/mock-analyze-design-change";
import { openAIAnalyzeDesignChange } from "@/lib/ai/openai-analyze-design-change";
import { getOrCreateDemoProject } from "@/lib/database/demo-project";
import { saveAIReview } from "@/lib/database/ai-reviews";
import type {
  AnalyzeDesignChangeRequest,
  AnalyzeDesignChangeResponse,
} from "@/types/ai-review";

type AnalyzeResponseWithPersistence = AnalyzeDesignChangeResponse & {
  savedReviewId?: string;
  savedProjectId?: string;
  modelUsed?: string;
};

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

    try {
      result = await openAIAnalyzeDesignChange(body);
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
      const project = await getOrCreateDemoProject();

      const savedReview = await saveAIReview({
        projectId: project.id,
        designChange: body.designChange,
        result,
        documents: body.documents ?? [],
        modelUsed,
      });

      savedReviewId = savedReview.id;
      savedProjectId = project.id;
    } catch (dbError) {
      console.error("Supabase save failed:", dbError);
    }

    const response: AnalyzeResponseWithPersistence = {
      result,
      savedReviewId,
      savedProjectId,
      modelUsed,
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