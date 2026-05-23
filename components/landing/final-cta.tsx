import { ArrowRight, CalendarCheck, Sparkles } from "lucide-react";

export function FinalCta() {
  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-blue-600 to-violet-700 px-8 py-16 text-center shadow-2xl shadow-blue-500/20 sm:px-12 lg:px-16">
          <div className="absolute left-10 top-10 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute bottom-10 right-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />

          <div className="relative mx-auto max-w-3xl">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15">
              <Sparkles className="h-7 w-7 text-white" />
            </div>

            <h2 className="mt-7 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Ready to reduce permit delays and review friction?
            </h2>

            <p className="mt-6 text-lg leading-8 text-blue-50">
              CIVIX gives construction teams an AI-assisted workflow for
              reviewing design changes, identifying affected documents, and
              generating actionable compliance checklists.
            </p>

            <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
              <a
                href="#"
                className="inline-flex h-14 items-center justify-center rounded-xl bg-white px-8 text-base font-semibold text-blue-700 shadow-lg transition hover:scale-[1.02]"
              >
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>

              <a
                href="#"
                className="inline-flex h-14 items-center justify-center rounded-xl border border-white/25 px-8 text-base font-semibold text-white transition hover:bg-white/10"
              >
                <CalendarCheck className="mr-2 h-4 w-4" />
                Book a Demo
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}