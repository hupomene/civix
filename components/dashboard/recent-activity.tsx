import {
  CheckCircle2,
  FileText,
  Sparkles,
  TriangleAlert,
  UploadCloud,
} from "lucide-react";

const activities = [
  {
    icon: UploadCloud,
    title: "Permit package uploaded",
    detail: "Lake Dallas Retail Renovation",
    time: "18 min ago",
  },
  {
    icon: Sparkles,
    title: "AI impact analysis completed",
    detail: "Restroom relocation change",
    time: "42 min ago",
  },
  {
    icon: TriangleAlert,
    title: "Compliance risk detected",
    detail: "ADA clearance needs review",
    time: "1h ago",
  },
  {
    icon: FileText,
    title: "Affected documents identified",
    detail: "A-101, P-101, Accessibility Details",
    time: "2h ago",
  },
  {
    icon: CheckCircle2,
    title: "Checklist generated",
    detail: "12 action items created",
    time: "3h ago",
  },
];

export function RecentActivity() {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold tracking-tight">Recent Activity</h2>
      <p className="mt-1 text-sm text-slate-500">
        Latest AI and project workspace events.
      </p>

      <div className="mt-6 space-y-5">
        {activities.map((activity) => {
          const Icon = activity.icon;

          return (
            <div key={activity.title} className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-50">
                <Icon className="h-4 w-4 text-blue-600" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-900">
                  {activity.title}
                </p>
                <p className="mt-1 truncate text-sm text-slate-500">
                  {activity.detail}
                </p>
              </div>

              <span className="text-xs text-slate-400">{activity.time}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}