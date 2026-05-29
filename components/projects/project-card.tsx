import Link from "next/link";
import {
  AlertTriangle,
  Building2,
  FileText,
  ListChecks,
  Loader2,
  Trash2,
} from "lucide-react";

type ProjectCardProps = {
  project: {
    id: string;
    name: string;
    location: string;
    type: string;
    status: string;
    risk: "Low" | "Medium" | "High";
    documents: number;
    openItems: number;
    createdAt: string;
    jurisdictionId: string | null;
    jurisdictionName: string | null;
    projectState: string | null;
    projectCounty: string | null;
  };
  onDeleteProject?: (projectId: string) => void;
  deletingProjectId?: string | null;
};

export function ProjectCard({
  project,
  onDeleteProject,
  deletingProjectId = null,
}: ProjectCardProps) {
  const isDeleting = deletingProjectId === project.id;

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50">
            <Building2 className="h-5 w-5 text-blue-600" />
          </div>

          <div>
            <h3 className="font-semibold text-slate-950">{project.name}</h3>
            <p className="mt-1 text-sm text-slate-500">{project.location}</p>

            <div className="mt-3 flex flex-wrap gap-2">
              <p className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                {project.type}
              </p>

              <p
                className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                  project.jurisdictionName
                    ? "bg-indigo-50 text-indigo-700"
                    : "bg-amber-50 text-amber-700"
                }`}
              >
                {project.jurisdictionName
                  ? `Jurisdiction Pack: ${project.jurisdictionName}`
                  : "Jurisdiction Pack: Not linked"}
              </p>
            </div>
          </div>
        </div>

        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            project.risk === "High"
              ? "bg-red-50 text-red-700"
              : project.risk === "Medium"
              ? "bg-amber-50 text-amber-700"
              : "bg-emerald-50 text-emerald-700"
          }`}
        >
          {project.risk} Risk
        </span>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-slate-50 p-4">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <FileText className="h-4 w-4" />
            Documents
          </div>
          <p className="mt-2 text-lg font-semibold">{project.documents}</p>
        </div>

        <div className="rounded-2xl bg-slate-50 p-4">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <ListChecks className="h-4 w-4" />
            Open Items
          </div>
          <p className="mt-2 text-lg font-semibold">{project.openItems}</p>
        </div>
      </div>

      <div className="mt-5 rounded-2xl bg-slate-50 p-4">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
          <AlertTriangle className="h-4 w-4" />
          Status
        </div>
        <p className="mt-2 text-sm font-semibold text-slate-800">
          {project.status}
        </p>
      </div>

      <div className="mt-6 flex gap-3">
        <Link
          href={`/projects/${project.id}`}
          className="flex-1 rounded-xl bg-slate-950 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Open Workspace
        </Link>

        {onDeleteProject && (
          <button
            type="button"
            disabled={isDeleting}
            onClick={() => onDeleteProject(project.id)}
            className="inline-flex items-center justify-center rounded-xl border border-red-200 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}