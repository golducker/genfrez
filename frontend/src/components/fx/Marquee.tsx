"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { reducedMotion } from "@/lib/motion";

gsap.registerPlugin(ScrollTrigger);

/*
 * Endless ribbon of words. It drifts on its own, speeds up with scroll velocity and flips direction
 * with the scroll, then eases back to its cruising speed. The track holds two copies of the content
 * so the loop has no seam.
 */
export default function Marquee({ items, reverse = false, className = "", speed = 40 }: { items: React.ReactNode[]; reverse?: boolean; className?: string; speed?: number }) {
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reducedMotion()) return;
    const el = track.current!;
    const base = reverse ? -1 : 1;
    const tween = gsap.to(el, { xPercent: -50, ease: "none", duration: speed, repeat: -1 });
    // Start deep into the loop so it can also run backwards for a long time without hitting zero.
    tween.totalTime(speed * 1000).timeScale(base);
    let dir = base;
    const st = ScrollTrigger.create({
      onUpdate(self) {
        const v = self.getVelocity();
        dir = (self.direction > 0 ? 1 : -1) * base;
        const boost = Math.min(6, 1 + Math.abs(v) / 300);
        gsap.to(tween, { timeScale: dir * boost, duration: 0.2, overwrite: true });
        gsap.to(tween, { timeScale: dir, duration: 1.2, delay: 0.25, ease: "power2.out" });
        gsap.to(el, { skewX: Math.max(-8, Math.min(8, -v / 260)) * base, duration: 0.3, overwrite: "auto" });
        gsap.to(el, { skewX: 0, duration: 0.9, delay: 0.2, ease: "power3.out" });
      },
    });
    return () => {
      st.kill();
      tween.kill();
    };
  }, [reverse, speed]);

  const row = (key: string) => (
    <div className="marquee-row" key={key} aria-hidden={key === "b" ? true : undefined}>
      {items.map((it, i) => (
        <span key={i} className="marquee-item">
          {it}
        </span>
      ))}
    </div>
  );

  return (
    <div className={`marquee ${className}`}>
      <div ref={track} className="marquee-track">
        {row("a")}
        {row("b")}
      </div>
    </div>
  );
}
