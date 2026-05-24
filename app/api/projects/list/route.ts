import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const supabase = createAdminClient();

    const { data: projects, error } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    const projectIds = projects.map((project) => project.id);

    const { data: documents, error: documentsError } = await supabase
      .from("uploaded_documents")
      .select("project_id")
      .in("project_id", projectIds.length > 0 ? projectIds : ["00000000-0000-0000-0000-000000000000"]);

    if (documentsError) {
      throw new Error(documentsError.message);
    }

    const { data: reviews, error: reviewsError } = await supabase
      .from("ai_reviews")
      .select("project_id, risks")
      .in("project_id", projectIds.length > 0 ? projectIds : ["00000000-0000-0000-0000-000000000000"]);

    if (reviewsError) {
      throw new Error(reviewsError.message);
    }

    const documentCountByProject = new Map<string, number>();
    documents.forEach((document) => {
      documentCountByProject.set(
        document.project_id,
        (documentCountByProject.get(document.project_id) ?? 0) + 1
      );
    });

    const openItemsByProject = new Map<string, number>();
    reviews.forEach((review) => {
      const riskCount = Array.isArray(review.risks) ? review.risks.length : 0;
      openItemsByProject.set(
        review.project_id,
        (openItemsByProject.get(review.project_id) ?? 0) + riskCount
      );
    });

    const enrichedProjects = projects.map((project) => ({
      id: project.id,
      name: project.name,
      location: project.location ?? "No location provided",
      type: project.project_type ?? "Construction Project",
      status: project.status,
      risk: project.risk_level as "Low" | "Medium" | "High",
      documents: documentCountByProject.get(project.id) ?? 0,
      openItems: openItemsByProject.get(project.id) ?? 0,
      createdAt: project.created_at,
    }));

    return NextResponse.json({
      ok: true,
      projects: enrichedProjects,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to load projects.",
      },
      { status: 500 }
    );
  }
}