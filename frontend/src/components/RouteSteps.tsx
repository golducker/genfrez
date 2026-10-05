"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Icon, { type IconName } from "./Icon";
import { reducedMotion } from "@/lib/motion";
import { play } from "@/lib/sfx";

gsap.registerPlugin(ScrollTrigger);

/*
 * "From trip to voucher" as a ride. On wide screens the block pins while you scroll: the road draws
 * itself, a GenFreZ marker rides along it, each stop lights up as the marker reaches it, and the
 * ledger strip underneath fills in (5 km e-bike trip -> 325 g CO2 -> 4 points -> 400 d).
 * On phones the same four stops stack vertically and reveal one by one.
 */

const STEPS: { k: string; t: string; v: string; icon: IconName }[] = [
  { k: "01", t: "Move", v: "Take the bus, ride an e-bike, walk or carpool. Missions are recorded automatically inside the Zalo Mini App.", icon: "bike" },
  { k: "02", t: "Verify", v: "The trip is checked against partner data, GPS and a rotating QR. The weaker the evidence, the lower its confidence coefficient.", icon: "scan" },
  { k: "03", t: "Convert", v: "Avoided CO₂ is the distance times the gap between a petrol motorbike (95 g/km) and the mode you took.", icon: "leaf" },
  { k: "04", t: "Earn & redeem", v: "The scoring model prices it into points. 1 point = 25 g CO₂ = 100 ₫, redeemed through a deep link to the partner.", icon: "ticket" },
];

// Stops sit on the crests and dips of the road, at the centres of a 4-column grid (12.5%, 37.5%, ...).
const STOPS = [
  [125, 60],
  [375, 180],
  [625, 60],
  [875, 180],
];
const ROAD = "M0 120 C 50 60, 80 60, 125 60 C 230 60, 270 180, 375 180 C 480 180, 520 60, 625 60 C 730 60, 770 180, 875 180 C 920 180, 960 150, 1000 120";

const LEDGER = [
  { label: "Distance", to: 5, unit: "km", d: 0 },
  { label: "Confidence", to: 1, unit: "", d: 1 },
  { label: "CO₂ avoided", to: 325, unit: "g", d: 0 },
  { label: "Points", to: 4, unit: "pts", d: 0 },
  { label: "Voucher", to: 400, unit: "₫", d: 0 },
];

export default function RouteSteps() {
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reducedMotion()) return;
    const root = wrap.current!;
    const mm = gsap.matchMedia();

    mm.add("(min-width: 1024px) and (min-height: 680px)", () => {
      const road = root.querySelector<SVGPathElement>(".route-road")!;
      const glow = root.querySelector<SVGPathElement>(".route-glow")!;
      const marker = root.querySelector<SVGGElement>(".route-marker")!;
      const nodes = gsap.utils.toArray<SVGGElement>(".route-node", root);
      const cards = gsap.utils.toArray<HTMLElement>(".route-card", root);
      const vals = gsap.utils.toArray<HTMLElement>(".ledger-v", root);
      const len = road.getTotalLength();

      // Where along the road each stop sits, as a 0..1 fraction.
      const at = STOPS.map(([sx, sy]) => {
        let best = 0,
          bd = Infinity;
        for (let l = 0; l <= len; l += 4) {
          const p = road.getPointAtLength(l);
          const d = (p.x - sx) ** 2 + (p.y - sy) ** 2;
          if (d < bd) [bd, best] = [d, l];
        }
        return best / len;
      });

      gsap.set([road, glow], { strokeDasharray: len, strokeDashoffset: len });
      gsap.set(cards, { opacity: 0.25, y: 24, filter: "grayscale(1)" });
      const o = { p: 0 };
      let lit = -1;

      const tl = gsap.timeline({
        scrollTrigger: { trigger: root, start: "top top+=90", end: "+=1500", scrub: 0.7, pin: true, anticipatePin: 1 },
      });
      tl.to(o, {
        p: 1,
        ease: "none",
        duration: 1,
        onUpdate() {
          const p = o.p;
          gsap.set([road, glow], { strokeDashoffset: len * (1 - p) });
          const pt = road.getPointAtLength(len * p);
          const ahead = road.getPointAtLength(Math.min(len, len * p + 2));
          const ang = (Math.atan2(ahead.y - pt.y, ahead.x - pt.x) * 180) / Math.PI;
          marker.setAttribute("transform", `translate(${pt.x} ${pt.y}) rotate(${ang * 0.35})`);
          // Ledger values follow the stop that feeds them.
          const seg = (i: number) => gsap.utils.clamp(0, 1, (p - (at[i] - 0.12)) / 0.12);
          const f = [seg(0), seg(1), seg(2), seg(3), seg(3)];
          vals.forEach((v, i) => {
            const L = LEDGER[i];
            v.textContent = (L.to * f[i]).toFixed(L.d);
          });
          const now = at.reduce((n, a, i) => (p >= a - 0.005 ? i : n), -1);
          if (now !== lit) {
            if (now > lit && now >= 0) play("ting", { ambient: true });
            lit = now;
            nodes.forEach((n, i) => n.classList.toggle("on", i <= now));
            cards.forEach((c, i) =>
              gsap.to(c, { opacity: i <= now ? 1 : 0.25, y: i <= now ? 0 : 24, filter: i <= now ? "grayscale(0)" : "grayscale(1)", duration: 0.5, ease: "power3.out", overwrite: true })
            );
          }
        },
      });
      return () => tl.kill();
    });

    mm.add("(max-width: 1023px), (max-height: 679px)", () => {
      gsap.utils.toArray<HTMLElement>(".route-card", root).forEach((c) =>
        gsap.from(c, { x: -40, opacity: 0, duration: 1, ease: "expo.out", scrollTrigger: { trigger: c, start: "top 88%", once: true } })
      );
      const line = root.querySelector(".route-vline i");
      if (line) gsap.fromTo(line, { scaleY: 0 }, { scaleY: 1, ease: "none", scrollTrigger: { trigger: root, start: "top 70%", end: "bottom 60%", scrub: true } });
      root.querySelectorAll<HTMLElement>(".ledger-v").forEach((v, i) => (v.textContent = LEDGER[i].to.toFixed(LEDGER[i].d)));
    });

    return () => mm.revert();
  }, []);

  return (
    <div ref={wrap} className="route">
      <p className="t-label mb-2">How it works · from trip to voucher</p>
      <p className="t-caption mb-6 hidden lg:block">Keep scrolling to ride one 5 km e-bike trip through the engine.</p>

      {/* Road (wide screens) */}
      <div className="hidden lg:block relative">
        <svg viewBox="0 0 1000 240" className="w-full h-auto overflow-visible" aria-hidden="true">
          <defs>
            <linearGradient id="road-grad" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0" stopColor="#7dc62f" />
              <stop offset="0.6" stopColor="#5aae3a" />
              <stop offset="1" stopColor="#f26a1b" />
            </linearGradient>
          </defs>
          <path d={ROAD} className="route-base" />
          <path d={ROAD} className="route-dash" />
          <path d={ROAD} className="route-glow" stroke="url(#road-grad)" />
          <path d={ROAD} className="route-road" stroke="url(#road-grad)" />
          {STOPS.map(([x, y], i) => (
            <g key={i} className="route-node" transform={`translate(${x} ${y})`}>
              <circle r="22" className="route-node-halo" />
              <circle r="13" className="route-node-dot" />
              <text y="4.5" textAnchor="middle" className="route-node-k">
                {i + 1}
              </text>
            </g>
          ))}
          <g className="route-marker" transform={`translate(0 120)`}>
            <circle r="20" fill="#f26a1b" />
            <circle r="20" fill="none" stroke="#fff" strokeWidth="3" />
            <g transform="translate(-11 -11) scale(0.92)" stroke="#fff" fill="none" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5.5 17.5m-3.5 0a3.5 3.5 0 1 0 7 0a3.5 3.5 0 1 0 -7 0" />
              <path d="M18.5 17.5m-3.5 0a3.5 3.5 0 1 0 7 0a3.5 3.5 0 1 0 -7 0" />
              <path d="M12 17.5V14l-3-3 4-3 2 3h2" />
            </g>
          </g>
        </svg>
      </div>

      <div className="relative">
        <div className="route-vline lg:hidden" aria-hidden="true">
          <i />
        </div>
        <ol className="grid gap-4 lg:grid-cols-4 lg:mt-2 pl-10 lg:pl-0">
          {STEPS.map((s) => (
            <li key={s.k} className="route-card card p-6">
              <span className="route-card-icon" aria-hidden="true">
                <Icon name={s.icon} size={20} />
              </span>
              <p className="mt-4 text-[13px] font-bold text-accent-text">{s.k}</p>
              <p className="text-[19px] font-extrabold text-text-display leading-tight">{s.t}</p>
              <p className="mt-2 text-[14px] text-text-secondary leading-relaxed">{s.v}</p>
            </li>
          ))}
        </ol>
      </div>

      <dl className="ledger tone-navy mt-6" aria-label="Example: one 5 km e-bike trip">
        {LEDGER.map((l) => (
          <div key={l.label}>
            <dt className="t-label">{l.label}</dt>
            <dd className="t-data text-[22px] sm:text-[28px] text-text-display">
              <span className="ledger-v">{l.to.toFixed(l.d)}</span>
              {l.unit && <span className="text-[13px] text-text-secondary ml-1">{l.unit}</span>}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
