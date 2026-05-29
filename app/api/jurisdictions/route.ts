import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const supabase = createAdminClient();

    const { data: jurisdictions, error } = await supabase
      .from("jurisdictions")
      .select(
        "id, name, state, county, city, jurisdiction_type, description, source_url, is_active, created_at"
      )
      .eq("is_active", true)
      .order("name", { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({
      ok: true,
      jurisdictions: jurisdictions ?? [],
    });
  } catch (error) {
    console.error("Failed to load jurisdictions:", error);

    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to load jurisdictions.",
      },
      { status: 500 }
    );
  }
}