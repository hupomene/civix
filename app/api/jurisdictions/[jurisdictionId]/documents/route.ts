import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

type RouteContext = {
  params: Promise<{
    jurisdictionId: string;
  }>;
};

type JurisdictionForDocuments = {
  id: string;
  name: string;
  state: string;
  county: string | null;
  city: string | null;
  jurisdiction_type: string;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { jurisdictionId } = await context.params;

    if (!jurisdictionId) {
      return NextResponse.json(
        {
          ok: false,
          error: "Missing jurisdictionId.",
        },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const { data: jurisdiction, error: jurisdictionError } = await supabase
      .from("jurisdictions")
      .select("id, name, state, county, city, jurisdiction_type")
      .eq("id", jurisdictionId)
      .maybeSingle();

    if (jurisdictionError) {
      throw new Error(jurisdictionError.message);
    }

    if (!jurisdiction) {
      return NextResponse.json(
        {
          ok: false,
          error: `Jurisdiction not found for id: ${jurisdictionId}`,
        },
        { status: 404 }
      );
    }

    const jurisdictionForDocuments =
      jurisdiction as JurisdictionForDocuments;

    const { data: documents, error: documentsError } = await supabase
      .from("jurisdiction_documents")
      .select(
        "id, jurisdiction_id, name, document_type, source_type, source_url, storage_path, mime_type, size_bytes, extraction_status, extracted_at, created_at"
      )
      .eq("jurisdiction_id", jurisdictionForDocuments.id)
      .order("created_at", { ascending: false });

    if (documentsError) {
      throw new Error(documentsError.message);
    }

    return NextResponse.json({
      ok: true,
      jurisdiction,
      documents: documents ?? [],
    });
  } catch (error) {
    console.error("Failed to load jurisdiction documents:", error);

    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to load jurisdiction documents.",
      },
      { status: 500 }
    );
  }
}