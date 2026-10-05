"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { reducedMotion } from "@/lib/motion";
import { play } from "@/lib/sfx";
import { tripPoints } from "@/lib/points";
import "./ChapterType.css";

gsap.registerPlugin(ScrollTrigger);

/*
 * The exchange rate on a full-bleed leaf-green band. Three stepped lines fill with navy one after
 * another as you scroll, and each swells from weight 300 to 900 in steps of 50 so the reflow stays
 * cheap. On laptops the frame is sticky inside a taller band (no pin). A slider-detent tick plays
 * as each line completes. Reduced motion: all three lines drawn filled, nothing scrubs.
 */

const LINES = [
  { eq: false, num: "1", unit: "point" },
  { eq: true, num: "25", unit: "g CO₂", sub: "avoided" },
  { eq: true, num: "100", unit: "₫", sub: "of voucher value" },
];

export default function RateBand() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el || reducedMotion()) return;
    const lines = [...el.querySelectorAll<HTMLElement>(".rb-line")];
    const done = lines.map(() => false);
    const paint = (p: number) => {
      lines.forEach((line, i) => {
        const lp = Math.min(1, Math.max(0, p * lines.length - i));
        line.style.setProperty("--fill", `${(lp * 100).toFixed(1)}%`);
        line.style.fontWeight = String(300 + Math.round(lp * 12) * 50);
        if (lp >= 1 && !done[i]) play("tick", { value: 0.3 + i * 0.25, ambient: true });
        done[i] = lp >= 1;
      });
    };
    const ctx = gsap.context(() => {
      const tall = matchMedia("(min-width: 1024px) and (min-height: 700px)").matches;
      ScrollTrigger.create({
        trigger: el,
        start: "top 70%",
        // With the sticky frame, finish just before it lets go; otherwise as the band crosses mid-screen.
        end: tall ? "bottom bottom" : "bottom 55%",
        onUpdate: (st) => paint(st.progress),
        onRefresh: (st) => paint(st.progress),
      });
    });
    return () => {
      ctx.revert();
      lines.forEach((l) => l.removeAttribute("style"));
    };
  }, []);

  return (
    <section ref={root} className="rb" aria-labelledby="rb-title">
      <div className="rb-frame">
        <div className="mx-auto max-w-6xl w-full px-4 sm:px-6">
          <p id="rb-title" className="rb-label">The GenFreZ exchange rate · fixed and published</p>
          <p className="sr-only">1 point equals 25 grams of CO₂ avoided, which equals 100 đồng of voucher value.</p>
          <div className="rb-rows">
            {LINES.map((l, i) => (
              <p key={l.num} aria-hidden="true" className="rb-line" style={{ "--step": i } as React.CSSProperties}>
                {l.eq && <span className="rb-eq">=</span>}
                <span className="rb-num">{l.num}</span>
                <span className="rb-unit">
                  {l.unit}
                  {l.sub && <small>{l.sub}</small>}
                </span>
              </p>
            ))}
            <p className="rb-note">No badges and no abstract scores. One kilometre on the bus instead of a petrol motorbike earns {tripPoints(1, "bus")} points.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
