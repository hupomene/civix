import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

type SeedJurisdictionRow = {
  id: string;
  name: string;
};

type SeedJurisdictionDocumentRow = {
  id: string;
};



const COLLIN_COUNTY_SEED_TEXT = `
Collin County, Texas - Synthetic Jurisdiction Reference Pack for CIVIX Testing.

This jurisdiction reference is for internal CIVIX MVP testing only and does not replace official county review, adopted codes, or professional judgment.

Permit Portal Context:
Collin County permit and plan review workflows may use an online civic access or CSS-style portal for application submission, plan upload, review routing, and resubmission. Commercial tenant improvement projects may require plan sheets, supporting documentation, and review coordination depending on location and permit type.

Commercial Tenant Improvement Review Context:
Commercial interior renovation, tenant improvement, or change-of-layout work may require updated architectural, life safety, accessibility, mechanical, electrical, and plumbing drawings when the approved layout changes. Changes affecting restrooms, exits, exterior doors, occupant circulation, emergency lighting, plumbing fixtures, mechanical exhaust, or fire/life safety features may trigger revision review or resubmission.

Revision and Resubmittal Triggers:
A design change may require revision review when it changes the approved floor plan, restroom location, plumbing fixture layout, exit access path, exterior opening, door schedule, life safety plan, accessibility compliance, emergency lighting, mechanical exhaust, electrical device layout, or site/exterior coordination. Multi-discipline changes should be routed as a coordinated revision set.

Accessibility Review Considerations:
Restroom relocation should be reviewed for accessible route continuity, door maneuvering clearance, turning space, fixture clear floor space, lavatory clearance, grab bar coordination, and threshold conditions. Any new door affecting an accessible route should be reviewed for clear width, landing, hardware, threshold, and maneuvering space.

Life Safety and Egress Review Considerations:
Interior wall relocation and new exterior doors should be reviewed for exit access travel distance, egress width, door swing, exit signage, emergency lighting, corridor continuity, occupant load path, and potential changes to required exits or exit discharge. New exterior doors may require coordination with landing, exterior path, lighting, drainage, and fire access conditions.

MEP Coordination Review Considerations:
Restroom relocation may affect sanitary waste, vent, domestic water routing, cleanout access, exhaust fan location, diffuser coordination, lighting, receptacles, switches, and fixture schedules. Partition changes may affect electrical device placement, mechanical diffuser layout, lighting layout, and coordination with ceiling plans.

Document Types in This Jurisdiction Pack:
- permit_checklist
- revision_resubmittal
- adopted_code
- fire_marshal
- accessibility
- portal_instruction
`;

function splitIntoChunks(text: string, maxChars = 1200) {
  const paragraphs = text
    .split(/\n\s*\n/g)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  const chunks: string[] = [];
  let current = "";

  for (const paragraph of paragraphs) {
    if ((current + "\n\n" + paragraph).length > maxChars && current) {
      chunks.push(current.trim());
      current = paragraph;
    } else {
      current = current ? `${current}\n\n${paragraph}` : paragraph;
    }
  }

  if (current.trim()) {
    chunks.push(current.trim());
  }

  return chunks;
}

function estimateTokens(text: string) {
  return Math.ceil(text.length / 4);
}

export async function POST() {
  try {
    const supabase = createAdminClient();

    const { data: jurisdiction, error: jurisdictionError } = await supabase
      .from("jurisdictions")
      .select("id, name")
      .eq("name", "Collin County, TX")
      .single();

    if (jurisdictionError) {
      throw new Error(jurisdictionError.message);
    }

    const seedJurisdiction = jurisdiction as SeedJurisdictionRow;

    const documentName = "Collin County Synthetic Jurisdiction Reference Pack";

    const { data: existingDocument, error: existingDocumentError } =
      await supabase
        .from("jurisdiction_documents")
        .select("id")
        .eq("jurisdiction_id", seedJurisdiction.id)
        .eq("name", documentName)
        .maybeSingle();

    if (existingDocumentError) {
      throw new Error(existingDocumentError.message);
    }

    const seedExistingDocument =
      existingDocument as SeedJurisdictionDocumentRow | null;

    if (seedExistingDocument?.id) {
      await supabase
        .from("jurisdiction_chunks")
        .delete()
        .eq("jurisdiction_document_id", seedExistingDocument.id);

      await supabase
        .from("jurisdiction_documents")
        .delete()
        .eq("id", seedExistingDocument.id);
    }

    const { data: documentRow, error: insertDocumentError } = await supabase
      .from("jurisdiction_documents")
      .insert({
        jurisdiction_id: seedJurisdiction.id,
        name: documentName,
        document_type: "revision_resubmittal",
        source_type: "manual_seed",
        source_url: "https://www.collincountytx.gov/",
        mime_type: "text/plain",
        size_bytes: Buffer.byteLength(COLLIN_COUNTY_SEED_TEXT, "utf8"),
        extracted_text: COLLIN_COUNTY_SEED_TEXT,
        extracted_text_preview: COLLIN_COUNTY_SEED_TEXT.slice(0, 1000),
        extraction_status: "completed",
        extracted_at: new Date().toISOString(),
      } as any)
      .select("id")
      .single();

    if (insertDocumentError) {
      throw new Error(insertDocumentError.message);
    }

    const seedDocument = documentRow as SeedJurisdictionDocumentRow;
    const chunks = splitIntoChunks(COLLIN_COUNTY_SEED_TEXT);

    const chunkRows = chunks.map((chunk, index) => ({
      jurisdiction_document_id: seedDocument.id,
      jurisdiction_id: seedJurisdiction.id,
      chunk_index: index,
      content: chunk,
      token_estimate: estimateTokens(chunk),
      document_type: "revision_resubmittal",
    }));

    const { error: insertChunksError } = await supabase
      .from("jurisdiction_chunks")
      .insert(chunkRows as any);

    if (insertChunksError) {
      throw new Error(insertChunksError.message);
    }

    return NextResponse.json({
      ok: true,
      jurisdictionId: seedJurisdiction.id,
      jurisdictionName: seedJurisdiction.name,
      documentId: seedDocument.id,
      chunkCount: chunkRows.length,
    });
  } catch (error) {
    console.error("Failed to seed Collin County jurisdiction pack:", error);

    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to seed Collin County jurisdiction pack.",
      },
      { status: 500 }
    );
  }
}