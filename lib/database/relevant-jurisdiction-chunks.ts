import { createAdminClient } from "@/lib/supabase/admin";
import type { RetrievedJurisdictionChunk } from "@/types/ai-review";

type JurisdictionChunkRow = {
  id: string;
  jurisdiction_document_id: string;
  jurisdiction_id: string;
  chunk_index: number;
  content: string;
  document_type: string;
  jurisdiction_documents: {
    name: string;
  } | null;
  jurisdictions: {
    name: string;
  } | null;
};

type JurisdictionRow = {
  id: string;
  name: string;
  state: string;
  county: string | null;
  city: string | null;
  jurisdiction_type: string;
};

const DOMAIN_SYNONYMS: Record<string, string[]> = {
  restroom: [
    "restroom",
    "toilet",
    "lavatory",
    "fixture",
    "plumbing",
    "sanitary",
    "vent",
    "water",
    "accessibility",
    "turning space",
    "clear floor space",
    "grab bar",
  ],
  wall: [
    "wall",
    "partition",
    "interior wall",
    "layout",
    "floor plan",
    "egress",
    "corridor",
    "life safety",
    "electrical device",
    "mechanical diffuser",
  ],
  door: [
    "door",
    "exterior door",
    "exit",
    "egress",
    "door swing",
    "landing",
    "threshold",
    "emergency lighting",
    "exit signage",
    "fire access",
  ],
  exterior: [
    "exterior",
    "site",
    "landing",
    "threshold",
    "drainage",
    "fire access",
    "exit discharge",
    "lighting",
  ],
  permit: [
    "permit",
    "revision",
    "resubmittal",
    "review",
    "portal",
    "county",
    "commercial",
    "tenant improvement",
    "plan review",
  ],
};

function tokenize(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token.length >= 3);
}

function buildQueryTerms(designChange: string) {
  const baseTerms = tokenize(designChange);
  const expandedTerms = new Set(baseTerms);

  const lowerChange = designChange.toLowerCase();

  for (const [trigger, synonyms] of Object.entries(DOMAIN_SYNONYMS)) {
    if (lowerChange.includes(trigger)) {
      for (const synonym of synonyms) {
        expandedTerms.add(synonym.toLowerCase());
      }
    }
  }

  return Array.from(expandedTerms);
}

function scoreChunk(content: string, queryTerms: string[]) {
  const lowerContent = content.toLowerCase();
  let score = 0;

  for (const term of queryTerms) {
    if (lowerContent.includes(term)) {
      score += term.includes(" ") ? 5 : 2;
    }
  }

  const highValueTerms = [
    "revision",
    "resubmittal",
    "accessibility",
    "life safety",
    "egress",
    "exterior door",
    "restroom relocation",
    "permit",
    "commercial",
    "tenant improvement",
    "portal",
    "mechanical",
    "electrical",
    "plumbing",
  ];

  for (const term of highValueTerms) {
    if (lowerContent.includes(term)) {
      score += 4;
    }
  }

  return score;
}

function normalizeText(value: string | null | undefined) {
  return value?.toLowerCase().trim() ?? "";
}

function findMatchingJurisdiction(
  projectLocation: string | null | undefined,
  jurisdictions: JurisdictionRow[]
) {
  const normalizedLocation = normalizeText(projectLocation);

  if (!normalizedLocation) {
    return null;
  }

  return (
    jurisdictions.find((jurisdiction) =>
      normalizedLocation.includes(normalizeText(jurisdiction.name))
    ) ??
    jurisdictions.find(
      (jurisdiction) =>
        jurisdiction.county &&
        normalizedLocation.includes(normalizeText(jurisdiction.county))
    ) ??
    jurisdictions.find(
      (jurisdiction) =>
        jurisdiction.city &&
        normalizedLocation.includes(normalizeText(jurisdiction.city))
    ) ??
    null
  );
}

export async function getRelevantJurisdictionChunks({
  projectLocation,
  jurisdictionId,
  designChange,
  limit = 5,
}: {
  projectLocation?: string | null;
  jurisdictionId?: string | null;
  designChange: string;
  limit?: number;
}): Promise<RetrievedJurisdictionChunk[]> {
  
  const supabase = createAdminClient();
  const queryTerms = buildQueryTerms(designChange);

  let jurisdiction: JurisdictionRow | null = null;

  if (jurisdictionId) {
    const { data: jurisdictionById, error: jurisdictionByIdError } =
      await supabase
        .from("jurisdictions")
        .select("id, name, state, county, city, jurisdiction_type")
        .eq("id", jurisdictionId)
        .eq("is_active", true)
        .maybeSingle();

    if (jurisdictionByIdError) {
      throw new Error(jurisdictionByIdError.message);
    }

    jurisdiction = jurisdictionById as JurisdictionRow | null;
  }

  if (!jurisdiction) {
    const { data: jurisdictions, error: jurisdictionError } = await supabase
      .from("jurisdictions")
      .select("id, name, state, county, city, jurisdiction_type")
      .eq("is_active", true);

    if (jurisdictionError) {
      throw new Error(jurisdictionError.message);
    }

    jurisdiction = findMatchingJurisdiction(
      projectLocation,
      (jurisdictions ?? []) as JurisdictionRow[]
    );
  }

  if (!jurisdiction) {
    return [];
  }

  const { data: rows, error } = await supabase
    .from("jurisdiction_chunks")
    .select(
      `
      id,
      jurisdiction_document_id,
      jurisdiction_id,
      chunk_index,
      content,
      document_type,
      jurisdiction_documents (
        name
      ),
      jurisdictions (
        name
      )
    `
    )
    .eq("jurisdiction_id", jurisdiction.id)
    .limit(50);

  if (error) {
    throw new Error(error.message);
  }

  const scored = ((rows ?? []) as JurisdictionChunkRow[])
    .map((row) => ({
      row,
      score: scoreChunk(row.content, queryTerms),
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return scored.map(({ row, score }) => ({
    id: row.id,
    jurisdictionId: row.jurisdiction_id,
    jurisdictionName: row.jurisdictions?.name ?? jurisdiction.name,
    jurisdictionDocumentId: row.jurisdiction_document_id,
    documentName:
      row.jurisdiction_documents?.name ??
      "Unknown jurisdiction reference document",
    documentType: row.document_type,
    chunkIndex: row.chunk_index,
    content: row.content,
    relevanceScore: score,
  }));
}