import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

type RouteContext = {
  params: Promise<{
    projectId: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { projectId } = await context.params;

    if (!projectId) {
      return NextResponse.json(
        {
          ok: false,
          error: "Missing project id.",
        },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const { data: reviews, error } = await supabase
      .from("ai_reviews")
      .select(
        "id, project_id, design_change, impact_summary, affected_documents, risks, checklist, evidence_notes, model_used, retrieved_permit_chunks, retrieved_jurisdiction_chunks, created_at"
      )
      .eq("project_id", projectId)
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({
      ok: true,
      reviews: reviews ?? [],
    });
  } catch (error) {
    console.error("Failed to load review history:", error);

    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to load review history.",
      },
      { status: 500 }
    );
  }
}