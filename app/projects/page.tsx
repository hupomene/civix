import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { ProjectCard } from "@/components/projects/project-card";

const projects = [
  {
    id: "demo-project",
    name: "Lake Dallas Retail Renovation",
    location: "5008 S. Stemmons Freeway, Lake Dallas, TX",
    type: "Commercial Renovation",
    status: "Permit Review",
    risk: "Medium",
    documents: 18,
    openItems: 7,
  },
  {
    id: "seaside-tower",
    name: "Seaside Tower Project",
    location: "Frisco, TX",
    type: "Mixed-Use Development",
    status: "Design Change Review",
    risk: "High",
    documents: 42,
    openItems: 14,
  },
  {
    id: "plano-office",
    name: "Plano Office Buildout",
    location: "Plano, TX",
    type: "Tenant Improvement",
    status: "Checklist Ready",
    risk: "Low",
    documents: 11,
    openItems: 2,
  },
];

export default function ProjectsPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <div className="flex">
        <AppSidebar />

        <section className="min-h-screen flex-1">
          <DashboardHeader
            title="Projects"
            subtitle="Manage construction projects, permit packages, and AI review workspaces."
          />

          <div className="mx-auto max-w-7xl px-6 py-8">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold tracking-tight">
                  Active Project Workspaces
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Select a project to review documents, design changes, and AI
                  recommendations.
                </p>
              </div>

              <button className="rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20">
                New Project
              </button>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}