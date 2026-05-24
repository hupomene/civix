import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { ProjectWorkspace } from "@/components/projects/project-workspace";

type ProjectDetailPageProps = {
  params: Promise<{
    projectId: string;
  }>;
};

export default async function ProjectDetailPage({
  params,
}: ProjectDetailPageProps) {
  const { projectId } = await params;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <div className="flex">
        <AppSidebar />

        <section className="min-h-screen flex-1">
          <DashboardHeader
            title="Project Workspace"
            subtitle="AI-assisted permit package review and design change impact analysis."
          />

          <div className="mx-auto max-w-7xl px-6 py-8">
            <ProjectWorkspace projectId={projectId} />
          </div>
        </section>
      </div>
    </main>
  );
}