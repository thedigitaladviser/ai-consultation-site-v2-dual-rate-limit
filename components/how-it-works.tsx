export function HowItWorks() {
  return (
    <section id="how-it-works" className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">How it works</p>
        <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
          One quick conversation. Immediate AI opportunities.
        </h2>
        <p className="mt-4 text-lg text-slate-600">
          Designed for SMEs that want practical AI wins without the usual complexity.
        </p>
      </div>

      <div className="mt-14 grid gap-6 md:grid-cols-3">
        {[
          ["1", "Start the call", "Dial directly or request an instant callback."],
          ["2", "Answer a few questions", "Our AI agent learns how your business works and where the friction is."],
          ["3", "Get tailored opportunities", "See where AI can save time, reduce costs, and improve growth."]
        ].map(([step, title, body]) => (
          <div key={step} className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-lg font-semibold text-white">
              {step}
            </div>
            <h3 className="mt-6 text-xl font-semibold text-slate-950">{title}</h3>
            <p className="mt-3 text-base leading-7 text-slate-600">{body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
