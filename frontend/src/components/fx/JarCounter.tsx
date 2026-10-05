"use client";

import { useEffect, useRef } from "react";
import { reducedMotion } from "@/lib/motion";
import { projectedG, getJarFullG } from "@/lib/visit";
import "./LeafJar.css";

/*
 * The live Year-1 projection next to the leaf jar: grams GenFreZ riders would have avoided since the
 * page opened. The clock lives in lib/visit.ts and stops in hidden tabs; this only repaints the
 * digits, straight into the DOM a few times a second, and only while it is on screen.
 */
export default function JarCounter() {
  const num = useRef<HTMLSpanElement>(null);
  const note = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = num.current!;
    const box = el.closest("div")!;
    let timer = 0;
    const paint = () => {
      const g = projectedG();
      el.textContent = Math.floor(g).toLocaleString("en-US");
      const full = getJarFullG();
      if (full && g >= full && note.current && !note.current.textContent) {
        note.current.textContent = `The jar filled at ${full.toLocaleString("en-US")} g. The count keeps going.`;
      }
    };
    const run = (on: boolean) => {
      clearInterval(timer);
      timer = 0;
      if (on && !document.hidden) timer = window.setInterval(paint, reducedMotion() ? 1000 : 120);
      paint();
    };
    let seen = false;
    const io = new IntersectionObserver(([e]) => run((seen = e.isIntersecting)));
    io.observe(box);
    const onVis = () => run(seen);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      clearInterval(timer);
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return (
    <div className="min-w-0">
      <p className="t-label flex items-center gap-2">
        <span className="jar-dot" aria-hidden="true" />
        Year-1 projection, live
      </p>
      <p className="mt-2 text-text-display font-extrabold leading-none text-[34px] sm:text-[44px] tracking-[-0.03em]">
        <span ref={num} className="jar-num">
          0
        </span>{" "}
        <span className="text-[0.55em] font-bold tracking-normal">g CO₂</span>
      </p>
      <p className="mt-2 t-caption">avoided by GenFreZ riders since you opened this page</p>
      {/* The line is reserved from the start, so filling the jar never shifts the footer. */}
      <p ref={note} className="mt-1 min-h-[1.5em] t-caption text-accent-text" />
    </div>
  );
}
