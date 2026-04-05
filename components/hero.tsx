import { CallbackForm } from "@/components/callback-form";
import { CtaLink } from "@/components/cta-link";
import { getTollFreeNumber } from "@/lib/public-config";

export function Hero() {
  const tollFreeNumber = getTollFreeNumber();

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.12),transparent_28%),radial-gradient(circle_at_left,rgba(59,130,246,0.08),transparent_24%)]" />
      <div className="relative mx-auto grid max-w-7xl gap-12 px-6 py-16 lg:grid-cols-2 lg:items-center lg:px-8 lg:py-24">
        <div className="max-w-2xl">
          <div className="mb-6 inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 shadow-sm">
            3-minute AI opportunity assessment
          </div>

          <h1 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
            Get your AI opportunity report in 3 minutes.
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
            Talk to our AI voice agent. It asks a few smart questions and instantly identifies where automation can save time,
            reduce costs, and grow your business.
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <CtaLink
              ctaId="hero-start-instant-call"
              href={`tel:${tollFreeNumber}`}
              className="inline-flex h-14 items-center justify-center rounded-2xl bg-brand px-7 text-base font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:-translate-y-0.5 hover:bg-brand-dark"
            >
              Start Instant Call
            </CtaLink>
            <CtaLink
              ctaId="hero-get-a-call-now"
              href="#callback"
              className="inline-flex h-14 items-center justify-center rounded-2xl border border-slate-300 bg-white px-7 text-base font-semibold text-slate-900 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-400"
            >
              Get a Call Now
            </CtaLink>
          </div>

          <div id="callback" className="mt-6">
            <CallbackForm />
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-slate-500">
            <span className="inline-flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-brand" /> No prep required
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-brand" /> No sales pitch
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-brand" /> Instant, actionable insights
            </span>
          </div>
        </div>

        <div className="relative">
          <div className="mx-auto max-w-xl rounded-[32px] border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-300/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900">Live AI Consultation</p>
                <p className="text-sm text-slate-500">Connected to voice agent</p>
              </div>
              <div className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">Live</div>
            </div>

            <div className="mt-8 rounded-3xl bg-slate-950 p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-300">AI consultant</p>
                  <p className="text-2xl font-semibold">Ready to assess your business</p>
                </div>
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20">
                  <div className="h-6 w-6 rounded-full bg-emerald-400" />
                </div>
              </div>

              <div className="mt-8 grid grid-cols-12 gap-2">
                {[18, 30, 22, 42, 26, 34, 20, 28, 38, 24, 16, 32].map((h, i) => (
                  <div key={i} className="flex items-end justify-center">
                    <div className="w-full rounded-full bg-emerald-400/90" style={{ height: `${h}px` }} />
                  </div>
                ))}
              </div>

              <div className="mt-8 space-y-3">
                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="text-sm text-slate-300">Question 1</p>
                  <p className="mt-1 text-base font-medium">What kind of business do you run?</p>
                </div>
                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="text-sm text-slate-300">Question 2</p>
                  <p className="mt-1 text-base font-medium">Where are the biggest repetitive bottlenecks today?</p>
                </div>
                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="text-sm text-slate-300">Outcome</p>
                  <p className="mt-1 text-base font-medium">Identify the fastest, highest-impact AI wins.</p>
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {[
                ["Faster lead response", "Capture and qualify opportunities right away."],
                ["Lower manual workload", "Reduce repetitive tasks across teams."],
                ["Clear next steps", "Get practical automation recommendations."]
              ].map(([title, body]) => (
                <div key={title} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-900">{title}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
