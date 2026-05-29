import { createAdminClient } from "@/lib/supabase/admin";

export const DEMO_PROJECT = {
  name: "Lake Dallas Retail Renovation",
  location: "5008 S. Stemmons Freeway, Lake Dallas, TX",
  project_type: "Commercial Renovation",
  status: "Permit Review",
  risk_level: "High",
};

export async function getOrCreateDemoProject() {
  const supabase = createAdminClient();

  const { data: existingProject, error: selectError } = await supabase
    .from("projects")
    .select("*")
    .eq("name", DEMO_PROJECT.name)
    .maybeSingle();

  if (selectError) {
    throw new Error(selectError.message);
  }

  if (existingProject) {
    return existingProject;
  }

  const { data: newProject, error: insertError } = await supabase
    .from("projects")
    .insert(DEMO_PROJECT as any)
    .select("*")
    .single();

  if (insertError) {
    throw new Error(insertError.message);
  }

  return newProject;
}