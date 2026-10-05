"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { reducedMotion } from "@/lib/motion";
import "./ChapterType.css";

gsap.registerPlugin(ScrollTrigger);

/*
 * The huge chapter numeral behind a Solution header. It bleeds off the left edge for odd chapters
 * and the right edge for even ones, and a pale tint fills it left to right while the header
 * scrolls through (scrubbed --fill). Decorative: the label next to the heading already says "01".
 * Reduced motion: drawn filled, nothing scrubs.
 */
export default function ChapterNum({ n }: { n: number }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || reducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { "--fill": "0%" },
        { "--fill": "100%", ease: "none", scrollTrigger: { trigger: el, start: "top 80%", end: "bottom 35%", scrub: 0.4 } },
      );
    });
    return () => ctx.revert();
  }, []);

  return (
    <span aria-hidden="true" className={`cn-clip ${n % 2 ? "is-left" : "is-right"}`}>
      <span ref={ref} className="cn-num">
        {String(n).padStart(2, "0")}
      </span>
    </span>
  );
}
