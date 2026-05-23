import {
  ArrowRight,
  CheckCircle2,
  FileUp,
  ListChecks,
  PencilLine,
  Sparkles,
} from "lucide-react";

const workflowSteps = [
  {
    icon: FileUp,
    title: "Upload permit package",
    description:
      "Add the current permit package, drawings, project documents, or review files into the project workspace.",
  },
  {
    icon: PencilLine,
    title: "Describe the design change",
    description:
      "Enter a natural-language description of the layout modification, structural adjustment, MEP change, or scope revision.",
  },
  {
    icon: Sparkles,
    title: "AI analyzes impact",
    description:
      "CIVIX identifies affected documents, likely coordination issues, compliance risks, and resubmission considerations.",
  },
  {
    icon: ListChecks,
    title: "Generate checklist",
    description:
      "Receive a practical compliance checklist and recommended next steps for architects, contractors, engineers, and permit teams.",
  },
];

export function WorkflowSection() {
  return (
    <section
      id="workflow"
      className="relative overflow-hidden bg-slate-950 py-24 text-white"
    >
      <div className="absolute left-0 top-0 h-[420px] w-[420px] rounded-full bg-blue-500/20 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-[420px] w-[420px] rounded-full bg-violet-500/20 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-300">
              MVP Workflow
            </p>

            <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
              From design change to review-ready action plan.
            </h2>

            <p className="mt-6 text-lg leading-8 text-slate-300">
              The first CIVIX MVP should focus on a high-value construction
              workflow: design change input plus existing permit package upload,
              followed by AI-generated impact analysis and compliance checklist.
            </p>

            <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-400/10">
                  <CheckCircle2 className="h-5 w-5 text-emerald-300" />
                </div>

                <div>
                  <h3 className="font-semibold text-white">
                    Recommended MVP Scope
                  </h3>
                  <p className="mt-2 leading-7 text-slate-300">
                    Permit package upload, design change input, AI impact
                    summary, affected document list, compliance checklist, and
                    downloadable review report.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-4 shadow-2xl shadow-black/20 backdrop-blur">
            <div className="grid gap-4">
              {workflowSteps.map((step, index) => {
                const Icon = step.icon;

                return (
                  <div
                    key={step.title}
                    className="group rounded-3xl border border-white/10 bg-white/[0.07] p-6 transition hover:bg-white/[0.1]"
                  >
                    <div className="flex items-start gap-5">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-slate-950">
                        <Icon className="h-5 w-5" />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-semibold text-blue-300">
                            Step {index + 1}
                          </span>
                          {index < workflowSteps.length - 1 && (
                            <ArrowRight className="h-4 w-4 text-slate-500" />
                          )}
                        </div>

                        <h3 className="mt-2 text-xl font-semibold text-white">
                          {step.title}
                        </h3>

                        <p className="mt-3 leading-7 text-slate-300">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}