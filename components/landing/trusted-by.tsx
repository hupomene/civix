const companies = ["Turner", "SKANSKA", "Kiewit", "AECOM", "dRofus", "BECHTEL"];

export function TrustedBy() {
  return (
    <section className="border-y border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
          Built for modern construction teams
        </p>

        <div className="mt-8 grid grid-cols-2 items-center gap-8 text-center sm:grid-cols-3 lg:grid-cols-6">
          {companies.map((company) => (
            <div
              key={company}
              className="text-xl font-bold tracking-tight text-slate-400 grayscale transition hover:text-slate-600"
            >
              {company}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}