import Link from "next/link";
import {
  AlertTriangle,
  Building2,
  ClipboardCheck,
  FileText,
  MapPin,
} from "lucide-react";

type Project = {
  id: string;
  name: string;
  location: string;
  type: string;
  status: string;
  risk: "Low" | "Medium" | "High";
  documents: number;
  openItems: number;
};

type ProjectCardProps = {
  project: Project;
};

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link
      href={`/projects/${project.id}`}
      className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-slate-900/10"
    >
      <div className="flex items-start justify-between">
        <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-blue-50 p-3">
          <Building2 className="h-6 w-6 text-blue-600" />
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

      <h3 className="mt-6 text-xl font-semibold tracking-tight text-slate-950">
        {project.name}
      </h3>

      <div className="mt-3 flex items-start gap-2 text-sm text-slate-500">
        <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
        <span>{project.location}</span>
      </div>

      <p className="mt-4 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
        {project.type}
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-slate-50 p-4">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <FileText className="h-4 w-4" />
            Documents
          </div>
          <p className="mt-2 text-2xl font-semibold">{project.documents}</p>
        </div>

        <div className="rounded-2xl bg-slate-50 p-4">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <AlertTriangle className="h-4 w-4" />
            Open Items
          </div>
          <p className="mt-2 text-2xl font-semibold">{project.openItems}</p>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-5">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
          <ClipboardCheck className="h-4 w-4" />
          {project.status}
        </div>

        <span className="text-sm font-semibold text-blue-600 transition group-hover:translate-x-1">
          Open →
        </span>
      </div>
    </Link>
  );
}