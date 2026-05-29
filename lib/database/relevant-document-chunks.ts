import { createAdminClient } from "@/lib/supabase/admin";

type RelevantDocumentChunkRow = {
  id: string;
  document_id: string;
  project_id: string;
  chunk_index: number;
  content: string;
  content_preview: string | null;
  token_estimate: number | null;
  uploaded_documents:
    | {
        name: string | null;
      }
    | {
        name: string | null;
      }[]
    | null;
};

const DOMAIN_SYNONYMS: Record<string, string[]> = {
  restroom: [
    "restroom",
    "bathroom",
    "lavatory",
    "toilet",
    "water closet",
    "fixture",
    "accessibility",
    "accessible",
    "ada",
    "clearance",
    "turning",
    "grab bar",
  ],
  bathroom: [
    "restroom",
    "bathroom",
    "lavatory",
    "toilet",
    "water closet",
    "fixture",
    "plumbing",
    "clearance",
    "accessibility",
  ],
  door: [
    "door",
    "egress",
    "exit",
    "threshold",
    "landing",
    "hardware",
    "swing",
    "clearance",
    "exterior",
    "life safety",
  ],
  egress: [
    "egress",
    "exit",
    "travel distance",
    "path",
    "corridor",
    "occupant",
    "door swing",
    "life safety",
  ],
  wall: [
    "wall",
    "partition",
    "interior wall",
    "corridor",
    "room layout",
    "travel path",
    "life safety",
  ],
  walls: [
    "wall",
    "walls",
    "partition",
    "interior wall",
    "corridor",
    "room layout",
    "travel path",
  ],
  plumbing: [
    "plumbing",
    "fixture",
    "water",
    "sanitary",
    "vent",
    "lavatory",
    "water closet",
    "pipe",
    "routing",
  ],
  hvac: [
    "hvac",
    "mechanical",
    "exhaust",
    "fan",
    "diffuser",
    "duct",
    "air",
    "ventilation",
  ],
  mechanical: [
    "mechanical",
    "hvac",
    "exhaust",
    "fan",
    "diffuser",
    "duct",
    "ventilation",
  ],
  electrical: [
    "electrical",
    "lighting",
    "power",
    "panel",
    "device",
    "receptacle",
    "exit sign",
    "emergency lighting",
  ],
  structural: [
    "structural",
    "beam",
    "column",
    "load-bearing",
    "framing",
    "engineer",
    "stamped",
  ],
};

const STOP_WORDS = new Set([
  "that",
  "this",
  "with",
  "from",
  "near",
  "area",
  "will",
  "move",
  "moving",
  "change",
  "design",
  "adding",
  "additional",
  "into",
  "onto",
  "over",
  "under",
  "also",
  "have",
  "been",
  "were",
  "are",
]);

function tokenize(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .map((word) => word.trim())
    .filter((word) => word.length >= 3)
    .filter((word) => !STOP_WORDS.has(word));
}

function expandKeywords(designChange: string) {
  const baseKeywords = tokenize(designChange);
  const expanded = new Set<string>();

  baseKeywords.forEach((keyword) => {
    expanded.add(keyword);

    const synonyms = DOMAIN_SYNONYMS[keyword];

    if (synonyms) {
      synonyms.forEach((synonym) => expanded.add(synonym));
    }
  });

  return Array.from(expanded).slice(0, 35);
}

function scoreChunk(content: string, keywords: string[]) {
  const lowerContent = content.toLowerCase();

  return keywords.reduce((score, keyword) => {
    const lowerKeyword = keyword.toLowerCase();

    if (lowerContent.includes(lowerKeyword)) {
      return score + (keyword.includes(" ") ? 2 : 1);
    }

    return score;
  }, 0);
}

export async function getRelevantDocumentChunks({
  projectId,
  designChange,
}: {
  projectId: string;
  designChange: string;
}) {
  const supabase = createAdminClient();
  const keywords = expandKeywords(designChange);

  if (keywords.length === 0) {
    return {
      contextText: "No specific document chunks were retrieved.",
      retrievedChunks: [],
    };
  }

  const { data, error } = await supabase
    .from("document_chunks")
    .select("content, content_preview, chunk_index, uploaded_documents(name)")
    .eq("project_id", projectId)
    .limit(50);

  if (error) {
    throw new Error(error.message);
  }

  if (!data || data.length === 0) {
    return {
      contextText: "No document chunks are available for this project.",
      retrievedChunks: [],
    };
  }

  const chunkRows = (data ?? []) as unknown as RelevantDocumentChunkRow[];

  const rankedChunks = chunkRows
    .map((chunk) => {
      const score = scoreChunk(chunk.content, keywords);

      return {
        ...chunk,
        score,
      };
    })
    .filter((chunk) => chunk.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);

  if (rankedChunks.length === 0) {
    return {
      contextText:
        "No highly relevant document chunks were found for this design change.",
      retrievedChunks: [],
    };
  }

  const retrievedChunks = rankedChunks.map((chunk) => {
    const documentName = Array.isArray(chunk.uploaded_documents)
      ? chunk.uploaded_documents[0]?.name
      : chunk.uploaded_documents?.name;

    return {
      documentName: documentName ?? "Unknown document",
      chunkIndex: chunk.chunk_index,
      relevanceScore: chunk.score,
      contentPreview: chunk.content_preview ?? chunk.content.slice(0, 300),
    };
  });

  const contextText = rankedChunks
    .map((chunk, index) => {
      const documentName = Array.isArray(chunk.uploaded_documents)
        ? chunk.uploaded_documents[0]?.name
        : chunk.uploaded_documents?.name;

      return `Relevant Chunk ${index + 1}
Document: ${documentName ?? "Unknown document"}
Chunk Index: ${chunk.chunk_index}
Relevance Score: ${chunk.score}
Content:
${chunk.content}`;
    })
    .join("\n\n---\n\n");

  return {
    contextText,
    retrievedChunks,
  };
}