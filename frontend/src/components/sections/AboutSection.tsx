import Link from "next/link";
import CrewPasses from "@/components/CrewPasses";
import Mascot from "@/components/Mascot";
import Split from "@/components/fx/Split";
import { site, team } from "@/lib/site";

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
              <Split text="Most of us ride motorbikes. The bus is slower door to door, and taking it earns you nothing. Cashback and loyalty apps pay you to buy more. Nobody pays you to take the bus." />
            </p>
            <p>
              Then two things changed. From July 2026 Hanoi&apos;s subsidised bus trips move to digital e-ticketing. And Zalo, with 79.6M monthly active users (Dec 2025), opened its Mini App platform with location APIs. Suddenly green behaviour in the city could be verified inside an app students already have open all day: GPS and QR today, and e-ticket data once the B2G agreement is signed.
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
        <CrewPasses team={team} />
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
