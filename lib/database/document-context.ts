import { createAdminClient } from "@/lib/supabase/admin";

type DocumentContextRow = {
  name: string;
  extraction_status: string | null;
  extracted_text_preview: string | null;
};

export async function getProjectDocumentContext(projectId: string) {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("uploaded_documents")
    .select("name, extraction_status, extracted_text_preview")
    .eq("project_id", projectId);

  if (error) {
    throw new Error(error.message);
  }

  const documentRows = (data ?? []) as unknown as DocumentContextRow[];

  if (documentRows.length === 0) {
    return "No extracted document text is available yet.";
  }

  return documentRows
    .map((document, index) => {
      return `Document ${index + 1}: ${document.name}
Extraction Status: ${document.extraction_status}
Text Preview:
${document.extracted_text_preview}`;
    })
    .join("\n\n---\n\n");
}