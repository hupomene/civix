import { ArrowRight, BadgeCheck, CreditCard, ShieldCheck, Zap } from "lucide-react";
import { DashboardPreview } from "@/components/landing/dashboard-preview";

const trustItems = [
  {
    icon: CreditCard,
    label: "No credit card required",
  },
  {
    icon: Zap,
    label: "Setup in 5 minutes",
  },
  {
    icon: ShieldCheck,
    label: "Cancel anytime",
  },
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-white via-slate-50 to-blue-50">
      <div className="absolute right-0 top-0 h-[620px] w-[620px] rounded-full bg-blue-100/70 blur-3xl" />
      <div className="absolute bottom-0 left-[35%] h-[420px] w-[420px] rounded-full bg-violet-100/70 blur-3xl" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-6 py-20 lg:grid-cols-[0.95fr_1.45fr] lg:px-8 lg:py-24">
        <div>
          <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-violet-100 px-4 py-2 text-sm font-medium text-violet-700">
            <BadgeCheck className="h-4 w-4" />
            AI-Powered Construction Intelligence
          </div>

          <h1 className="max-w-xl text-5xl font-semibold leading-[1.05] tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">
            Build{" "}
            <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
              Smarter
            </span>
            . Deliver Better.
          </h1>

          <p className="mt-7 max-w-xl text-lg leading-8 text-slate-600">
            CIVIX unifies project documents, permit packages, design changes,
            compliance workflows, and AI-powered review insights so construction
            teams can reduce delays and deliver with confidence.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <a
              href="#"
              className="inline-flex h-14 items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-8 text-base font-semibold text-white shadow-xl shadow-blue-500/20 transition hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-500/25"
            >
              Start Free Trial
              <ArrowRight className="ml-2 h-4 w-4" />
            </a>

            <a
              href="#workflow"
              className="inline-flex h-14 items-center justify-center rounded-xl px-8 text-base font-semibold text-slate-900 transition hover:bg-slate-100"
            >
              Book a Demo
              <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </div>

          <div className="mt-10 grid max-w-2xl grid-cols-1 gap-4 sm:grid-cols-3">
            {trustItems.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.label}
                  className="flex items-center gap-3 border-r border-slate-200 last:border-r-0 sm:pr-4"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
                    <Icon className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="text-sm leading-5 text-slate-600">
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <DashboardPreview />
      </div>
    </section>
  );
}