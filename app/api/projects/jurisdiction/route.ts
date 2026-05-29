import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

type UpdateProjectJurisdictionRequest = {
  projectId: string;
  jurisdictionId: string | null;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as UpdateProjectJurisdictionRequest;

    if (!body.projectId) {
      return NextResponse.json(
        { ok: false, error: "Missing projectId." },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    if (body.jurisdictionId) {
      const { data: jurisdiction, error: jurisdictionError } = await supabase
        .from("jurisdictions")
        .select("id")
        .eq("id", body.jurisdictionId)
        .maybeSingle();

      if (jurisdictionError) {
        throw new Error(jurisdictionError.message);
      }

      if (!jurisdiction) {
        return NextResponse.json(
          {
            ok: false,
            error: `Jurisdiction not found for id: ${body.jurisdictionId}`,
          },
          { status: 404 }
        );
      }
    }

    const { data: project, error: updateError } = await (supabase as any)
      .from("projects")
      .update({
        jurisdiction_id: body.jurisdictionId,
      })
      .eq("id", body.projectId)
      .select("id, name, jurisdiction_id")
      .single();

    if (updateError) {
      throw new Error(updateError.message);
    }

    return NextResponse.json({
      ok: true,
      project,
    });
  } catch (error) {
    console.error("Failed to update project jurisdiction:", error);

    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to update project jurisdiction.",
      },
      { status: 500 }
    );
  }
}