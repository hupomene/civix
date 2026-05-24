import { NextResponse } from "next/server";
import { getDemoProjectWorkspaceData } from "@/lib/database/project-workspace";

export async function GET() {
  try {
    const workspace = await getDemoProjectWorkspaceData();

    return NextResponse.json({
      ok: true,
      workspace,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to load project workspace.",
      },
      { status: 500 }
    );
  }
}