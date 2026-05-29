import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

type DeleteReviewRequest = {
  reviewId: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as DeleteReviewRequest;

    if (!body.reviewId) {
      return NextResponse.json(
        {
          ok: false,
          error: "Missing reviewId.",
        },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const { error } = await supabase
      .from("ai_reviews")
      .delete()
      .eq("id", body.reviewId);

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({
      ok: true,
      deletedReviewId: body.reviewId,
    });
  } catch (error) {
    console.error("Review delete failed:", error);

    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error ? error.message : "Failed to delete review.",
      },
      { status: 500 }
    );
  }
}