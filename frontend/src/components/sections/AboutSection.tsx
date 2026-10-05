import Image from "next/image";
import Link from "next/link";
import Mascot from "@/components/Mascot";
import Split from "@/components/fx/Split";
import { site, team } from "@/lib/site";

/* Brand tones cycled across team placeholders until real photos arrive. */
const TILE = ["bg-[var(--leaf-light)] text-[#13345e]", "bg-[var(--sky)] text-[#13345e]", "bg-[#13345e] text-[#fbf6e0]", "bg-[#ffd9bf] text-[#13345e]"];

function Initials({ name, i }: { name: string; i: number }) {
  const parts = name.trim().split(/\s+/);
  const initials = (parts[0]?.[0] ?? "") + (parts[parts.length - 1]?.[0] ?? "");
  return (
    <div className={`w-full aspect-square rounded-[28px] flex items-center justify-center ${TILE[i % TILE.length]}`} aria-hidden="true">
      <span className="font-extrabold tracking-[-0.04em] text-[64px]">{initials.toUpperCase()}</span>
    </div>
  );
}

export default function AboutSection() {
  return (
    <>
      <section className="relative">
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 pt-16 sm:pt-24 pb-12 grid gap-10 lg:grid-cols-[1fr_auto] items-end">
          <div>
            <p data-reveal className="t-label label-rule">About us</p>
            <h2 data-split className="t-display text-[44px] sm:text-[84px] mt-4">
              <Split text="Meet the" /> <Split text="Zs" className="text-accent-text" /> <Split text="behind GenFreZ" />
            </h2>
            <p data-reveal className="mt-8 max-w-2xl text-[18px] text-text-primary leading-relaxed">
              We are a team from Foreign Trade University and the University of Queensland competing in the {site.event}. GenFreZ is our answer to a question we kept asking on the way to class: why does riding the bus in Hanoi earn you nothing, when it is one of the greenest choices a student can make?
            </p>
          </div>
          <div data-reveal="pop" className="hidden lg:block">
            <Mascot name="square-wave" scale={1.4} className="bob" />
          </div>
        </div>
      </section>

      {/* STORY */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-12 sm:py-16">
        <div data-reveal="scale" className="card p-8 sm:p-12 grid gap-10 lg:grid-cols-[1fr_1.6fr]">
          <div>
            <p className="t-label">Our story</p>
            <p className="t-display text-[32px] sm:text-[44px] mt-4">Inspiration</p>
            <div data-speed="-0.2" className="mt-8 hidden lg:block">
              <Mascot name="fluffy-scared" scale={1.1} className="bob-slow [--r:-4deg]" />
            </div>
          </div>
          <div className="grid gap-6 text-[16px] text-text-primary leading-relaxed">
            <p data-scrub className="text-[20px] sm:text-[22px] font-semibold text-text-display leading-snug">
              <Split text="Most of us ride motorbikes. Not because we love them, but because the alternatives are fragmented, slower door to door, and offer no incentive at all. Cashback apps reward spending. Loyalty schemes reward buying more. Nothing rewards the trip you took by bus instead." />
            </p>
            <p>
              Then two things changed. From July 2026 Hanoi&apos;s subsidised bus trips move to digital e-ticketing. And Zalo, with 79.6M monthly active users (Dec 2025), opened its Mini App platform with location APIs. Suddenly green behaviour in the city could be verified without a new app, a new account or a new habit: GPS and QR today, and e-ticket data once the B2G agreement is signed.
            </p>
            <p>
              So we built a points engine where the currency is avoided CO₂, not đồng. A confidence coefficient discounts every point by how good the evidence is. Partners fund a discount only when a rewarded user actually walks into their store. And the surplus from coffee commissions tops up rewards for green rides. The arithmetic is on the{" "}
              <Link href="/#solution" className="font-semibold text-text-display underline underline-offset-4 decoration-2 decoration-[var(--leaf)] hover:decoration-[var(--orange)]">
                solution page
              </Link>
              . We think it holds.
            </p>
          </div>
        </div>
      </section>

      {/* TEAM */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-12 sm:py-16">
        <div className="flex items-end justify-between gap-4">
          <h3 data-split className="t-display text-[36px] sm:text-[56px]">
            <Split text="The crew" />
          </h3>
          <p data-reveal className="t-caption">{team.length} members · FTU × UQ</p>
        </div>
        <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {team.map((m, i) => (
            <li key={m.name} data-reveal="up" data-tilt="6" className="team-card card p-4 pb-7 grid gap-5 content-start">
              {m.photo ? (
                <div data-reveal="clip" className="team-photo relative">
                  <Image src={m.photo} alt={m.name} width={480} height={480} className="w-full aspect-square object-cover" />
                </div>
              ) : (
                <Initials name={m.name} i={i} />
              )}
              <div className="px-3">
                <p className="t-caption">0{i + 1}</p>
                <h3 className="t-heading mt-1">{m.name}</h3>
                <p className="t-label mt-2 text-accent-text">{m.role}</p>
                <p className="mt-3 text-[15px] text-text-secondary leading-relaxed">{m.bio}</p>
                {m.linkedin && (
                  <a href={m.linkedin} target="_blank" rel="noreferrer" className="mt-3 inline-block text-[14px] font-semibold text-text-display hover:text-accent-text">
                    LinkedIn ↗
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
        <div data-reveal className="flex flex-wrap gap-3">
          <Link href="/#solution" className="btn btn-primary btn-lg"><span>Explore our solution ↗</span></Link>
          <Link href="/#contact" className="btn btn-secondary btn-lg"><span>Contact us</span></Link>
        </div>
      </section>
    </>
  );
}
