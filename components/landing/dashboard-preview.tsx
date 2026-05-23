import {
  Bell,
  CalendarDays,
  CheckCircle2,
  FileText,
  FolderKanban,
  LayoutDashboard,
  Menu,
  Search,
  Settings,
  Sparkles,
  TriangleAlert,
  User,
} from "lucide-react";

const sidebarItems = [
  { label: "Overview", icon: LayoutDashboard, active: true },
  { label: "Projects", icon: FolderKanban },
  { label: "Tasks", icon: CheckCircle2 },
  { label: "Documents", icon: FileText },
  { label: "Issues", icon: TriangleAlert },
  { label: "AI Assistant", icon: Sparkles, badge: "New" },
];

const stats = [
  {
    label: "Project Progress",
    value: "68%",
    detail: "+6% this week",
  },
  {
    label: "Budget Status",
    value: "$2.45M",
    detail: "Under budget by $320K",
  },
  {
    label: "Schedule Status",
    value: "On Track",
    detail: "No delays",
  },
  {
    label: "Open Issues",
    value: "24",
    detail: "-8% this week",
  },
];

const activities = [
  { title: "Site inspection completed", by: "Kim S.", time: "2h ago" },
  { title: "Concrete pour — Level 2", by: "Alex R.", time: "5h ago" },
  { title: "RFI #128 resolved", by: "Sam T.", time: "1d ago" },
  { title: "Submittal approved", by: "Jamie L.", time: "1d ago" },
];

export function DashboardPreview() {
  return (
    <div className="relative">
      <div className="absolute -inset-6 rounded-[2rem] bg-gradient-to-r from-blue-200/60 to-violet-200/60 blur-3xl" />

      <div className="relative overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-2xl shadow-slate-900/10">
        <div className="grid min-h-[430px] grid-cols-[180px_1fr]">
          <aside className="hidden border-r border-slate-200 bg-slate-50/60 p-4 md:block">
            <div className="mb-7 flex items-center gap-2.5 px-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-violet-600">
                <div className="h-2.5 w-2.5 rotate-45 rounded-sm bg-white" />
              </div>
              <span className="text-sm font-semibold text-slate-900">
                CIVIX
              </span>
            </div>

            <nav className="space-y-1">
              {sidebarItems.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.label}
                    className={`flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium ${
                      item.active
                        ? "bg-blue-50 text-blue-700"
                        : "text-slate-600 hover:bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="h-3.5 w-3.5" />
                      {item.label}
                    </div>

                    {item.badge && (
                      <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] text-blue-700">
                        {item.badge}
                      </span>
                    )}
                  </div>
                );
              })}
            </nav>

            <div className="mt-20 border-t border-slate-200 pt-4">
              <div className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-600">
                <Settings className="h-3.5 w-3.5" />
                Settings
              </div>
            </div>
          </aside>

          <section className="bg-white p-5">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Menu className="h-4 w-4 text-slate-500" />
                <div>
                  <h2 className="text-lg font-semibold tracking-tight text-slate-950">
                    Seaside Tower Project
                  </h2>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Permit package review workspace
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Search className="h-4 w-4 text-slate-500" />
                <Bell className="h-4 w-4 text-slate-500" />
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-xs font-semibold text-white">
                  JS
                </div>
              </div>
            </div>

            <div className="mb-5 flex items-center justify-end gap-2">
              <div className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600">
                <CalendarDays className="h-3.5 w-3.5" />
                May 12 — May 18, 2026
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <p className="text-[11px] font-medium text-slate-500">
                    {stat.label}
                  </p>
                  <p className="mt-3 text-xl font-semibold text-slate-950">
                    {stat.value}
                  </p>
                  <p className="mt-3 text-[11px] text-emerald-600">
                    {stat.detail}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-[1.15fr_0.85fr_0.75fr]">
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-900">
                    Progress Over Time
                  </p>
                  <span className="rounded-lg bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                    68%
                  </span>
                </div>

                <div className="relative h-40 overflow-hidden rounded-lg bg-gradient-to-b from-slate-50 to-white">
                  <div className="absolute inset-x-0 bottom-0 h-px bg-slate-200" />
                  <div className="absolute inset-x-0 bottom-10 h-px bg-slate-100" />
                  <div className="absolute inset-x-0 bottom-20 h-px bg-slate-100" />
                  <div className="absolute inset-x-0 bottom-30 h-px bg-slate-100" />

                  <svg
                    viewBox="0 0 320 150"
                    className="absolute inset-0 h-full w-full"
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M0 112 L45 88 L90 74 L135 53 L180 42 L225 44 L270 35 L320 28"
                      fill="none"
                      stroke="rgb(37 99 235)"
                      strokeWidth="3"
                    />
                    <circle cx="270" cy="35" r="5" fill="rgb(37 99 235)" />
                  </svg>

                  <div className="absolute bottom-2 left-4 text-[10px] text-slate-400">
                    Apr 14
                  </div>
                  <div className="absolute bottom-2 left-[40%] text-[10px] text-slate-400">
                    May 12
                  </div>
                  <div className="absolute bottom-2 right-4 text-[10px] text-slate-400">
                    Jun 9
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="mb-4 text-sm font-semibold text-slate-900">
                  Recent Activity
                </p>

                <div className="space-y-4">
                  {activities.map((activity) => (
                    <div key={activity.title} className="flex gap-3">
                      <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-50">
                        <User className="h-3 w-3 text-blue-600" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium text-slate-800">
                          {activity.title}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          by {activity.by}
                        </p>
                      </div>

                      <span className="text-[10px] text-slate-400">
                        {activity.time}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="mb-4 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-violet-600" />
                  <p className="text-sm font-semibold text-slate-900">
                    AI Insights
                  </p>
                </div>

                <div className="rounded-xl bg-violet-50 p-4">
                  <p className="text-xs leading-5 text-slate-700">
                    Restroom relocation may affect plumbing sheets, ADA
                    clearance, fixture schedule, and permit resubmission.
                  </p>
                  <a
                    href="#"
                    className="mt-3 inline-flex text-xs font-semibold text-violet-700"
                  >
                    View insight
                  </a>
                </div>

                <div className="mt-4 rounded-xl bg-amber-50 p-4">
                  <p className="text-xs leading-5 text-slate-700">
                    3 budget line items exceed planned threshold by more than
                    10%.
                  </p>
                  <a
                    href="#"
                    className="mt-3 inline-flex text-xs font-semibold text-amber-700"
                  >
                    Review risk
                  </a>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}