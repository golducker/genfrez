"use client";

import { useEffect, useRef, useState } from "react";
import { ROUTE, TOTAL_KM, TRIP, signLabel } from "@/lib/route";
import { reducedMotion, scrollToId } from "@/lib/motion";
import { arrive, flapTick } from "@/lib/sfx-route";
import { burst } from "../ClickFx";
import { Emblem, TurtleTower } from "./StreetSign";
import "./route.css";

const CHARS = "ABCDEGHIKLMNOPQRSTUVXYĐĂÂÊÔƠƯ";

/* A split-flap street name: letters riffle through the alphabet and land one after another. */
function Flap({ text }: { text: string }) {
  const [shown, setShown] = useState(text);
  useEffect(() => {
    const still = reducedMotion();
    const settle = [...text].map((_, i) => (still ? 0 : 3 + i * 0.9 + Math.random() * 3));
    let frame = 0;
    const id = window.setInterval(() => {
      frame++;
      let done = true;
      const out = [...text]
        .map((c, i) => {
          if (c === " " || frame >= settle[i]) return c;
          done = false;
          return CHARS[Math.floor(Math.random() * CHARS.length)];
        })
        .join("");
      setShown(out);
      if (!still) flapTick();
      if (done) window.clearInterval(id);
    }, 45);
    return () => window.clearInterval(id);
  }, [text]);
  return (
    <span className="rhud-name" aria-hidden="true">
      {[...shown].map((c, i) => (
        <span key={i} className={`flap-c${c === " " ? " sp" : ""}`}>
          {c === " " ? " " : c}
        </span>
      ))}
    </span>
  );
}

/*
 * The route HUD: which street of the ride the page is on, how far along it is and what comes next.
 * It slides in once the visitor leaves the hero, folds down to just the sign a few seconds after each
 * new street, and hides over the footer. Reaching Hoàn Kiếm Lake plays the arrival: chime, confetti
 * and the trip priced with the published formula.
 */
export default function RouteHud() {
  const [idx, setIdx] = useState(0);
  const [on, setOn] = useState(false);
  const [open, setOpen] = useState(true);
  const [arrived, setArrived] = useState(false);
  const card = useRef<HTMLDivElement>(null);
  const bus = useRef<HTMLSpanElement>(null);
  const fill = useRef<HTMLSpanElement>(null);
  const kmEl = useRef<HTMLElement>(null);
  const idxRef = useRef(0);
  const hover = useRef(false);
  const timer = useRef(0);

  // Track the street under the reading line (40% down the screen) and the distance along the route.
  useEffect(() => {
    const els = ROUTE.map((s) => document.getElementById(s.id));
    const footer = document.querySelector("footer");
    let raf = 0;
    let footerIn = false;
    let shown = false;

    const frame = () => {
      raf = 0;
      const line = innerHeight * 0.4;
      const tops = els.map((el) => (el ? el.getBoundingClientRect().top : Infinity));
      let cur = 0;
      tops.forEach((t, i) => {
        if (t <= line) cur = i;
      });
      const next = Math.min(cur + 1, ROUTE.length - 1);
      const span = tops[next] - tops[cur];
      const f = next === cur || !isFinite(span) || span <= 0 ? 0 : Math.min(1, Math.max(0, (line - tops[cur]) / span));
      const km = ROUTE[cur].km + f * (ROUTE[next].km - ROUTE[cur].km);
      // Stops sit evenly along the rail (some streets are only 200 m apart); the bus moves stop to stop.
      const pct = `${((cur + (next === cur ? 0 : f)) / (ROUTE.length - 1)) * 100}%`;
      if (bus.current) bus.current.style.left = pct;
      if (fill.current) fill.current.style.width = pct;
      if (kmEl.current) kmEl.current.textContent = km.toFixed(1);
      if (cur !== idxRef.current) {
        idxRef.current = cur;
        setIdx(cur);
      }
      const want = scrollY > 140 && !footerIn;
      if (want !== shown) {
        shown = want;
        setOn(want);
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(frame);
    };
    const io = new IntersectionObserver(([e]) => {
      footerIn = e.isIntersecting;
      onScroll();
    });
    if (footer) io.observe(footer);
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll);
    onScroll();
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", onScroll);
    };
  }, []);

  // Each new street opens the card for a few seconds, then it folds to just the sign.
  useEffect(() => {
    window.clearTimeout(timer.current);
    const show = window.setTimeout(() => setOpen(true), 0);
    // Phones fold sooner: the open card sits over the text being read.
    timer.current = window.setTimeout(() => {
      if (!hover.current) setOpen(false);
    }, innerWidth < 640 ? 2400 : 4200);
    return () => {
      window.clearTimeout(show);
      window.clearTimeout(timer.current);
    };
  }, [idx]);

  // Arrival at the lake, once per visit.
  useEffect(() => {
    if (idx !== ROUTE.length - 1 || arrived || !on) return;
    let seen = false;
    try {
      seen = sessionStorage.getItem("route-arrived") === "1";
      sessionStorage.setItem("route-arrived", "1");
    } catch {}
    const t = window.setTimeout(() => {
      setArrived(true);
      if (seen) return;
      arrive();
      const b = card.current?.getBoundingClientRect();
      if (b) burst(b.left + b.width / 2, b.top + 20, 22, 1.2);
    }, 350);
    return () => window.clearTimeout(t);
  }, [idx, arrived, on]);

  const s = ROUTE[idx];
  const nxt = ROUTE[idx + 1];
  const dest = s.kind === "HỒ";

  return (
    <div
      className={`rhud ${on ? "on" : ""} ${open ? "" : "collapsed"} ${dest ? "dest" : ""}`}
      onPointerEnter={() => {
        hover.current = true;
        setOpen(true);
      }}
      onPointerLeave={() => {
        hover.current = false;
        window.clearTimeout(timer.current);
        timer.current = window.setTimeout(() => setOpen(false), 1600);
      }}
    >
      <div ref={card} className="rhud-card">
        <button type="button" className="rhud-sign" onClick={() => setOpen((o) => !o)} data-sfx="own" aria-expanded={open} aria-label={`Now on ${signLabel(s)}. Show route`}>
          <span className="rhud-sign-in">
            <span className="rhud-emblem">{dest ? <TurtleTower /> : <Emblem />}</span>
            <span className="rhud-text">
              <span className="rhud-kind" aria-hidden="true">{dest ? "ĐIỂM ĐẾN · ARRIVED" : `${s.kind} · NOW ON`}</span>
              <Flap text={(dest ? `Hồ ${s.name}` : s.name).toUpperCase()} />
            </span>
          </span>
        </button>
        <div className="rhud-more">
          <div>
            {dest && arrived ? (
              <p className="rhud-arrive">
                Chùa Láng to Hoàn Kiếm, ≈{TRIP.km} km. By bus instead of a petrol motorbike that is <b>≈{TRIP.g} g CO₂</b> and <b>{TRIP.points} points</b>.
              </p>
            ) : (
              <p className="rhud-line">
                <span>
                  <b ref={kmEl}>0.0</b> of ≈{TOTAL_KM} km
                </span>
                {nxt && <span>Next: <b>{signLabel(nxt)}</b></span>}
              </p>
            )}
            <div className="rhud-rail">
              <span ref={fill} className="rhud-fill" />
              {ROUTE.map((r, i) => (
                <button
                  key={r.id}
                  type="button"
                  className={`rhud-dot${i < idx ? " on" : ""}${i === idx ? " cur" : ""}`}
                  style={{ left: `${(i / (ROUTE.length - 1)) * 100}%` }}
                  onClick={() => scrollToId(r.id)}
                  aria-label={`Go to ${signLabel(r)}`}
                >
                  <span className="tip" aria-hidden="true">{signLabel(r)}</span>
                </button>
              ))}
              <span ref={bus} className="rhud-bus" aria-hidden="true" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
