import { Hero } from "@/components/hero";
import { HowItWorks } from "@/components/how-it-works";
import { TrustStrip } from "@/components/trust-strip";
import { CtaLink } from "@/components/cta-link";
import { getTollFreeNumber } from "@/lib/public-config";

export default function Page() {
  const tollFreeNumber = getTollFreeNumber();

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-sm font-semibold text-white">
              AI
            </div>
            <div>
              <p className="text-sm font-semibold tracking-wide text-slate-900">AI Automation Agency</p>
              <p className="text-xs text-slate-500">Instant AI consultation for SMEs</p>
            </div>
          </div>
          <nav className="hidden items-center gap-8 md:flex">
            <a href="#how-it-works" className="text-sm font-medium text-slate-600 transition hover:text-slate-900">
              How it works
            </a>
            <CtaLink
              ctaId="header-call-now"
              href={`tel:${tollFreeNumber}`}
              className="text-sm font-medium text-slate-600 transition hover:text-slate-900"
            >
              Call now
            </CtaLink>
          </nav>
        </div>
      </header>

      <main>
        <Hero />
        <TrustStrip />
        <HowItWorks />

        <section className="mx-auto max-w-7xl px-6 pb-20 lg:px-8">
          <div className="rounded-[36px] bg-slate-950 px-8 py-12 text-center text-white shadow-2xl shadow-slate-400/20 sm:px-12">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">Ready to start?</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
              See what AI can do for your business today.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-300">
              Start an instant call with our AI consultant or request an immediate callback.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <CtaLink
                ctaId="footer-start-instant-call"
                href={`tel:${tollFreeNumber}`}
                className="inline-flex h-14 items-center justify-center rounded-2xl bg-emerald-500 px-7 text-base font-semibold text-slate-950 transition hover:-translate-y-0.5 hover:bg-emerald-400"
              >
                Start Instant Call
              </CtaLink>
              <CtaLink
                ctaId="footer-get-a-call-now"
                href="#callback"
                className="inline-flex h-14 items-center justify-center rounded-2xl border border-white/20 bg-white/5 px-7 text-base font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/10"
              >
                Get a Call Now
              </CtaLink>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
