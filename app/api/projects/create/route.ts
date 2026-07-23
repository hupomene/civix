import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

type CreateProjectRequest = {
  name: string;
  location?: string;
  projectType?: string;
  jurisdictionId?: string | null;
  projectState?: string | null;
  projectCounty?: string | null;
  projectCity?: string | null;
};

type CreatedProjectRow = {
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
};

type JurisdictionRow = {
  id: string;
  name: string;
  state: string;
  county: string | null;
  city: string | null;
  jurisdiction_type: string;
};

function normalizeText(value: string | null | undefined) {
  return value?.toLowerCase().trim() ?? "";
}

function normalizeCounty(value: string | null | undefined) {
  const trimmed = value?.trim();

  if (!trimmed) {
    return null;
  }

  return trimmed.toLowerCase().endsWith("county")
    ? trimmed
    : `${trimmed} County`;
}

function findMatchingJurisdiction(
  projectLocation: string | null | undefined,
  jurisdictions: JurisdictionRow[],
  projectState?: string | null,
  projectCounty?: string | null,
  projectCity?: string | null
) {
  const normalizedLocation = normalizeText(projectLocation);
  const normalizedState = normalizeText(projectState);
  const normalizedCounty = normalizeText(normalizeCounty(projectCounty));
  const normalizedCity = normalizeText(projectCity);

  if (normalizedState && normalizedCounty && normalizedCity) {
    const cityMatch = jurisdictions.find(
      (jurisdiction) =>
        normalizeText(jurisdiction.state) === normalizedState &&
        normalizeText(jurisdiction.county) === normalizedCounty &&
        normalizeText(jurisdiction.city) === normalizedCity &&
        normalizeText(jurisdiction.jurisdiction_type) === "city"
    );

    if (cityMatch) {
      return cityMatch;
    }
  }

  if (normalizedState && normalizedCounty) {
    const countyMatch = jurisdictions.find(
      (jurisdiction) =>
        normalizeText(jurisdiction.state) === normalizedState &&
        normalizeText(jurisdiction.county) === normalizedCounty &&
        normalizeText(jurisdiction.jurisdiction_type) === "county"
    );

    if (countyMatch) {
      return countyMatch;
    }
  }

  if (!normalizedLocation) {
    return null;
  }

  return (
    jurisdictions.find(
      (jurisdiction) =>
        jurisdiction.city &&
        normalizedLocation.includes(normalizeText(jurisdiction.city)) &&
        normalizeText(jurisdiction.jurisdiction_type) === "city"
    ) ??
    jurisdictions.find((jurisdiction) =>
      normalizedLocation.includes(normalizeText(jurisdiction.name))
    ) ??
    jurisdictions.find(
      (jurisdiction) =>
        jurisdiction.county &&
        normalizedLocation.includes(normalizeText(jurisdiction.county))
    ) ??
    null
  );
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreateProjectRequest;

    if (!body.name || body.name.trim().length < 2) {
      return NextResponse.json(
        {
          ok: false,
          error: "Project name is required.",
        },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    let resolvedJurisdictionId = body.jurisdictionId ?? null;

    if (!resolvedJurisdictionId && body.location?.trim()) {
      const { data: jurisdictions, error: jurisdictionsError } = await supabase
        .from("jurisdictions")
        .select("id, name, state, county, city, jurisdiction_type")
        .eq("is_active", true);

      if (jurisdictionsError) {
        throw new Error(jurisdictionsError.message);
      }

      const matchedJurisdiction = findMatchingJurisdiction(
        body.location,
        (jurisdictions ?? []) as JurisdictionRow[],
        body.projectState,
        body.projectCounty,
        body.projectCity
      );

      resolvedJurisdictionId = matchedJurisdiction?.id ?? null;
    }

    const { data: project, error } = await supabase
      .from("projects")
      .insert({
        name: body.name.trim(),
        location: body.location?.trim() || null,
        project_type: body.projectType?.trim() || "Construction Project",
        jurisdiction_id: resolvedJurisdictionId,
        project_state: body.projectState?.trim() || null,
        project_county: body.projectCounty?.trim() || null,
        status: "Permit Review",
        risk_level: "Medium",
        project_city: body.projectCity?.trim() || null,
      } as any)
      .select("*")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    const createdProject = project as CreatedProjectRow;

    return NextResponse.json({
      ok: true,
      project: {
        id: createdProject.id,
        name: createdProject.name,
        location: createdProject.location ?? "No location provided",
        type: createdProject.project_type ?? "Construction Project",
        status: createdProject.status,
        risk: createdProject.risk_level as "Low" | "Medium" | "High",
        documents: 0,
        openItems: 0,
        createdAt: createdProject.created_at,
        jurisdictionId: createdProject.jurisdiction_id ?? null,
        jurisdictionName: null,
        projectState: createdProject.project_state ?? null,
        projectCounty: createdProject.project_county ?? null,
        projectCity: createdProject.project_city ?? null,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to create project.",
      },
      { status: 500 }
    );
  }
}