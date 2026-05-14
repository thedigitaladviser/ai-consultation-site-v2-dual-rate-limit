import { CallbackForm } from "@/components/callback-form";
import { CtaLink } from "@/components/cta-link";
import { getTollFreeNumber } from "@/lib/public-config";

export function Hero() {
  const tollFreeNumber = getTollFreeNumber();

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.12),transparent_28%),radial-gradient(circle_at_left,rgba(59,130,246,0.08),transparent_24%)]" />
      <div className="relative mx-auto grid max-w-7xl gap-8 px-6 py-10 lg:grid-cols-2 lg:items-start lg:px-8 lg:py-14">
        <div className="max-w-2xl">
          <div className="mb-4 inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-sm font-medium text-emerald-700 shadow-sm">
            15-minute AI opportunity assessment
          </div>

          <h1 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl lg:text-[3.2rem]">
            Get your AI opportunity report in less than 15 minutes.
          </h1>

          <p className="mt-4 max-w-[640px] text-base leading-7 text-slate-600">
            Most AI solutions offer flat-rate Starter, Pro, or Business tiers, with customization reserved for large Enterprise.
            We deliver the power of enterprise AI solutions tailored to your small or mid-sized business.
          </p>

          <p className="mt-3 max-w-[640px] text-base leading-7 text-slate-600">
            Talk to our AI voice agent to identify automation, integration, chat, voice, or custom solutions that save time,
            cut costs, and support growth. If convinced, schedule a 30-minute call with our engineers to start building,
            improving, growing and earning.
          </p>

          <div className="mt-6 flex flex-col gap-4 sm:flex-row">
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

          <div id="callback" className="mt-5">
            <CallbackForm />
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2.5 text-xs text-slate-500 sm:text-sm">
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

        <div className="relative lg:pt-2">
          <div className="mx-auto max-w-xl rounded-[32px] border border-slate-200 bg-white p-5 shadow-2xl shadow-slate-300/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900">Live AI Consultation</p>
                <p className="text-sm text-slate-500">Connected to voice agent</p>
              </div>
              <div className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">Live</div>
            </div>

            <div className="mt-6 rounded-3xl bg-slate-950 p-5 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-300">AI consultant</p>
                  <p className="text-xl font-semibold">Ready to assess your business</p>
                </div>
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20">
                  <div className="h-6 w-6 rounded-full bg-emerald-400" />
                </div>
              </div>

              <div className="mt-6 grid grid-cols-12 gap-2">
                {[18, 30, 22, 42, 26, 34, 20, 28, 38, 24, 16, 32].map((h, i) => (
                  <div key={i} className="flex items-end justify-center">
                    <div className="w-full rounded-full bg-emerald-400/90" style={{ height: `${h}px` }} />
                  </div>
                ))}
              </div>

              <div className="mt-6 space-y-2.5">
                <div className="rounded-2xl bg-white/10 p-3.5">
                  <p className="text-sm text-slate-300">Question 1</p>
                  <p className="mt-1 text-sm font-medium">What kind of business do you run?</p>
                </div>
                <div className="rounded-2xl bg-white/10 p-3.5">
                  <p className="text-sm text-slate-300">Question 2</p>
                  <p className="mt-1 text-sm font-medium">Where are the biggest repetitive bottlenecks today?</p>
                </div>
                <div className="rounded-2xl bg-white/10 p-3.5">
                  <p className="text-sm text-slate-300">Question 3</p>
                  <p className="mt-1 text-xs font-medium leading-5 sm:text-sm">
                    If we found you a solution that would immediately show signs of improved performance, what would be the
                    projected timeframe for its implementation? ASAP? In a month? Sometime this year? Maybe sometime next year?
                    And what would be the budget you could afford to set aside for this project?
                  </p>
                </div>
                <div className="rounded-2xl bg-white/10 p-3.5">
                  <p className="text-sm text-slate-300">Outcome</p>
                  <p className="mt-1 text-sm font-medium">Identify the fastest, highest-impact AI wins.</p>
                </div>
                <div className="rounded-2xl bg-white/10 p-3.5">
                  <p className="text-sm text-slate-300">Outcome (optional)</p>
                  <p className="mt-1 text-xs font-medium leading-5 sm:text-sm">
                    Schedule a free 30-minute introductory call with Custom AI Solutions to discuss details of your solution and
                    determine the broader action plan.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {[
                ["Faster lead response", "Capture and qualify opportunities right away."],
                ["Lower manual workload", "Reduce repetitive tasks across teams."],
                ["Clear next steps", "Get practical automation recommendations."]
              ].map(([title, body]) => (
                <div key={title} className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5">
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
