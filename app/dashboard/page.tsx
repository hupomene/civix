import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  FileText,
  FolderKanban,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

const projects = [
  {
    name: "Lake Dallas Retail Renovation",
    location: "Lake Dallas, TX",
    status: "Permit Review",
    risk: "Medium",
  },
  {
    name: "Seaside Tower Project",
    location: "Frisco, TX",
    status: "Design Change Review",
    risk: "High",
  },
  {
    name: "Plano Office Buildout",
    location: "Plano, TX",
    status: "Ready for Checklist",
    risk: "Low",
  },
];

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <div className="flex">
        <AppSidebar />

        <section className="min-h-screen flex-1">
          <DashboardHeader
            title="Dashboard"
            subtitle="Monitor project reviews, permit package status, and AI-generated risks."
          />

          <div className="mx-auto max-w-7xl px-6 py-8">
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              <StatCard
                title="Active Projects"
                value="12"
                description="+3 this month"
                icon={FolderKanban}
              />
              <StatCard
                title="Documents Reviewed"
                value="248"
                description="Permit packages, drawings, RFIs"
                icon={FileText}
              />
              <StatCard
                title="Open Risks"
                value="17"
                description="5 high-priority issues"
                icon={AlertTriangle}
              />
              <StatCard
                title="AI Reviews Completed"
                value="42"
                description="+11 this week"
                icon={Sparkles}
              />
            </div>

            <div className="mt-8 grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold tracking-tight">
                      Project Workspaces
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Recent permit review and design change analysis projects.
                    </p>
                  </div>

                  <Link
                    href="/projects"
                    className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    View Projects
                  </Link>
                </div>

                <div className="mt-6 space-y-4">
                  {projects.map((project) => (
                    <Link
                      key={project.name}
                      href="/projects/demo-project"
                      className="block rounded-2xl border border-slate-200 p-5 transition hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50/40 hover:shadow-md"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50">
                            <Building2 className="h-5 w-5 text-blue-600" />
                          </div>

                          <div>
                            <h3 className="font-semibold text-slate-950">
                              {project.name}
                            </h3>
                            <p className="mt-1 text-sm text-slate-500">
                              {project.location}
                            </p>
                            <p className="mt-3 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                              {project.status}
                            </p>
                          </div>
                        </div>

                        <div
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            project.risk === "High"
                              ? "bg-red-50 text-red-700"
                              : project.risk === "Medium"
                              ? "bg-amber-50 text-amber-700"
                              : "bg-emerald-50 text-emerald-700"
                          }`}
                        >
                          {project.risk} Risk
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <RecentActivity />

                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50">
                      <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <h2 className="font-semibold">MVP Status</h2>
                      <p className="text-sm text-slate-500">
                        Dashboard UI is ready for Supabase integration.
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                    Next step: connect project creation, document upload, and AI
                    review APIs.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}