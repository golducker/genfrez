import fs from "node:fs";
import path from "node:path";
import Link from "next/link";
import Mascot from "@/components/Mascot";
import type { MascotName } from "@/lib/mascots";
import DemoStage, { type DemoScreen } from "@/components/DemoStage";
import DemoVideo from "@/components/DemoVideo";
import RouteSteps from "@/components/RouteSteps";
import PointsCalc from "@/components/PointsCalc";
import Split from "@/components/fx/Split";
import SegBar from "@/components/SegBar";
import Stat from "@/components/Stat";
import { site } from "@/lib/site";

/* Mascots only where the copy is not about money or terms. */
function Section({ id, label, title, mascot, children }: { id: string; label: string; title: string; mascot?: MascotName; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-20 sm:py-28">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p data-reveal className="t-label label-rule text-accent-text">{label}</p>
            <h3 data-split className="t-display text-[34px] sm:text-[56px] mt-4 max-w-3xl">
              <Split text={title} />
            </h3>
          </div>
          {mascot && (
            <div data-reveal="pop" className="hidden md:block shrink-0">
              <Mascot name={mascot} scale={1.1} className="bob" />
            </div>
          )}
        </div>
        <div className="mt-12">{children}</div>
      </div>
    </section>
  );
}

const DEMO_SCREENS: DemoScreen[] = [
  { title: "Home", body: "Points balance, distance to the next tier, today's top deals.", icon: "home" },
  { title: "Missions", body: "Streak Rider, Green Steps, Crew Recruiter. Recorded automatically.", icon: "flame" },
  { title: "Green Challenges", body: "No-Motorbike Week, Rainy Day Rider, Campus Carpool.", icon: "trophy" },
  { title: "Vouchers", body: "Redeem via deep link to the partner. The platform never holds funds.", icon: "ticket" },
  { title: "Scan", body: "Dynamic QR at bus stops and TNGo stations, cross-checked with GPS.", icon: "scan" },
];

function Card({ title, body }: { title: string; body: string }) {
  return (
    <div className="card card-lift p-7">
      <h4 className="text-[18px] font-bold text-text-display">{title}</h4>
      <p className="mt-2 text-[15px] text-text-secondary leading-relaxed">{body}</p>
    </div>
  );
}

export default function SolutionSection() {
  const hasVideoFile = fs.existsSync(path.join(process.cwd(), "public", site.demoVideoFile));
  return (
    <>
      <section className="relative">
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 pt-16 sm:pt-24 pb-16">
        <p data-reveal className="t-label label-rule">Solution</p>
        <h2 data-split className="t-display text-[44px] sm:text-[88px] mt-4 max-w-5xl">
          <Split text="A points engine where the currency is" /> <Split text="avoided CO₂." className="text-[var(--success)]" />
        </h2>
        <nav aria-label="On this page" className="mt-10 flex flex-wrap gap-2" data-stagger>
          {[
            ["#problem", "Problem"],
            ["#how", "How it works"],
            ["#demo", "Demo"],
            ["#features", "Features"],
            ["#esg", "ESG impact"],
            ["#outcomes", "Outcomes"],
          ].map(([h, l]) => (
            <a key={h} href={h} className="pill border border-border hover:border-text-display transition-colors">
              {l}
            </a>
          ))}
        </nav>
        </div>
      </section>

      {/* PROBLEM */}
      <Section id="problem" label="01 · The problem" mascot="fluffy-scared" title="Hanoi's greenest choices pay nothing. Its dirtiest one is the default.">
        <p data-scrub className="max-w-4xl text-[24px] sm:text-[34px] font-bold tracking-[-0.02em] text-text-display leading-snug">
          <Split text="Every kilometre on a petrol motorbike in Hanoi traffic puts out 95 g of CO₂, and the largest, most incentive-responsive generation rides them every day. The bus, the e-bike, their own two feet: none of it pays anything back." />
        </p>
        {/* TODO(Minh): add a source for the Gen Z share and the fuel-consumption range before publishing. */}
        <div className="mt-12 grid gap-12 lg:grid-cols-3" data-stagger>
          <Stat value="79.6" countTo={79.6} decimals={1} unit="M" label="Zalo monthly active users" note="The distribution channel is already on their phones." source="Zalo, Dec 2025" />
          <Stat value="25" countTo={25} unit="%" label="Share of population born 1997–2012" note="Gen Z is the largest cohort, the primary motorbike-riding group, and the most incentive-responsive." />
          <Stat value="95" countTo={95} unit="g CO₂/km" label="Petrol motorbike, congested urban" note="Real-world consumption runs 3.0 to 7.9 L/100 km in Hanoi stop-and-go traffic." />
        </div>

        <div className="mt-16 grid gap-10 lg:grid-cols-2">
          <div>
            <p className="t-label mb-4">Two barriers keep young people on motorbikes</p>
            <div className="grid gap-3" data-stagger>
              <div className="card p-6 grid grid-cols-[40px_1fr] gap-3">
                <span className="t-data text-[20px] text-accent-text">01</span>
                <div>
                  <p className="font-bold text-text-display">No incentive</p>
                  <p className="text-[14px] text-text-secondary mt-1">Students have low financial stability and respond strongly to vouchers, points and cashback. Public transit and green services offer none.</p>
                </div>
              </div>
              <div className="card p-6 grid grid-cols-[40px_1fr] gap-3">
                <span className="t-data text-[20px] text-accent-text">02</span>
                <div>
                  <p className="font-bold text-text-display">Inconvenience</p>
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
        <p className="max-w-2xl text-[17px] text-text-primary leading-relaxed">
          GenFreZ runs as a Zalo Mini App. Trips and purchases are recorded automatically, converted into avoided emissions, and priced into points by a scoring model. Learned models decide where reward budget goes and who is gaming the system. Rule-based lookups handle anything that has to stay auditable.
        </p>

        <div className="mt-12">
          <RouteSteps />
        </div>

        <div data-reveal="scale" className="aurora mt-16 tone-navy card p-6 sm:p-8">
          <div aria-hidden="true" className="aurora-glow" />
          <p className="t-label mb-3">Scoring formula</p>
          <div className="overflow-x-auto" data-lenis-prevent>
            <p className="t-data text-[15px] sm:text-[22px] text-text-display whitespace-nowrap" data-stagger>
              {["points =", "avoided CO₂", "× 1/25 g", "× confidence", "× additionality", "× budget"].map((t, i) => (
                <span key={t} className={`inline-block mr-2 ${i === 2 ? "text-text-secondary" : i === 0 ? "text-accent-text" : ""}`}>
                  {t}
                </span>
              ))}
            </p>
          </div>
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
            <dl data-stagger>
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
      <Section id="demo" label="03 · Demo" title="The Mini App, running now. Tap it.">
        <DemoStage screens={DEMO_SCREENS} />

        <div className="mt-20 sm:mt-28">
          {hasVideoFile ? (
            <DemoVideo src={`/${site.demoVideoFile}`} poster={`/${site.demoVideoPoster}`} title="GenFreZ demo video" />
          ) : site.demoVideoId ? (
            <div data-reveal="scale" className="video-shell">
              <iframe className="absolute inset-0 w-full h-full" src={`https://www.youtube-nocookie.com/embed/${site.demoVideoId}`} title="GenFreZ demo video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen style={{ border: 0 }} />
            </div>
          ) : null}
        </div>
      </Section>

      {/* FEATURES */}
      <Section id="features" label="04 · Key features & benefits" title="Built for people who spend often, not big.">
        <div>
          <p className="t-label mb-4">Features · what the platform does</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" data-stagger>
            {[
              ["Nothing to install", "Runs inside Zalo. No new app, account or habit. Missions are recorded automatically."],
              ["Fixed, published rate", "1 point = 100 ₫ of voucher = 25 g CO₂ avoided. No badges, no abstract scores."],
              ["Route, never hold funds", "Deep link with a verification token to the partner's checkout. No e-wallet licence, no 50 B ₫ charter capital."],
              ["Anti-fraud by construction", "Frequency caps, plausibility checks, 24–48 h pending state, and additionality that zeroes out round-trip farming."],
              ["Emission reports for partners", "Transaction-level avoided-emission data with a confidence tier per line, for Decree 06/2022 GHG inventories."],
            ].map(([k, v]) => (
              <Card key={k} title={k} body={v} />
            ))}
          </div>
        </div>
        <div className="mt-16">
          <p className="t-label mb-4">Benefits · what each side gets</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2" data-stagger>
            {[
              ["Earn without spending", "Bus, walking, off-peak and ride-sharing missions issue points with no transaction. A user with no money still earns."],
              ["Community that works", "District leaderboards, weekly Green Challenges, Green Ambassadors, and users voting on which partners join next."],
              ["Pay on outcomes", "Partners fund a discount only when a rewarded user walks in. Budget risk close to zero."],
              ["Cross-subsidy fund", "Surplus above the 2.5% platform floor on F&B commission tops up rewards for green rides. +21.6M ₫ net per year at pilot scale."],
            ].map(([k, v]) => (
              <Card key={k} title={k} body={v} />
            ))}
          </div>
        </div>
      </Section>

      {/* ESG */}
      <Section id="esg" label="05 · ESG impact" title="Environmental, social, governance. Measured, not asserted.">
        <div className="grid gap-4 lg:grid-cols-3" data-stagger>
          <div className="card card-lift p-7">
            <p className="t-label">Environmental</p>
            <p className="t-display text-[48px] mt-3 flex items-baseline gap-2"><span className="tabular-nums" data-count="325">325</span><span className="text-[14px] font-bold text-text-secondary">g CO₂</span></p>
            <p className="text-[14px] text-text-secondary mt-2">avoided per 5 km e-bike trip replacing a petrol motorbike. Marginal-emissions accounting means bus riders are rewarded for the trip they displaced, with the arithmetic shown.</p>
            <p className="text-[14px] text-text-secondary mt-3">Fewer motorbike kilometres in Hanoi means less PM2.5 and less peak-hour congestion, with off-peak bonuses learned per corridor.</p>
          </div>
          <div className="card card-lift p-7">
            <p className="t-label">Social</p>
            <p className="t-display text-[48px] mt-3 flex items-baseline gap-2">0<span className="text-[14px] font-bold text-text-secondary">₫ needed to earn</span></p>
            <p className="text-[14px] text-text-secondary mt-2">Behavioural missions reward students with no spending power. Points track avoided emissions, so a bus ride beats a coffee order. Fairness is a design constraint, not a slogan.</p>
            <p className="text-[14px] text-text-secondary mt-3">Campus ambassadors and district leaderboards build habits through peers, not paid media.</p>
          </div>
          <div className="card card-lift p-7">
            <p className="t-label">Governance</p>
            <p className="t-display text-[48px] mt-3 flex items-baseline gap-2"><span className="tabular-nums" data-count="3">3</span><span className="text-[14px] font-bold text-text-secondary">decrees, by design</span></p>
            <p className="text-[14px] text-text-secondary mt-2">Decree 13/2023 consent screens before any data collection. Decree 52/2024: no funds held, no payment intermediation. E-Commerce Law 2025: ambassadors verified by FPT eKYC.</p>
            <p className="text-[14px] text-text-secondary mt-3">Green-partner labels are checked against Decision 21/2025 and the VCCI CSI index, never self-declared.</p>
          </div>
        </div>

        {/* TODO(Minh): confirm scale-up wording and add figures once the model has them. */}
        <div data-reveal="scale" className="mt-6 tone-navy card p-8 sm:p-10 grid gap-6 lg:grid-cols-[1fr_2fr]">
          <div>
            <p className="t-label">Scale-up influence</p>
            <p className="t-display text-[28px] sm:text-[36px] mt-3 leading-tight">From one city to many.</p>
          </div>
          <div className="grid gap-4 text-[15px] text-text-secondary leading-relaxed">
            <p>The engine is not tied to Hanoi. Any city where a partner can send verified trip data can plug into the same formula, the same confidence tiers and the same fixed rate.</p>
            <p>Every partner added widens the set of green choices that earn points, and every rider added makes the behaviour-change data more useful to banks and e-wallets. Impact and revenue grow on the same curve.</p>
            <p>At scale, avoided emissions become a reportable, audited dataset for partners&apos; GHG inventories, and a proof point for city-level mobility policy.</p>
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
            <dl data-stagger>
              {[
                ["Year 1 recognised revenue", "429.1 M ₫"],
                ["December exit run-rate, annualised", "926.4 M ₫"],
                ["Year 1 cost (52% payroll, 0% infra)", "1,705 M ₫"],
                ["Funding ask · 18 months runway", "~1.9 B ₫"],
                ["Cross-subsidy fund, net per year", "+21.6 M ₫"],
                ["Transacting users at exit", "3,000 · 4 txn/mo"],
                ["Points issued per 5 km e-bike trip", "4 · pilot budget 0.3"],
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

        <div data-reveal="scale" className="aurora mt-16 tone-navy card p-8 sm:p-10 flex flex-wrap items-center justify-between gap-6">
          <div aria-hidden="true" className="aurora-glow" />
          <p className="t-display text-[28px] sm:text-[40px]">Grow with GenFreZ.</p>
          <div className="flex flex-wrap gap-3">
            <Link href="/#contact" className="btn btn-primary btn-lg"><span>Partner with us →</span></Link>
            <a href={site.demoUrl} target="_blank" rel="noreferrer" className="btn btn-secondary btn-lg"><span>Try the demo ↗</span></a>
          </div>
        </div>
      </Section>
    </>
  );
}
