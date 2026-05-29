import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

type DashboardReviewRiskRow = {
  risks: unknown;
};

export async function GET() {
  try {
    const supabase = createAdminClient();

    const [
      projectsResult,
      documentsResult,
      reviewsResult,
      risksResult,
      recentReviewsResult,
      recentProjectsResult,
    ] = await Promise.all([
      supabase.from("projects").select("id", { count: "exact", head: true }),
      supabase
        .from("uploaded_documents")
        .select("id", { count: "exact", head: true }),
      supabase.from("ai_reviews").select("id", { count: "exact", head: true }),
      supabase
        .from("ai_reviews")
        .select("risks")
        .order("created_at", { ascending: false })
        .limit(25),
      supabase
        .from("ai_reviews")
        .select("id, design_change, model_used, created_at")
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

    if (projectsResult.error) throw new Error(projectsResult.error.message);
    if (documentsResult.error) throw new Error(documentsResult.error.message);
    if (reviewsResult.error) throw new Error(reviewsResult.error.message);
    if (risksResult.error) throw new Error(risksResult.error.message);
    if (recentReviewsResult.error)
      throw new Error(recentReviewsResult.error.message);
    if (recentProjectsResult.error)
      throw new Error(recentProjectsResult.error.message);

    const riskRows = (risksResult.data ?? []) as unknown as DashboardReviewRiskRow[];

    const openRisks = riskRows.reduce((total, review) => {
      if (!Array.isArray(review.risks)) return total;

      return total + review.risks.length;
    }, 0);

    return NextResponse.json({
      ok: true,
      stats: {
        activeProjects: projectsResult.count ?? 0,
        documentsReviewed: documentsResult.count ?? 0,
        aiReviewsCompleted: reviewsResult.count ?? 0,
        openRisks,
      },
      recentReviews: recentReviewsResult.data ?? [],
      recentProjects: recentProjectsResult.data ?? [],
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to load dashboard data.",
      },
      { status: 500 }
    );
  }
}