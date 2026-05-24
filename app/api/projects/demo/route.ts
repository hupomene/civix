import { NextResponse } from "next/server";
import { getOrCreateDemoProject } from "@/lib/database/demo-project";

export async function GET() {
  try {
    const project = await getOrCreateDemoProject();

    return NextResponse.json({
      ok: true,
      project,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to load demo project.",
      },
      { status: 500 }
    );
  }
}