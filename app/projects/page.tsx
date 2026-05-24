"use client";

import { useEffect, useState } from "react";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { ProjectCard } from "@/components/projects/project-card";

type ProjectListItem = {
  id: string;
  name: string;
  location: string;
  type: string;
  status: string;
  risk: "Low" | "Medium" | "High";
  documents: number;
  openItems: number;
  createdAt: string;
};

type ProjectsResponse = {
  ok: boolean;
  projects?: ProjectListItem[];
  error?: string;
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProjects() {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch("/api/projects/list");

        if (!response.ok) {
          throw new Error("Failed to load projects.");
        }

        const data = (await response.json()) as ProjectsResponse;

        if (!data.ok) {
          throw new Error(data.error ?? "Failed to load projects.");
        }

        setProjects(data.projects ?? []);
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Failed to load projects."
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadProjects();
  }, []);

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
                  Projects loaded from Supabase.
                </p>
              </div>

              <button className="rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20">
                New Project
              </button>
            </div>

            {isLoading && (
              <div className="mb-6 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
                Loading projects from Supabase...
              </div>
            )}

            {error && (
              <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {error}
              </div>
            )}

            {!isLoading && projects.length === 0 ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
                <h3 className="text-lg font-semibold text-slate-950">
                  No projects found
                </h3>
                <p className="mt-2 text-sm text-slate-500">
                  Run the demo AI analysis first to create the Lake Dallas
                  project in Supabase.
                </p>
              </div>
            ) : (
              <div className="grid gap-6 lg:grid-cols-3">
                {projects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}