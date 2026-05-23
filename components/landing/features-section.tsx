import {
  BarChart3,
  Boxes,
  ClipboardCheck,
  FileSearch,
  Network,
  UsersRound,
} from "lucide-react";

const features = [
  {
    icon: Boxes,
    title: "Centralize Project Data",
    description:
      "Bring construction documents, permit packages, design notes, RFIs, and communications into one AI-ready workspace.",
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
  },
  {
    icon: ClipboardCheck,
    title: "Automate Review Workflows",
    description:
      "Reduce manual review cycles by standardizing document checks, change reviews, and project readiness steps.",
    iconBg: "bg-violet-50",
    iconColor: "text-violet-600",
  },
  {
    icon: FileSearch,
    title: "Review Permit Packages",
    description:
      "Upload existing permit packages and let CIVIX identify affected drawings, missing updates, and resubmission risks.",
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
  },
  {
    icon: BarChart3,
    title: "Predict Risk & Delays",
    description:
      "Analyze project activity, document gaps, and compliance issues before they become expensive delays.",
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
  },
  {
    icon: Network,
    title: "Connect Design Changes",
    description:
      "Map each design change to affected plans, schedules, permit forms, compliance items, and team responsibilities.",
    iconBg: "bg-cyan-50",
    iconColor: "text-cyan-600",
  },
  {
    icon: UsersRound,
    title: "Improve Collaboration",
    description:
      "Keep owners, contractors, architects, engineers, and permit consultants aligned with clear AI-generated next steps.",
    iconBg: "bg-orange-50",
    iconColor: "text-orange-600",
  },
];

export function FeaturesSection() {
  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-600">
            Platform Capabilities
          </p>

          <h2 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
            One workspace for construction intelligence.
          </h2>

          <p className="mt-5 text-lg leading-8 text-slate-600">
            CIVIX helps teams move from scattered project files and manual
            review cycles to structured, AI-assisted construction decision
            workflows.
          </p>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <div
                key={feature.title}
                className="group rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-900/10"
              >
                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-2xl ${feature.iconBg}`}
                >
                  <Icon className={`h-6 w-6 ${feature.iconColor}`} />
                </div>

                <h3 className="mt-7 text-xl font-semibold tracking-tight text-slate-950">
                  {feature.title}
                </h3>

                <p className="mt-4 leading-7 text-slate-600">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}