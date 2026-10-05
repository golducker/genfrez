import { Fragment } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";
import Mascot from "@/components/Mascot";
import Stat from "@/components/Stat";
import SegBar from "@/components/SegBar";
import Icon from "@/components/Icon";
import Split from "@/components/fx/Split";
import Leaves from "@/components/fx/Leaves";
import Marquee from "@/components/fx/Marquee";
import { site } from "@/lib/site";

const d = (s: number) => ({ "--d": `${s}s` }) as React.CSSProperties;

const REWARDS = ["Bubble tea", "Data", "Cinema", "Rides", "Secondhand", "Study", "More"];

function Star() {
  return (
    <svg viewBox="0 0 24 24" className="mq-star" fill="currentColor" aria-hidden="true">
      <path d="M12 0c.6 6.4 5.6 11.4 12 12-6.4.6-11.4 5.6-12 12-.6-6.4-5.6-11.4-12-12C6.4 11.4 11.4 6.4 12 0z" />
    </svg>
  );
}

export default function HomeSection() {
  return (
    <>
      {/* HERO */}
      <section data-hero className="relative overflow-hidden">
        <div aria-hidden="true" className="blob bg-[var(--leaf-light)] w-[560px] h-[560px] -top-48 -right-40" />
        <div aria-hidden="true" className="blob bg-[var(--sky)] w-[440px] h-[440px] top-72 -left-48" />
        <div aria-hidden="true" className="blob bg-[#ffd9bf] w-[300px] h-[300px] bottom-0 right-[30%] !opacity-40" />
        <Leaves count={20} />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 pt-14 sm:pt-20 pb-20 sm:pb-28 grid gap-14 lg:grid-cols-[1.25fr_1fr] items-center">
          <div data-hero-out>
            <p className="t-label enter" style={d(0)}>
              {site.event} · {site.city}
            </p>

            <div className="mt-8 flex items-center gap-4 sm:gap-6">
              <span className="enter-pop shrink-0 hidden sm:block" style={d(0.05)}>
                <Logo size={104} label className="block nav-logo-mark" />
              </span>
              <h1 className="t-display text-[64px] sm:text-[104px] lg:text-[120px]" aria-label={site.name}>
                <span className="hero-word" aria-hidden="true">
                  {"GenFre".split("").map((c, i) => (
                    <span key={i} style={{ "--i": i } as React.CSSProperties}>
                      {c}
                    </span>
                  ))}
                  <span className="z hero-z">Z</span>
                </span>
              </h1>
            </div>

            <p className="enter mt-6 text-[24px] sm:text-[32px] font-extrabold tracking-[-0.02em] text-text-display leading-tight" style={d(0.45)}>
              Turn <span className="text-[var(--success)]">Green</span> into <span className="text-accent-text">Gains</span>
            </p>
            <p className="t-label mt-3 enter" style={d(0.55)}>
              Your green reward platform · {site.subTagline}
            </p>

            <p className="enter mt-8 max-w-xl text-[18px] sm:text-[20px] leading-relaxed text-text-primary" style={d(0.65)}>
              {site.mission}
            </p>

            <div className="enter mt-10 flex flex-wrap items-center gap-3" style={d(0.8)}>
              <Link href="/#solution" className="btn btn-primary btn-lg">
                <span>Explore our solution ↗</span>
              </Link>
              <Link href="/#demo" className="btn btn-secondary btn-lg">
                <span>See the live demo ↓</span>
              </Link>
            </div>

            <a href="#about" className="scroll-cue enter mt-14 hidden lg:inline-flex" style={d(1.1)}>
              <i aria-hidden="true" />
              Scroll to explore
            </a>
          </div>

          {/* Product moment, lifted from the Mini App home screen */}
          <div data-hero-out className="relative mx-auto w-full max-w-[420px] pt-10 pb-24" aria-label="Preview of the GenFreZ points card" role="img">
            <span className="enter-pop absolute -top-2 right-2 z-10" style={d(0.9)}>
              <Mascot name="star-cool" scale={0.9} className="bob [--r:8deg]" />
            </span>

            <div className="points-card-in">
              <div data-tilt="10" className="points-card tone-navy card p-6 sm:p-8 rounded-[32px]">
                <p className="text-[15px] font-semibold text-text-secondary">Hello, Tèo!</p>
                <p className="mt-5 t-label">My points</p>
                <p className="mt-1 t-display text-[48px] sm:text-[56px]">
                  <span className="tabular-nums" data-count="13667" data-sep="." data-delay="hero" data-duration="2.2">
                    13.667
                  </span>
                  <span className="text-[20px] text-text-secondary font-bold"> / 15.000</span>
                </p>
                <div className="mt-4">
                  <SegBar value={13667 / 15000} segments={24} tone="warn" height={10} />
                </div>
                <p className="mt-4 text-[15px] text-text-primary">
                  <span className="font-bold text-accent-text">1.333 more points</span> and Gold is yours!
                </p>
                <div className="mt-6 grid grid-cols-3 gap-2">
                  {["Missions", "Vouchers", "Scan"].map((k) => (
                    <span key={k} className="rounded-2xl bg-surface-raised px-2 py-3 text-center text-[13px] font-bold text-text-display">
                      {k}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Points landing in real time: three notifications take turns in the same spot */}
            <span className="chip-float chip-first right-0 sm:-right-6 bottom-6" style={{ "--cd": "2.2s" } as React.CSSProperties} aria-hidden="true">
              <i>
                <Icon name="bus" size={15} />
              </i>
              Bus 08 · 5 km <b>+3.8</b>
            </span>
            <span className="chip-float right-0 sm:-right-6 bottom-6" style={{ "--cd": "4.7s" } as React.CSSProperties} aria-hidden="true">
              <i>
                <Icon name="bike" size={15} />
              </i>
              TNGo e-bike · 3 km <b>+2.3</b>
            </span>
            <span className="chip-float right-0 sm:-right-6 bottom-6" style={{ "--cd": "7.2s" } as React.CSSProperties} aria-hidden="true">
              <i>
                <Icon name="leaf" size={15} />
              </i>
              Walk · 2 km <b>+1.6</b>
            </span>

            <span className="enter-pop absolute -bottom-10 -left-4 sm:-left-16" style={d(1.05)}>
              <Mascot name="green-kiss" scale={0.95} className="bob-slow [--r:-6deg]" />
            </span>
          </div>
        </div>
      </section>

      {/* YOUR GREEN MOVE */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-12 sm:py-20 grid gap-8 lg:grid-cols-[1.1fr_1fr] items-stretch">
        <div data-reveal="left" className="tone-navy card relative overflow-hidden p-8 sm:p-10">
          <div data-speed="-0.15" className="absolute right-6 top-6">
            <Mascot name="flame" scale={1.2} className="bob opacity-90" />
          </div>
          <p className="t-label text-accent-text">Your green move starts here</p>
          <div className="mt-6">
            <Stat size="xl" value="95" countTo={95} unit="g CO₂ / km" label="Baseline · petrol motorbike in Hanoi traffic" />
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-2" data-stagger>
            <p className="rounded-2xl bg-surface px-5 py-4 text-[15px] text-text-primary">
              <span className="block t-data text-[24px] text-text-display">1 point</span>= 25 g CO₂ avoided
            </p>
            <p className="rounded-2xl bg-surface px-5 py-4 text-[15px] text-text-primary">
              <span className="block t-data text-[24px] text-text-display">1 point</span>= 100 đ voucher value
            </p>
          </div>
        </div>

        <div data-reveal="right" className="card p-8 sm:p-10 grid gap-7 content-center">
          <p className="t-heading text-[26px]">Your move, your impact</p>
          <SegBar label="Electric motorbike · ~30 g/km" readout="−68%" value={0.68} tone="good" height={14} />
          <SegBar label="Bus · ~0 g/km" readout="~ −100%" value={1} tone="good" height={14} />
          <SegBar label="Electric car · 1 passenger · ~93 g/km" readout="−2%" value={0.02} tone="warn" height={14} />
          <p className="text-[15px] text-text-secondary leading-relaxed">
            A 5 km e-bike trip can avoid 325 g CO₂ compared with a petrol motorbike. That impact becomes points you can actually use.
          </p>
        </div>
      </section>

      {/* ONE MOVE, THREE IMPACTS */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-24">
        <h2 data-split className="t-display text-[40px] sm:text-[72px] max-w-3xl">
          <Split text="One move." /> <Split text="Three impacts." className="text-accent-text" />
        </h2>
        <div className="mt-12 grid gap-5 lg:grid-cols-[1.25fr_1fr]">
          <article data-reveal="scale" className="card card-lift relative overflow-hidden p-8 sm:p-10 min-h-[320px] flex flex-col justify-between">
            <div aria-hidden="true" className="absolute -right-24 -bottom-24 w-[320px] h-[320px] rounded-full bg-[var(--leaf-light)] opacity-60 blur-2xl" />
            <div className="relative">
              <p className="t-label">You · 16–24</p>
              <h3 className="mt-4 t-display text-[32px] sm:text-[44px] max-w-sm">Make greener moves.</h3>
              <p className="mt-3 text-[18px] text-text-primary max-w-sm">Earn points. Redeem everyday perks.</p>
            </div>
            <Mascot name="blue-wave" scale={1.3} className="relative self-end -mb-4 mt-6 bob" />
          </article>
          <div className="grid gap-5">
            <article data-reveal="right" className="card card-lift p-8 flex gap-6 items-start">
              <div className="flex-1">
                <p className="t-label">Green partners</p>
                <p className="mt-3 text-[18px] font-semibold text-text-display leading-snug">Turn verified green activity into measurable impact and reach young customers.</p>
              </div>
              <Mascot name="crowd" scale={0.8} className="shrink-0" />
            </article>
            <article data-reveal="right" className="card card-lift p-8 flex gap-6 items-start">
              <div className="flex-1">
                <p className="t-label">Banks & e-wallets</p>
                <p className="mt-3 text-[18px] font-semibold text-text-display leading-snug">Understand green behaviour and build smarter engagement with Gen Z.</p>
              </div>
              <Mascot name="eyes" scale={0.7} className="shrink-0" />
            </article>
          </div>
        </div>
      </section>

      {/* REWARDS RIBBON */}
      <section aria-label="Reward categories" className="overflow-hidden py-10 sm:py-14 select-none">
        <div className="-mx-12 grid gap-2 -rotate-2">
        <Marquee
          speed={46}
          items={REWARDS.map((r, i) => (
            <Fragment key={r}>
              <span className={`mq-word ${i % 2 ? "mq-outline" : ""}`}>{r}</span>
              <Star />
            </Fragment>
          ))}
        />
        <Marquee
          reverse
          speed={52}
          className="opacity-90"
          items={["Ride", "Walk", "Share", "Switch", "Earn", "Redeem"].map((r, i) => (
            <Fragment key={r}>
              <span className={`mq-word ${i % 2 ? "" : "mq-outline"} !text-[clamp(28px,4.5vw,56px)]`}>{r}</span>
              <Mascot name={(["heart-hug", "yellow-tongue", "star-cool", "green-kiss", "blue-wave", "square-wave"] as const)[i]} scale={0.55} />
            </Fragment>
          ))}
        />
        </div>
      </section>

      {/* REWARDS */}
      <section className="relative">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-20 sm:py-28 grid gap-12 lg:grid-cols-[1.3fr_1fr] items-center">
          <div>
            <h2 data-split className="t-display text-[40px] sm:text-[64px]">
              <Split text="Go green. Get rewards." />
            </h2>
            <p data-reveal className="mt-5 text-[20px] text-text-primary max-w-xl">
              Your points can unlock the things you already love.
            </p>
            <ul className="mt-8 flex flex-wrap gap-2" aria-label="Reward categories" data-stagger>
              {REWARDS.map((r) => (
                <li key={r} className="pill">
                  {r}
                </li>
              ))}
            </ul>
            <div data-reveal className="mt-10">
              <Link href="/#how" className="btn btn-primary btn-lg">
                <span>See how it works →</span>
              </Link>
            </div>
          </div>
          <div className="relative h-[260px] sm:h-[320px]" aria-hidden="true">
            <div data-speed="0.35" className="absolute left-4 top-6">
              <Mascot name="yellow-tongue" scale={1.5} className="bob [--r:-8deg]" />
            </div>
            <div data-speed="-0.25" className="absolute right-6 bottom-0">
              <Mascot name="heart-hug" scale={1.4} className="bob-slow [--r:6deg]" />
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 pt-20 sm:pt-28">
        <div data-reveal="scale" className="aurora tone-navy card relative px-8 py-10 sm:px-12 sm:py-12 grid gap-8 sm:grid-cols-[auto_1fr_auto] items-center">
          <div aria-hidden="true" className="aurora-glow" />
          <Mascot name="megaphone" scale={1} className="hidden sm:inline-block bob" />
          <p className="t-display text-[32px] sm:text-[44px]">Ready to make your move?</p>
          <a href={site.demoUrl} target="_blank" rel="noreferrer" className="btn btn-primary btn-lg justify-self-start">
            <span>Try the live demo ↗</span>
          </a>
        </div>
      </section>
    </>
  );
}
