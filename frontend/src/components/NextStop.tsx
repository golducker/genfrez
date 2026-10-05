"use client";

import { useEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Mascot from "./Mascot";
import { reducedMotion } from "@/lib/motion";
import type { MascotName } from "@/lib/mascots";
import "./NextStop.css";

gsap.registerPlugin(ScrollTrigger);

/*
 * A navy chapter-end card drawn as the side of a Hanoi bus: an orange dot-matrix destination sign,
 * a row of windows with passengers, a leaf stripe. Two door halves cover the content and slide
 * apart as the card climbs from 75% to 40% of the screen (scrubbed, no pin). Past halfway the doors
 * stop taking clicks, and focusing a link inside opens them at once. Reduced motion: no doors.
 */

const WINDOWS = 5;

export default function NextStop({
  sign,
  stop,
  passengers,
  className = "",
  children,
}: {
  sign: string; // what the LED sign scrolls, e.g. "02 · ABOUT US"
  stop: string; // plain words for screen readers, e.g. "About us"
  passengers: { name: MascotName; seat: number }[]; // seat = window index, 0 is the front
  className?: string; // layout classes for the content inside the doors
  children: ReactNode;
}) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el || reducedMotion()) return;
    const doors = el.querySelectorAll<HTMLElement>(".ns-door");
    el.classList.add("is-live");
    const max = () => ScrollTrigger.maxScroll(window);
    const tween = gsap.fromTo(
      doors,
      { xPercent: 0 },
      {
        xPercent: (i: number) => (i === 0 ? -100 : 100),
        ease: "back.inOut(1.2)", // a little overshoot as the halves settle
        scrollTrigger: {
          trigger: el,
          start: "top 75%",
          // The last card on a page may not reach 40%; finish the doors at the bottom instead.
          end: (self) => Math.min(self.start + innerHeight * 0.35, max()),
          scrub: 0.4,
          invalidateOnRefresh: true,
          onUpdate: (self) => el.classList.toggle("is-through", self.progress > 0.5),
        },
      },
    );
    // Keyboard users never wait for the scroll: a focused link opens the doors outright.
    const open = () => el.classList.add("is-open");
    el.addEventListener("focusin", open);
    return () => {
      el.removeEventListener("focusin", open);
      tween.scrollTrigger?.kill();
      tween.kill();
      el.classList.remove("is-live", "is-through", "is-open");
    };
  }, []);

  const run = `→ ${sign} · `;
  return (
    <div ref={root} data-reveal="scale" className="aurora tone-navy card ns">
      <div aria-hidden="true" className="aurora-glow" />
      <span className="sr-only">Next stop: {stop}.</span>
      <div className="ns-roof" aria-hidden="true">
        <div className="ns-sign">
          <span className="ns-sign-run"><span>{run}</span><span>{run}</span></span>
        </div>
        <div className="ns-windows">
          {Array.from({ length: WINDOWS }, (_, i) => {
            const p = passengers.find((x) => x.seat === i);
            return (
              <div key={i} className="ns-win">
                {p && <span className="ns-seat"><Mascot name={p.name} scale={0.6} className={i % 2 ? "bob-slow" : "bob"} /></span>}
              </div>
            );
          })}
        </div>
      </div>
      <div className="ns-body">
        <div className={className}>{children}</div>
        <div aria-hidden="true" className="ns-door ns-door-l"><i /></div>
        <div aria-hidden="true" className="ns-door ns-door-r"><i /></div>
      </div>
      <div aria-hidden="true" className="ns-stripe" />
    </div>
  );
}
