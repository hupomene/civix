"use client";

import { useEffect, useState } from "react";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { StatCard } from "@/components/dashboard/stat-card";
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  FileText,
  FolderKanban,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

type DashboardProject = {
  id: string;
  name: string;
  location: string | null;
  project_type: string | null;
  status: string;
  risk_level: string;
  created_at: string;
};

type DashboardReview = {
  id: string;
  design_change: string;
  model_used: string | null;
  created_at: string;
};

type DashboardData = {
  ok: boolean;
  stats?: {
    activeProjects: number;
    documentsReviewed: number;
    aiReviewsCompleted: number;
    openRisks: number;
  };
  recentReviews?: DashboardReview[];
  recentProjects?: DashboardProject[];
  error?: string;
};

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setIsLoading(true);

        const response = await fetch("/api/dashboard");

        if (!response.ok) {
          throw new Error("Failed to load dashboard data.");
        }

        const dashboardData = (await response.json()) as DashboardData;
        setData(dashboardData);
      } catch (error) {
        setData({
          ok: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to load dashboard data.",
        });
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  const stats = data?.stats ?? {
    activeProjects: 0,
    documentsReviewed: 0,
    aiReviewsCompleted: 0,
    openRisks: 0,
  };

  const recentProjects = data?.recentProjects ?? [];
  const recentReviews = data?.recentReviews ?? [];

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
            {data?.error && (
              <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {data.error}
              </div>
            )}

            {isLoading && (
              <div className="mb-6 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
                Loading dashboard data from Supabase...
              </div>
            )}

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              <StatCard
                title="Active Projects"
                value={String(stats.activeProjects)}
                description="Loaded from Supabase projects table"
                icon={FolderKanban}
              />
              <StatCard
                title="Documents Reviewed"
                value={String(stats.documentsReviewed)}
                description="Uploaded document metadata saved"
                icon={FileText}
              />
              <StatCard
                title="Open Risks"
                value={String(stats.openRisks)}
                description="Total detected risks across recent reviews"
                icon={AlertTriangle}
              />
              <StatCard
                title="AI Reviews Completed"
                value={String(stats.aiReviewsCompleted)}
                description="AI review records saved in Supabase"
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
                      Recent projects loaded from Supabase.
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
                  {recentProjects.length === 0 ? (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">
                      No projects found yet. Open the demo project and run an AI
                      review first.
                    </div>
                  ) : (
                    recentProjects.map((project) => (
                      <Link
                        key={project.id}
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
                                {project.location ?? "No location provided"}
                              </p>
                              <p className="mt-3 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                                {project.status}
                              </p>
                            </div>
                          </div>

                          <div
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              project.risk_level === "High"
                                ? "bg-red-50 text-red-700"
                                : project.risk_level === "Medium"
                                ? "bg-amber-50 text-amber-700"
                                : "bg-emerald-50 text-emerald-700"
                            }`}
                          >
                            {project.risk_level} Risk
                          </div>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h2 className="text-xl font-semibold tracking-tight">
                    Recent AI Reviews
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Latest saved review activity from Supabase.
                  </p>

                  <div className="mt-6 space-y-5">
                    {recentReviews.length === 0 ? (
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">
                        No AI reviews saved yet.
                      </div>
                    ) : (
                      recentReviews.map((review) => (
                        <div key={review.id} className="flex gap-4">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-violet-50">
                            <Sparkles className="h-4 w-4 text-violet-600" />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="line-clamp-2 text-sm font-semibold text-slate-900">
                              {review.design_change}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {review.model_used ?? "unknown model"} ·{" "}
                              {formatDateTime(review.created_at)}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50">
                      <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <h2 className="font-semibold">Supabase Connected</h2>
                      <p className="text-sm text-slate-500">
                        Dashboard now reflects saved MVP data.
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                    Next step: convert the project list and project detail
                    routing into real project IDs.
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