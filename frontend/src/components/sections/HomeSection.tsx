import Link from "next/link";
import Logo, { Wordmark } from "@/components/Logo";
import Mascot from "@/components/Mascot";
import Stat from "@/components/Stat";
import SegBar from "@/components/SegBar";
import { site } from "@/lib/site";

export default function HomeSection() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div aria-hidden="true" className="blob bg-[var(--leaf-light)] w-[520px] h-[520px] -top-48 -right-40" />
        <div aria-hidden="true" className="blob bg-[var(--sky)] w-[420px] h-[420px] top-72 -left-48" />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 pt-14 sm:pt-20 pb-20 sm:pb-28 grid gap-14 lg:grid-cols-[1.25fr_1fr] items-center">
          <div>
            <p className="t-label">
              {site.event} · {site.city}
            </p>

            <div className="mt-8 flex items-center gap-4 sm:gap-6">
              <Logo size={104} label className="shrink-0 hidden sm:block" />
              <h1 className="t-display text-[64px] sm:text-[104px] lg:text-[120px]">
                <Wordmark />
              </h1>
            </div>

            <p className="mt-6 text-[24px] sm:text-[32px] font-extrabold tracking-[-0.02em] text-text-display leading-tight">{site.tagline}</p>
            <p className="t-label mt-3">Your green reward platform · {site.subTagline}</p>

            <p className="mt-8 max-w-xl text-[18px] sm:text-[20px] leading-relaxed text-text-primary">{site.mission}</p>

            <div className="mt-10 flex flex-wrap items-center gap-3">
              <Link href="/#solution" className="btn btn-primary btn-lg">
                Explore our solution ↗
              </Link>
              <a href={site.demoUrl} target="_blank" rel="noreferrer" className="btn btn-secondary btn-lg">
                Open live demo ↗
              </a>
            </div>
          </div>

          {/* Product moment, lifted from the Mini App home screen */}
          <div className="relative mx-auto w-full max-w-[420px] pt-10 pb-24" aria-label="Preview of the GenFreZ points card" role="img">
            <Mascot name="star-cool" scale={0.9} className="bob absolute -top-2 right-2 z-10 [--r:8deg]" />
            <div className="tone-navy card p-6 sm:p-8 rounded-[32px] rotate-[-2deg]">
              <p className="text-[15px] font-semibold text-text-secondary">Hello, Tèo!</p>
              <p className="mt-5 t-label">My points</p>
              <p className="mt-1 t-display text-[48px] sm:text-[56px]">
                13.667<span className="text-[20px] text-text-secondary font-bold"> / 15.000</span>
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
            <Mascot name="green-kiss" scale={0.95} className="bob-slow absolute -bottom-10 -left-4 sm:-left-16 [--r:-6deg]" />
          </div>
        </div>
      </section>

      {/* YOUR GREEN MOVE */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-12 sm:py-20 grid gap-8 lg:grid-cols-[1.1fr_1fr] items-stretch">
        <div className="reveal tone-navy card relative overflow-hidden p-8 sm:p-10">
          <Mascot name="flame" scale={1.2} className="absolute right-6 top-6 opacity-90" />
          <p className="t-label text-accent-text">Your green move starts here</p>
          <div className="mt-6">
            <Stat size="xl" value="95" unit="g CO₂ / km" label="Baseline · petrol motorbike in Hanoi traffic" />
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <p className="rounded-2xl bg-surface px-5 py-4 text-[15px] text-text-primary">
              <span className="block t-data text-[24px] text-text-display">1 point</span>= 25 g CO₂ avoided
            </p>
            <p className="rounded-2xl bg-surface px-5 py-4 text-[15px] text-text-primary">
              <span className="block t-data text-[24px] text-text-display">1 point</span>= 100 đ voucher value
            </p>
          </div>
        </div>

        <div className="reveal card p-8 sm:p-10 grid gap-7 content-center">
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
        <h2 className="reveal t-display text-[40px] sm:text-[64px] max-w-3xl">
          One move. <span className="text-accent-text">Three impacts.</span>
        </h2>
        <div className="mt-12 grid gap-5 lg:grid-cols-[1.25fr_1fr]">
          <article className="reveal card card-lift relative overflow-hidden p-8 sm:p-10 min-h-[320px] flex flex-col justify-between">
            <div>
              <p className="t-label">You · 16–24</p>
              <h3 className="mt-4 t-display text-[32px] sm:text-[40px] max-w-sm">Make greener moves.</h3>
              <p className="mt-3 text-[18px] text-text-primary max-w-sm">Earn points. Redeem everyday perks.</p>
            </div>
            <Mascot name="blue-wave" scale={1.3} className="self-end -mb-4 mt-6" />
          </article>
          <div className="grid gap-5">
            <article className="reveal card card-lift p-8 flex gap-6 items-start">
              <div className="flex-1">
                <p className="t-label">Green partners</p>
                <p className="mt-3 text-[18px] font-semibold text-text-display leading-snug">Turn verified green activity into measurable impact and reach young customers.</p>
              </div>
              <Mascot name="crowd" scale={0.8} className="shrink-0" />
            </article>
            <article className="reveal card card-lift p-8 flex gap-6 items-start">
              <div className="flex-1">
                <p className="t-label">Banks & e-wallets</p>
                <p className="mt-3 text-[18px] font-semibold text-text-display leading-snug">Understand green behaviour and build smarter engagement with Gen Z.</p>
              </div>
              <Mascot name="eyes" scale={0.7} className="shrink-0" />
            </article>
          </div>
        </div>
      </section>

      {/* REWARDS */}
      <section className="relative">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-20 sm:py-28 grid gap-12 lg:grid-cols-[1.3fr_1fr] items-center">
          <div className="reveal">
            <h2 className="t-display text-[40px] sm:text-[64px]">Go green. Get rewards.</h2>
            <p className="mt-5 text-[20px] text-text-primary max-w-xl">Your points can unlock the things you already love.</p>
            <ul className="mt-8 flex flex-wrap gap-2" aria-label="Reward categories">
              {["Bubble tea", "Data", "Cinema", "Rides", "Secondhand", "Study", "More"].map((r) => (
                <li key={r} className="pill">
                  {r}
                </li>
              ))}
            </ul>
            <div className="mt-10">
              <Link href="/#how" className="btn btn-primary btn-lg">
                See how it works →
              </Link>
            </div>
          </div>
          <div className="relative h-[260px] sm:h-[320px]" aria-hidden="true">
            <Mascot name="yellow-tongue" scale={1.5} className="bob absolute left-4 top-6 [--r:-8deg]" />
            <Mascot name="heart-hug" scale={1.4} className="bob-slow absolute right-6 bottom-0 [--r:6deg]" />
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 pt-20 sm:pt-28">
        <div className="reveal tone-navy card relative overflow-hidden px-8 py-10 sm:px-12 sm:py-12 grid gap-8 sm:grid-cols-[auto_1fr_auto] items-center">
          <Mascot name="megaphone" scale={1} className="hidden sm:block" />
          <p className="t-display text-[32px] sm:text-[44px]">Ready to make your move?</p>
          <a href={site.demoUrl} target="_blank" rel="noreferrer" className="btn btn-primary btn-lg justify-self-start">
            Try the live demo ↗
          </a>
        </div>
      </section>

    </>
  );
}
