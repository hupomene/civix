import type {
  AIReviewResult,
  UploadedDocument,
} from "@/types/ai-review";

export function mockAnalyzeDesignChange({
  designChange,
  documents,
}: {
  designChange: string;
  documents: UploadedDocument[];
}): AIReviewResult {
  const text = designChange.toLowerCase();

  const affectedDocuments = new Set<string>();
  const risks: AIReviewResult["risks"] = [];
  const checklist = new Set<string>();

  affectedDocuments.add("Permit Application Narrative");
  affectedDocuments.add("Architectural Floor Plan A-101");

  checklist.add("Update project narrative to describe the revised scope.");
  checklist.add("Confirm whether the city requires permit resubmission.");
  checklist.add(
    "Route revised package to architect, engineer, and permit consultant."
  );

  if (documents.length === 0) {
    risks.push({
      title: "No permit package has been uploaded for document comparison.",
      level: "High",
    });

    checklist.add(
      "Upload the current permit package before finalizing the review."
    );
  }

  if (text.includes("restroom") || text.includes("bathroom")) {
    affectedDocuments.add("Plumbing Plan P-101");
    affectedDocuments.add("Accessibility Details A-501");
    affectedDocuments.add("Fixture Schedule P-601");

    risks.push({
      title:
        "Restroom relocation may affect ADA clearance and fixture count requirements.",
      level: "Medium",
    });

    checklist.add(
      "Verify ADA restroom turning radius, grab bar clearance, and door swing."
    );
    checklist.add("Update plumbing plan P-101 for new fixture locations.");
    checklist.add("Update plumbing fixture schedule.");
  }

  if (text.includes("wall") || text.includes("walls")) {
    affectedDocuments.add("Architectural Floor Plan A-101");
    affectedDocuments.add("Life Safety / Egress Plan LS-101");

    risks.push({
      title:
        "Interior wall changes may affect room layout, egress path, and occupancy review.",
      level: "Medium",
    });

    checklist.add(
      "Confirm whether modified walls are load-bearing or non-load-bearing."
    );
    checklist.add(
      "Update floor plan and life safety plan if travel path changes."
    );
  }

  if (text.includes("door") || text.includes("egress")) {
    affectedDocuments.add("Door Schedule A-601");
    affectedDocuments.add("Life Safety / Egress Plan LS-101");

    risks.push({
      title:
        "New exterior door may affect egress, accessibility, and energy envelope review.",
      level: "High",
    });

    checklist.add("Update door schedule and exterior elevation if applicable.");
    checklist.add(
      "Review egress width, landing clearance, threshold, and accessibility requirements."
    );
  }

  if (
    text.includes("structural") ||
    text.includes("beam") ||
    text.includes("column")
  ) {
    affectedDocuments.add("Structural Plan S-101");
    affectedDocuments.add("Structural Notes S-001");

    risks.push({
      title:
        "Structural scope change may require engineer review and revised stamped drawings.",
      level: "High",
    });

    checklist.add("Route revised scope to structural engineer for review.");
    checklist.add(
      "Confirm whether revised stamped structural sheets are required."
    );
  }

  if (
    text.includes("electrical") ||
    text.includes("lighting") ||
    text.includes("panel")
  ) {
    affectedDocuments.add("Electrical Plan E-101");
    affectedDocuments.add("Panel Schedule E-601");

    risks.push({
      title:
        "Electrical changes may affect load calculations, panel schedules, and inspection scope.",
      level: "Medium",
    });

    checklist.add("Update electrical plan and panel schedule.");
    checklist.add("Verify circuiting, load impact, and inspection requirements.");
  }

  if (
    text.includes("hvac") ||
    text.includes("mechanical") ||
    text.includes("duct")
  ) {
    affectedDocuments.add("Mechanical Plan M-101");
    affectedDocuments.add("Mechanical Schedule M-601");

    risks.push({
      title:
        "Mechanical changes may affect HVAC layout, duct routing, and equipment schedules.",
      level: "Medium",
    });

    checklist.add("Update mechanical plan and equipment schedule.");
    checklist.add(
      "Check whether duct routing conflicts with architectural changes."
    );
  }

  if (risks.length === 0) {
    risks.push({
      title: "General design revision requires document consistency review.",
      level: "Low",
    });

    checklist.add(
      "Compare revised scope against architectural, MEP, and permit documents."
    );
  }

  const documentContext =
    documents.length > 0
      ? `CIVIX found ${documents.length} uploaded document(s) available for review.`
      : "CIVIX did not find any uploaded permit package documents.";

  return {
    impactSummary: `${documentContext} CIVIX reviewed the proposed design change: "${designChange}". Based on the described scope, the change may affect ${Array.from(
      affectedDocuments
    )
      .slice(0, 4)
      .join(
        ", "
      )}. Recommended next steps include document updates, discipline coordination, compliance review, and confirmation of permit resubmission requirements.`,
    affectedDocuments: Array.from(affectedDocuments),
    risks,
    checklist: Array.from(checklist),
    evidenceNotes: [
      "Mock review generated from design change keywords and uploaded document metadata.",
      "Professional validation is required before using this review for permit decisions.",
    ],
  };
}