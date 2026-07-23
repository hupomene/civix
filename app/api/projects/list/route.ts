import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
type ProjectListRow = {
  id: string;
  name: string;
  location: string | null;
  project_type: string | null;
  status: string;
  risk_level: string;
  created_at: string;
  jurisdiction_id: string | null;
  project_state: string | null;
  project_county: string | null;
  project_city: string | null;
  jurisdictions:
    | {
        id: string;
        name: string;
      }
    | {
        id: string;
        name: string;
      }[]
    | null;
};

type DocumentCountRow = {
  project_id: string;
};

type ReviewCountRow = {
  project_id: string;
};

export async function GET() {
  try {
    const supabase = createAdminClient();

    const { data: projects, error } = await supabase
      .from("projects")
      .select(`
        *,
        jurisdictions (
          id,
          name
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    const projectRows = (projects ?? []) as unknown as ProjectListRow[];

    const projectIds = projectRows.map((project) => project.id);

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

    const documentRows = (documents ?? []) as unknown as DocumentCountRow[];

    const documentCountByProject = new Map<string, number>();

    documentRows.forEach((document) => {
      documentCountByProject.set(
        document.project_id,
        (documentCountByProject.get(document.project_id) ?? 0) + 1
      );
    });

    const reviewRows = (reviews ?? []) as unknown as ReviewCountRow[];

    const openItemsByProject = new Map<string, number>();

    reviewRows.forEach((review) => {
      openItemsByProject.set(
        review.project_id,
        (openItemsByProject.get(review.project_id) ?? 0) + 1
      );
    });

    const enrichedProjects = projectRows.map((project) => {
      const jurisdiction = Array.isArray(project.jurisdictions)
        ? project.jurisdictions[0]
        : project.jurisdictions;

      return {
        id: project.id,
        name: project.name,
        location: project.location ?? "No location provided",
        type: project.project_type ?? "Construction Project",
        status: project.status,
        risk: project.risk_level as "Low" | "Medium" | "High",
        documents: documentCountByProject.get(project.id) ?? 0,
        openItems: openItemsByProject.get(project.id) ?? 0,
        createdAt: project.created_at,
        jurisdictionId: project.jurisdiction_id ?? null,
        jurisdictionName: jurisdiction?.name ?? null,
        projectState: project.project_state ?? null,
        projectCounty: project.project_county ?? null,
        projectCity: project.project_city ?? null,
      };
    });

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