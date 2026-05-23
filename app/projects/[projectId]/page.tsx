import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { ProjectWorkspace } from "@/components/projects/project-workspace";

export default function ProjectDetailPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <div className="flex">
        <AppSidebar />

        <section className="min-h-screen flex-1">
          <DashboardHeader
            title="Lake Dallas Retail Renovation"
            subtitle="AI-assisted permit package review and design change impact analysis."
          />

          <div className="mx-auto max-w-7xl px-6 py-8">
            <ProjectWorkspace />
          </div>
        </section>
      </div>
    </main>
  );
}