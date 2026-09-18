import Link from "next/link";
import Logo from "@/components/Logo";
import Stat from "@/components/Stat";
import SegBar from "@/components/SegBar";
import { site } from "@/lib/site";

export default function Home() {
  return (
    <>
      {/* HERO. Primary layer: the wordmark. Secondary: mission. Tertiary: labels pinned to edges. */}
      <section className="relative overflow-hidden">
        <div className="dot-grid-subtle absolute inset-0 opacity-60" aria-hidden="true" />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 pt-20 sm:pt-32 pb-16 sm:pb-24">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 t-label">
            <span>{site.event}</span>
            <span aria-hidden="true">·</span>
            <span>{site.city}</span>
          </div>

          <div className="mt-10 sm:mt-14 flex items-end gap-4 sm:gap-8">
            <Logo size={88} className="text-text-display hidden sm:block shrink-0" />
            <h1 className="t-display text-[64px] sm:text-[120px] lg:text-[160px] leading-[0.9] break-words">GenFreZ</h1>
          </div>

          <p className="mt-6 font-mono text-[13px] sm:text-[14px] tracking-[0.08em] uppercase text-text-secondary">
            Your green reward platform &nbsp;·&nbsp; {site.tagline}
          </p>

          <p className="mt-10 sm:mt-12 max-w-xl text-[18px] sm:text-[20px] leading-[1.45] text-text-primary font-light">
            {site.mission}
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Link href="/solution" className="btn btn-primary">
              Explore our solution
            </Link>
            <a href={site.demoUrl} target="_blank" rel="noreferrer" className="btn btn-secondary">
              Open live demo ↗
            </a>
          </div>
        </div>
      </section>

      {/* THE ONE NUMBER */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-24 grid gap-12 lg:grid-cols-[1.4fr_1fr] items-end">
        <div>
          <Stat size="xl" value="95" unit="g CO₂ / km" label="Baseline · petrol motorbike in Hanoi traffic" note="Every point starts here. Avoided emissions = distance × (baseline − replacement). 1 point = 25 g CO₂ avoided = 100 ₫ of voucher." />
        </div>
        <div className="grid gap-6">
          <SegBar label="Electric motorbike · ~30 g/km" readout="−68%" value={0.68} tone="good" />
          <SegBar label="Bus · marginal rider · ~0 g/km" readout="−100%" value={1} tone="good" />
          <SegBar label="Electric car · 1 passenger · ~93 g/km" readout="−2%" value={0.02} tone="warn" />
          <p className="t-caption">A 5 km e-bike trip avoids 325 g. The same trip alone in an electric car avoids almost nothing. We show the arithmetic.</p>
        </div>
      </section>

      {/* THREE AUDIENCES */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-24">
        <p className="t-label">Three audiences · one engine</p>
        <div className="mt-8 grid gap-px sm:grid-cols-3 border-t border-border">
          {[
            { who: "Users, 16–24", what: "Earn points for bus, e-bike, walking and off-peak trips. No purchase required. Spend them on bubble tea, data plans, cinema, rides." },
            { who: "Green transport", what: "Xanh SM, TNGo, VinBus pay only on confirmed outcomes, and get transaction-level avoided-emission reports with a confidence tier on every line." },
            { who: "Banks & e-wallets", what: "Subscribe to labelled behaviour-change insight nobody else holds: how many points it takes before a rider leaves the motorbike at home." },
          ].map((c) => (
            <div key={c.who} className="py-8 sm:pr-8 border-b border-border">
              <h2 className="t-heading">{c.who}</h2>
              <p className="mt-3 text-[15px] text-text-secondary leading-relaxed">{c.what}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-24">
        <div className="border border-border-visible rounded-2xl p-8 sm:p-12 grid gap-8 lg:grid-cols-[1fr_auto] items-center">
          <div>
            <p className="t-label">Runs inside Zalo · 76.5M monthly users · nothing to install</p>
            <p className="mt-4 text-[24px] sm:text-[32px] leading-tight text-text-display font-light max-w-2xl">
              A 5 km bus ride beats a 100,000 ₫ coffee. That is the whole idea.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/solution" className="btn btn-primary">See how it works</Link>
            <Link href="/about" className="btn btn-secondary">Meet the team</Link>
          </div>
        </div>
      </section>
    </>
  );
}
