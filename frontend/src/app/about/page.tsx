import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { site, team } from "@/lib/site";

export const metadata: Metadata = { title: "About", description: "The GenFreZ team and the story behind the idea." };

function Initials({ name }: { name: string }) {
  const parts = name.trim().split(/\s+/);
  const initials = (parts[0]?.[0] ?? "") + (parts[parts.length - 1]?.[0] ?? "");
  return (
    <div className="dot-grid w-full aspect-square rounded-xl border border-border flex items-center justify-center bg-surface">
      <span className="t-display text-[48px]">{initials.toUpperCase()}</span>
    </div>
  );
}

export default function About() {
  return (
    <>
      <section className="mx-auto max-w-6xl px-4 sm:px-6 pt-16 sm:pt-24 pb-12">
        <p className="t-label">About us</p>
        <h1 className="t-display text-[40px] sm:text-[72px] mt-4">Six students. One spreadsheet that had to add up.</h1>
        <p className="mt-8 max-w-2xl text-[18px] font-light text-text-primary leading-relaxed">
          We are a team from Foreign Trade University and the University of Queensland competing in the {site.event}. GenFreZ is our answer to a question we kept asking on the way to class: why does riding the bus in Hanoi earn you nothing, when it is the single greenest choice a student can make?
        </p>
      </section>

      {/* STORY */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-12 sm:py-16 grid gap-10 lg:grid-cols-[1fr_1.4fr]">
        <div>
          <p className="t-label">Our story</p>
          <p className="t-display text-[28px] sm:text-[36px] mt-4 leading-tight">Inspiration</p>
        </div>
        <div className="grid gap-6 text-[16px] text-text-primary leading-relaxed font-light">
          <p>
            Most of us ride motorbikes. Not because we love them, but because the alternatives are fragmented, slower door to door, and offer no incentive at all. Cashback apps reward spending. Loyalty schemes reward buying more. Nothing rewards the trip you took by bus instead.
          </p>
          <p>
            Then two things changed. From July 2026 every subsidised bus trip in Hanoi leaves a digital tap-in, tap-out record. And Zalo, already on three out of four Vietnamese phones, opened its Mini App platform with location APIs. Suddenly the greenest behaviour in the city could be verified without a new app, a new account or a new habit.
          </p>
          <p>
            So we built a points engine where the currency is avoided CO₂, not đồng. A confidence coefficient discounts every point by how good the evidence is. Partners pay only when a rewarded user actually walks into their store. And the surplus from coffee commissions quietly funds the bus riders. The arithmetic is on the <Link href="/solution" className="text-text-display underline underline-offset-4 decoration-border-visible hover:decoration-text-display">solution page</Link>. We think it holds.
          </p>
        </div>
      </section>

      {/* TEAM */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-12 sm:py-16">
        <div className="flex items-baseline justify-between gap-4">
          <p className="t-label">The team</p>
          <p className="t-caption">{team.length} members · FTU × UQ</p>
        </div>
        <ul className="mt-8 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {team.map((m, i) => (
            <li key={m.name} className="grid gap-4">
              {m.photo ? (
                <Image src={m.photo} alt={m.name} width={480} height={480} className="w-full aspect-square object-cover rounded-xl border border-border" />
              ) : (
                <Initials name={m.name} />
              )}
              <div>
                <p className="t-caption">0{i + 1}</p>
                <h2 className="t-heading mt-1">{m.name}</h2>
                <p className="t-label mt-2">{m.role}</p>
                <p className="mt-3 text-[15px] text-text-secondary leading-relaxed">{m.bio}</p>
                {m.linkedin && (
                  <a href={m.linkedin} target="_blank" rel="noreferrer" className="mt-3 inline-block font-mono text-[12px] uppercase tracking-[0.06em] text-text-secondary hover:text-text-display">
                    LinkedIn ↗
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
        <div className="flex flex-wrap gap-3">
          <Link href="/solution" className="btn btn-primary">Explore our solution</Link>
          <Link href="/contact" className="btn btn-secondary">Contact us</Link>
        </div>
      </section>
    </>
  );
}
