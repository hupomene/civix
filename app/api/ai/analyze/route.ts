import { NextResponse } from "next/server";
import { mockAnalyzeDesignChange } from "@/lib/ai/mock-analyze-design-change";
import { openAIAnalyzeDesignChange } from "@/lib/ai/openai-analyze-design-change";
import type {
  AnalyzeDesignChangeRequest,
  AnalyzeDesignChangeResponse,
} from "@/types/ai-review";

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
    }

    const response: AnalyzeDesignChangeResponse = {
      result,
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