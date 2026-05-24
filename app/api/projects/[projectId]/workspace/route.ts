import { NextResponse } from "next/server";
import { getProjectWorkspaceData } from "@/lib/database/project-workspace";

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

    const workspace = await getProjectWorkspaceData(projectId);

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