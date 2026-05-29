export type TextChunk = {
  chunkIndex: number;
  content: string;
  contentPreview: string;
  tokenEstimate: number;
};

function estimateTokens(text: string) {
  return Math.ceil(text.length / 4);
}

export function chunkText(text: string, maxChars = 1800, overlapChars = 250) {
  const normalized = text
    .replace(/\r/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  if (!normalized) {
    return [];
  }

  const chunks: TextChunk[] = [];
  let start = 0;
  let chunkIndex = 0;

  while (start < normalized.length) {
    const end = Math.min(start + maxChars, normalized.length);
    const content = normalized.slice(start, end).trim();

    if (content) {
      chunks.push({
        chunkIndex,
        content,
        contentPreview: content.slice(0, 300),
        tokenEstimate: estimateTokens(content),
      });

      chunkIndex += 1;
    }

    if (end >= normalized.length) {
      break;
    }

    start = Math.max(0, end - overlapChars);
  }

  return chunks;
}