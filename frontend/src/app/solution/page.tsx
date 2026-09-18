import type { Metadata } from "next";
import Link from "next/link";
import PhoneFrame from "@/components/PhoneFrame";
import PointsCalc from "@/components/PointsCalc";
import SegBar from "@/components/SegBar";
import Stat from "@/components/Stat";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "Solution", description: "The problem, the AI-powered points engine, features, ESG impact and expected outcomes." };

function Section({ id, label, title, children }: { id: string; label: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-24 border-t border-border">
      <p className="t-label">{label}</p>
      <h2 className="t-display text-[32px] sm:text-[48px] mt-4 max-w-3xl">{title}</h2>
      <div className="mt-10">{children}</div>
    </section>
  );
}

export default function Solution() {
  return (
    <>
      <section className="mx-auto max-w-6xl px-4 sm:px-6 pt-16 sm:pt-24 pb-16">
        <p className="t-label">Solution</p>
        <h1 className="t-display text-[40px] sm:text-[72px] mt-4 max-w-4xl">A points engine where the currency is avoided CO₂.</h1>
        <nav aria-label="On this page" className="mt-10 flex flex-wrap gap-x-6 gap-y-2">
          {[
            ["#problem", "Problem"],
            ["#how", "How it works"],
            ["#demo", "Demo"],
            ["#features", "Features"],
            ["#esg", "ESG impact"],
            ["#outcomes", "Outcomes"],
          ].map(([h, l]) => (
            <a key={h} href={h} className="font-mono text-[12px] tracking-[0.08em] uppercase text-text-disabled hover:text-text-display transition-colors">
              {l}
            </a>
          ))}
        </nav>
      </section>

      {/* PROBLEM */}
      <Section id="problem" label="01 · The problem" title="Hanoi's greenest choices pay nothing. Its dirtiest one is the default.">
        <div className="grid gap-12 lg:grid-cols-3">
          <Stat value="76.5" unit="M" label="Zalo monthly active users" note="76.5% of Vietnam's population already has the distribution channel installed." />
          <Stat value="25" unit="%" label="Share of population born 1997–2012" note="Gen Z is the largest cohort, the primary motorbike-riding group, and the most incentive-responsive." />
          <Stat value="95" unit="g CO₂/km" label="Petrol motorbike, congested urban" note="Real-world consumption runs 3.0 to 7.9 L/100 km in Hanoi stop-and-go traffic." />
        </div>

        <div className="mt-16 grid gap-10 lg:grid-cols-2">
          <div>
            <p className="t-label mb-4">Two barriers keep young people on motorbikes</p>
            <div className="grid">
              <div className="row grid-cols-[32px_1fr]">
                <span className="t-data text-text-disabled">01</span>
                <div>
                  <p className="text-text-display">No incentive</p>
                  <p className="text-[14px] text-text-secondary mt-1">Students have low financial stability and respond strongly to vouchers, points and cashback. Public transit and green services offer none.</p>
                </div>
              </div>
              <div className="row grid-cols-[32px_1fr]">
                <span className="t-data text-text-disabled">02</span>
                <div>
                  <p className="text-text-display">Inconvenience</p>
                  <p className="text-[14px] text-text-secondary mt-1">Alternatives are fragmented, complex and less flexible than riding straight from home. Every extra app is a reason not to switch.</p>
                </div>
              </div>
            </div>
          </div>
          <div>
            <p className="t-label mb-4">What existing platforms verify</p>
            <div className="grid gap-5">
              <SegBar label="mGreen / Grac · recyclable waste, physical drop-off" readout="0.2" value={0.2} tone="warn" height={8} />
              <SegBar label="GreenPoints · self-reported behaviour" readout="0.2" value={0.2} tone="warn" height={8} />
              <SegBar label="Xanh SM loyalty · single closed ecosystem" readout="1.0 · 1 source" value={1} height={8} />
              <SegBar label="GenFreZ · partner webhooks + e-tickets + GPS" readout="1.0 · cross-partner" value={1} tone="good" height={8} />
              <p className="t-caption">Confidence coefficient of each platform’s evidence. Nobody else touches mobility, which is where Hanoi’s emissions actually are.</p>
            </div>
          </div>
        </div>
      </Section>

      {/* HOW IT WORKS */}
      <Section id="how" label="02 · The AI-powered engine" title="Five coefficients. One published formula. Every point auditable.">
        <p className="max-w-2xl text-[17px] font-light text-text-primary leading-relaxed">
          GenFreZ runs as a Zalo Mini App. Trips and purchases are recorded automatically, converted into avoided emissions, and priced into points by a scoring model. Learned models decide where reward budget goes and who is gaming the system. Rule-based lookups handle anything that has to stay auditable.
        </p>

        <div className="mt-10 border border-border-visible rounded-2xl p-6 sm:p-8 overflow-x-auto">
          <p className="t-label mb-3">Scoring formula</p>
          <p className="t-data text-[15px] sm:text-[20px] text-text-display whitespace-nowrap">
            points = avoided CO₂ × <span className="text-text-secondary">1/25 g</span> × confidence × additionality × budget
          </p>
        </div>

        <div className="mt-12">
          <PointsCalc />
        </div>

        <div className="mt-16 grid gap-12 lg:grid-cols-2">
          <div>
            <p className="t-label mb-4">Four-tier verification · confidence coefficient</p>
            <div className="grid gap-5">
              <SegBar label="A-1 · partner webhook (Xanh SM, VinBus, TNGo)" readout="1.0" value={1} tone="good" height={8} />
              <SegBar label="A-2 · Hanoi e-ticket tap-in / tap-out" readout="1.0" value={1} tone="good" height={8} />
              <SegBar label="B · Mini App GPS + rotating QR + route match" readout="0.6–0.8" value={0.7} height={8} />
              <SegBar label="C · self-report with photo" readout="0.2" value={0.2} tone="warn" height={8} />
            </div>
            <p className="t-caption mt-4">The action easiest to fake is discounted the most, so gaming it is not worth the effort.</p>
          </div>
          <div>
            <p className="t-label mb-4">Where AI is actually used</p>
            <dl>
              {[
                ["Emission factor conversion", "Rule-based lookup · must stay auditable"],
                ["Green taxonomy classification", "Agentic AI extraction from partner evidence (FPT)"],
                ["Conversion propensity", "Learned model · allocates voucher budget"],
                ["Trust score & fraud", "Anomaly detection · FPT eKYC + Data Suite"],
                ["Per-route peak windows", "Learned from historical map data"],
                ["GPS vs. route matching", "Rule-based with classification"],
              ].map(([k, v]) => (
                <div key={k} className="row grid-cols-1 sm:grid-cols-[1fr_1.2fr] py-3">
                  <dt className="text-text-display text-[15px]">{k}</dt>
                  <dd className="text-[13px] text-text-secondary">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </Section>

      {/* DEMO */}
      <Section id="demo" label="03 · Demo" title="The Mini App, running now.">
        <div className="grid gap-12 lg:grid-cols-[auto_1fr] items-start">
          <PhoneFrame />
          <div className="grid gap-8">
            {site.demoVideoId ? (
              <div className="aspect-video rounded-2xl overflow-hidden border border-border-visible">
                <iframe className="w-full h-full" src={`https://www.youtube-nocookie.com/embed/${site.demoVideoId}`} title="GenFreZ demo video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen style={{ border: 0 }} />
              </div>
            ) : (
              <div className="aspect-video rounded-2xl border border-border-visible dot-grid-subtle flex items-center justify-center">
                <p className="t-caption">[ DEMO VIDEO · COMING SOON ]</p>
              </div>
            )}
            <div className="grid">
              {[
                ["Home", "Points balance, distance to the next tier, today's top deals."],
                ["Missions", "Streak Rider, Green Steps, Crew Recruiter. Recorded automatically."],
                ["Green Challenges", "No-Motorbike Week, Rainy Day Rider, Campus Carpool."],
                ["Vouchers", "Redeem via deep link to the partner. The platform never holds funds."],
                ["Scan", "Dynamic QR at bus stops and TNGo stations, cross-checked with GPS."],
              ].map(([k, v]) => (
                <div key={k} className="row grid-cols-[120px_1fr] py-3">
                  <span className="t-label pt-0.5">{k}</span>
                  <span className="text-[14px] text-text-secondary">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* FEATURES */}
      <Section id="features" label="04 · Key features & benefits" title="Built for people who spend often, not big.">
        <div className="grid gap-px sm:grid-cols-2 lg:grid-cols-3 border-t border-border">
          {[
            ["Earn without spending", "Bus, walking, off-peak and ride-sharing missions issue points with no transaction. A user with no money still earns."],
            ["Nothing to install", "Runs inside Zalo. No new app, account or habit. Missions are recorded automatically."],
            ["Fixed, published rate", "1 point = 100 ₫ of voucher = 25 g CO₂ avoided. No badges, no abstract scores."],
            ["Pay on outcomes", "Partners pay when a rewarded user walks in. Budget risk close to zero."],
            ["Cross-subsidy fund", "Surplus above the 2.5% platform floor on F&B commission funds the bus riders. +21.6M ₫ net per year at pilot scale."],
            ["Community that works", "District leaderboards, weekly Green Challenges, Green Ambassadors, and users voting on which partners join next."],
            ["Route, never hold funds", "Deep link with a verification token to the partner's checkout. No e-wallet licence, no 50 B ₫ charter capital."],
            ["Emission reports for partners", "Transaction-level avoided-emission data with a confidence tier per line, for Decree 06/2022 GHG inventories."],
            ["Anti-fraud by construction", "Frequency caps, plausibility checks, 24–48 h pending state, and additionality that zeroes out round-trip farming."],
          ].map(([k, v]) => (
            <div key={k} className="py-7 sm:pr-8 border-b border-border">
              <h3 className="text-[18px] text-text-display">{k}</h3>
              <p className="mt-2 text-[14px] text-text-secondary leading-relaxed">{v}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ESG */}
      <Section id="esg" label="05 · ESG impact" title="Environmental, social, governance. Measured, not asserted.">
        <div className="grid gap-12 lg:grid-cols-3">
          <div>
            <p className="t-label">Environmental</p>
            <p className="t-display text-[48px] mt-3 flex items-baseline gap-2">325<span className="font-mono text-[12px] uppercase tracking-[0.08em] text-text-secondary font-normal">g CO₂</span></p>
            <p className="text-[14px] text-text-secondary mt-2">avoided per 5 km e-bike trip replacing a petrol motorbike. Marginal-emissions accounting means bus riders are rewarded for the trip they displaced, with the arithmetic shown.</p>
            <p className="text-[14px] text-text-secondary mt-3">Fewer motorbike kilometres in Hanoi means less PM2.5 and less peak-hour congestion, with off-peak bonuses learned per corridor.</p>
          </div>
          <div>
            <p className="t-label">Social</p>
            <p className="t-display text-[48px] mt-3 flex items-baseline gap-2">0<span className="font-mono text-[12px] uppercase tracking-[0.08em] text-text-secondary font-normal">₫ needed to earn</span></p>
            <p className="text-[14px] text-text-secondary mt-2">Behavioural missions reward students with no spending power. Points track avoided emissions, so a bus ride beats a coffee order. Fairness is a design constraint, not a slogan.</p>
            <p className="text-[14px] text-text-secondary mt-3">Campus ambassadors and district leaderboards build habits through peers, not paid media.</p>
          </div>
          <div>
            <p className="t-label">Governance</p>
            <p className="t-display text-[48px] mt-3 flex items-baseline gap-2">3<span className="font-mono text-[12px] uppercase tracking-[0.08em] text-text-secondary font-normal">decrees, by design</span></p>
            <p className="text-[14px] text-text-secondary mt-2">Decree 13/2023 consent screens before any data collection. Decree 52/2024: no funds held, no payment intermediation. E-Commerce Law 2025: ambassadors verified by FPT eKYC.</p>
            <p className="text-[14px] text-text-secondary mt-3">Green-partner labels are checked against Decision 21/2025 and the VCCI CSI index, never self-declared.</p>
          </div>
        </div>
      </Section>

      {/* OUTCOMES */}
      <Section id="outcomes" label="06 · Expected outcomes & metrics" title="Year 1 targets, stated as assumptions.">
        <div className="grid gap-12 lg:grid-cols-[1fr_1fr]">
          <div className="grid gap-8">
            <SegBar label="Monthly active users · Q4 target 12,000" readout="1.5k → 12k" value={1} height={12} />
            <SegBar label="Registrations · 30,000 at 13,600 ₫ blended CAC" readout="30,000" value={1} height={12} />
            <SegBar label="Insight subscribers · banks & e-wallets" readout="0 → 10" value={0.6} height={12} />
            <SegBar label="Stream 3 partners needed for Year 2 break-even" readout="14–17" value={0.85} tone="warn" height={12} />
            <p className="t-caption">Break-even depends on partner count, not user growth: across 12k to 40k MAU the partners needed only move between 14 and 17.</p>
          </div>
          <div>
            <dl>
              {[
                ["Year 1 recognised revenue", "429.1 M ₫"],
                ["December exit run-rate, annualised", "926.4 M ₫"],
                ["Year 1 cost (52% payroll, 0% infra)", "1,705 M ₫"],
                ["Funding ask · 18 months runway", "~1.9 B ₫"],
                ["Cross-subsidy fund, net per year", "+21.6 M ₫"],
                ["Transacting users at exit", "3,000 · 4 txn/mo"],
                ["Points issued per 5 km e-bike trip", "13 · pilot budget 0.3"],
              ].map(([k, v]) => (
                <div key={k} className="row grid-cols-[1fr_auto] py-3">
                  <dt className="t-label pt-0.5">{k}</dt>
                  <dd className="t-data text-[15px] text-text-display text-right">{v}</dd>
                </div>
              ))}
            </dl>
            <p className="t-caption mt-4">All figures from the GenFreZ business model canvas, August 2026. Infrastructure is FPT-sponsored in Year 1.</p>
          </div>
        </div>

        <div className="mt-16 flex flex-wrap gap-3">
          <Link href="/contact" className="btn btn-primary">Partner with us</Link>
          <a href={site.demoUrl} target="_blank" rel="noreferrer" className="btn btn-secondary">Try the demo ↗</a>
        </div>
      </Section>
    </>
  );
}
