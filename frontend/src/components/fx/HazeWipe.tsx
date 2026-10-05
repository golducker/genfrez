"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { BUS_LEN, BUS_X, HZ_H, HZ_W } from "@/components/art/geo";
import { burst } from "@/components/ClickFx";
import { reducedMotion } from "@/lib/motion";
import { BASELINE, G_PER_POINT } from "@/lib/points";
import { play } from "@/lib/sfx";
import { wind, stopWind } from "@/lib/sfx-street";
import { setCleared } from "@/lib/visit";
import "./HazeWipe.css";

/*
 * Haze over the hero street. A half-resolution canvas the size of the band holds a warm grey haze:
 * one tileable value-noise texture drawn twice at different scales and drift speeds, then cut by a
 * mask. The cursor (a 140 px breeze ring) or a finger brushes holes in the mask; the bus's wake and
 * the closing gust are a soft vertical edge applied on top, so the measured fraction stays exact.
 *
 * The haze is one student's motorbike commute for a day: 2 × 5 km × 95 g = 950 g, 38 points.
 * At +2.2 s (with the card's first "Bus 08" chip) the bus drives in and clears the left half,
 * 475 g. The visitor clears the rest; at 70% a gust takes what is left.
 *
 * The drift redraws at 30 fps only while the band is on screen and the tab is visible, and stops
 * for good once the street is clear. React state changes only when the chip changes message.
 * Reduced motion (or a page that hydrated too late for the motion layer) gets the clean street,
 * the parked bus and the final chip.
 */

const DAY_G = 2 * 5 * BASELINE; // 950 g
const LEAVES = DAY_G / G_PER_POINT; // 38
const K = 0.5; // canvas resolution
const GUST_AT = 0.7;

type Phase = "still" | "haze" | "air" | "clear";

/** Value noise on a 256² torus, tinted with the haze colour; alpha carries the texture. */
function hazeTexture(hex: string) {
  const T = 256;
  const c = document.createElement("canvas");
  c.width = c.height = T;
  const g = c.getContext("2d")!;
  const img = g.createImageData(T, T);
  const grid = (f: number) => {
    const a = Array.from({ length: f * f }, Math.random);
    return (x: number, y: number) => {
      x *= f / T;
      y *= f / T;
      const x0 = Math.floor(x);
      const y0 = Math.floor(y);
      const sx = (x - x0) * (x - x0) * (3 - 2 * (x - x0));
      const sy = (y - y0) * (y - y0) * (3 - 2 * (y - y0));
      const q = (i: number, j: number) => a[(j % f) * f + (i % f)];
      return (q(x0, y0) * (1 - sx) + q(x0 + 1, y0) * sx) * (1 - sy) + (q(x0, y0 + 1) * (1 - sx) + q(x0 + 1, y0 + 1) * sx) * sy;
    };
  };
  const o1 = grid(4);
  const o2 = grid(8);
  const o3 = grid(16);
  const m = /^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(hex) ?? [, "8a", "7f", "70"];
  const [r, gr, b] = [m[1], m[2], m[3]].map((h) => parseInt(h as string, 16));
  for (let y = 0; y < T; y++)
    for (let x = 0; x < T; x++) {
      const v = o1(x, y) * 0.55 + o2(x, y) * 0.3 + o3(x, y) * 0.15;
      const i = (y * T + x) * 4;
      // Thicker patches are a touch lighter, so the haze has some body instead of a flat grey sheet.
      img.data[i] = Math.min(255, r + (v - 0.5) * 34);
      img.data[i + 1] = Math.min(255, gr + (v - 0.5) * 30);
      img.data[i + 2] = Math.min(255, b + (v - 0.5) * 24);
      img.data[i + 3] = 165 + v * 90;
    }
  g.putImageData(img, 0, 0);
  return c;
}

/** The haze starts thin at the top of the band and is full from a little above halfway down. */
function fillMask(g: CanvasRenderingContext2D, w: number, h: number) {
  g.globalCompositeOperation = "source-over";
  g.clearRect(0, 0, w, h);
  const gr = g.createLinearGradient(0, 0, 0, h);
  gr.addColorStop(0, "rgba(0,0,0,0)");
  gr.addColorStop(0.42, "rgba(0,0,0,1)");
  g.fillStyle = gr;
  g.fillRect(0, 0, w, h);
}

/** Clears everything left of edge (0..1 of the width), feathered over soft, centred on the edge. */
function cutEdge(g: CanvasRenderingContext2D, w: number, h: number, edge: number, soft: number) {
  if (edge <= -soft) return;
  const e = edge * w;
  const s = soft * w;
  g.globalCompositeOperation = "destination-out";
  const lg = g.createLinearGradient(e - s / 2, 0, e + s / 2, 0);
  lg.addColorStop(0, "rgba(0,0,0,1)");
  lg.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = lg;
  g.fillRect(0, 0, Math.min(w, e + s / 2), h);
}

export default function HazeWipe({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const [phase, setPhase] = useState<Phase>("still");
  const root = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const num = useRef<HTMLSpanElement>(null);
  const chip = useRef<HTMLSpanElement>(null);
  const resetRef = useRef<() => void>(() => {});

  useEffect(() => {
    const el = root.current!;
    const cv = canvas.current!;
    const scene = cv.parentElement!;
    const bus = el.querySelector<SVGGElement>(".hz-bus");
    if (reducedMotion() || !document.documentElement.classList.contains("motion")) {
      setCleared(DAY_G);
      return;
    }

    let ph: Phase = "haze";
    const to = (p: Phase) => {
      ph = p;
      setPhase(p);
    };
    to("haze");

    const g = cv.getContext("2d")!;
    const mask = document.createElement("canvas");
    const m = mask.getContext("2d")!;
    const probe = document.createElement("canvas");
    probe.width = 64;
    probe.height = 24;
    const pg = probe.getContext("2d", { willReadFrequently: true })!;
    const alphaSum = () => {
      const d = pg.getImageData(0, 0, 64, 24).data;
      let s = 0;
      for (let i = 3; i < d.length; i += 4) s += d[i];
      return s;
    };
    fillMask(pg, 64, 24);
    const full = alphaSum();

    let W = 0,
      H = 0,
      raf = 0,
      visible = false,
      dirty = true,
      lastDraw = 0,
      lastMeasure = 0,
      edge = -1, // bus wake / gust edge, 0..1 of the width
      soft = 0.14,
      shown = 0,
      user = false,
      gusting = false;

    let tex = hazeTexture(getComputedStyle(el).getPropertyValue("--hz-haze").trim());
    let p1 = g.createPattern(tex, "repeat")!;
    let p2 = g.createPattern(tex, "repeat")!;
    function retint() {
      tex = hazeTexture(getComputedStyle(el).getPropertyValue("--hz-haze").trim());
      p1 = g.createPattern(tex, "repeat")!;
      p2 = g.createPattern(tex, "repeat")!;
      dirty = true;
      kick();
    }

    function size() {
      const b = scene.getBoundingClientRect();
      const w = Math.round(b.width);
      const h = Math.round(b.height);
      if (!w || !h || (w === W && h === H)) return;
      const cw = Math.max(1, Math.round(w * K));
      const ch = Math.max(1, Math.round(h * K));
      if (W) {
        // Keep what was already cleared, stretched to the new size.
        const old = document.createElement("canvas");
        old.width = mask.width;
        old.height = mask.height;
        old.getContext("2d")!.drawImage(mask, 0, 0);
        mask.width = cw;
        mask.height = ch;
        m.drawImage(old, 0, 0, cw, ch);
      } else {
        mask.width = cw;
        mask.height = ch;
        fillMask(m, cw, ch);
      }
      cv.width = cw;
      cv.height = ch;
      W = w;
      H = h;
      soft = Math.min(0.2, Math.max(0.1, 160 / w));
      dirty = true;
      draw(performance.now());
    }

    function draw(t: number) {
      const cw = cv.width;
      const ch = cv.height;
      g.globalCompositeOperation = "source-over";
      g.globalAlpha = 1;
      g.clearRect(0, 0, cw, ch);
      if (ph === "clear") return;
      // Two layers of the same texture, at different scales, drifting against each other.
      p1.setTransform(new DOMMatrix().translateSelf((t * 0.007) % (256 * 1.5), 0).scaleSelf(1.5));
      g.fillStyle = p1;
      g.globalAlpha = 0.9;
      g.fillRect(0, 0, cw, ch);
      p2.setTransform(new DOMMatrix().translateSelf(-(t * 0.004) % (256 * 0.8), Math.sin(t / 2600) * 6).scaleSelf(0.8));
      g.fillStyle = p2;
      g.globalAlpha = 0.6;
      g.fillRect(0, 0, cw, ch);
      g.globalAlpha = 1;
      g.globalCompositeOperation = "destination-in";
      g.drawImage(mask, 0, 0);
      cutEdge(g, cw, ch, edge, soft);
    }

    function measure() {
      dirty = false;
      pg.globalCompositeOperation = "source-over";
      pg.clearRect(0, 0, 64, 24);
      pg.drawImage(mask, 0, 0, 64, 24);
      cutEdge(pg, 64, 24, edge, soft);
      const f = Math.max(0, 1 - alphaSum() / full);
      const grams = gusting ? shown : Math.min(DAY_G, Math.round((f * DAY_G) / 25) * 25);
      if (grams > shown) {
        // A pentatonic tick for every 25 g the visitor clears (the bus's share stays quiet).
        if (user) for (let i = 0; i < Math.min(4, (grams - shown) / 25); i++) setTimeout(() => play("trip", { value: (shown / DAY_G) * 0.9, ambient: true }), i * 45);
        shown = grams;
        num.current!.textContent = String(grams);
        setCleared(grams);
        if (ph === "haze") to("air");
      }
      if (f >= GUST_AT && !gusting) gust();
    }

    function frame(now: number) {
      raf = 0;
      if (!visible || document.hidden || ph === "clear") return;
      if (now - lastDraw > 32) {
        draw(now);
        lastDraw = now;
      }
      if (dirty && now - lastMeasure > 150) {
        measure();
        lastMeasure = now;
      }
      raf = requestAnimationFrame(frame);
    }
    function kick() {
      if (!raf && visible && !document.hidden && ph !== "clear") raf = requestAnimationFrame(frame);
    }

    // The breeze: soft round puffs along the pointer's path, with wind that follows its speed.
    function puff(x: number, y: number, r: number) {
      const cx = x * K,
        cy = y * K,
        cr = r * K;
      m.globalCompositeOperation = "destination-out";
      const rg = m.createRadialGradient(cx, cy, 0, cx, cy, cr);
      rg.addColorStop(0, "rgba(0,0,0,.9)");
      rg.addColorStop(0.5, "rgba(0,0,0,.55)");
      rg.addColorStop(1, "rgba(0,0,0,0)");
      m.fillStyle = rg;
      m.fillRect(cx - cr, cy - cr, cr * 2, cr * 2);
      dirty = true;
    }
    let lx = NaN,
      ly = NaN,
      lt = 0;
    function onMove(e: PointerEvent) {
      if (ph !== "haze" && ph !== "air") return;
      const b = cv.getBoundingClientRect();
      const x = e.clientX - b.left;
      const y = e.clientY - b.top;
      const r = e.pointerType === "mouse" ? 70 : 56;
      if (Number.isNaN(lx)) puff(x, y, r);
      else {
        const dx = x - lx,
          dy = y - ly;
        const d = Math.hypot(dx, dy);
        const steps = Math.min(40, Math.ceil(d / (r * 0.35)));
        for (let i = 1; i <= steps; i++) puff(lx + (dx * i) / steps, ly + (dy * i) / steps, r);
        wind(Math.min(1, d / Math.max(8, e.timeStamp - lt) / 2.2));
      }
      lx = x;
      ly = y;
      lt = e.timeStamp;
      user = true;
      kick();
    }
    const onLeave = () => (lx = NaN);
    function onDown(e: PointerEvent) {
      if (e.pointerType === "mouse" || (ph !== "haze" && ph !== "air")) return;
      // A tap blows a clean hole; a sideways drag keeps sweeping.
      const b = cv.getBoundingClientRect();
      puff(e.clientX - b.left, e.clientY - b.top, 80);
      puff(e.clientX - b.left, e.clientY - b.top, 64);
      wind(0.6);
      user = true;
      lx = NaN;
      kick();
    }

    // The bus: drives in from the left and parks, clearing the haze behind it up to halfway.
    const o = { x: -900 };
    const n1 = (v: number) => Math.round(v * 10) / 10;
    const place = () => bus?.setAttribute("transform", `translate(${n1(BUS_X + o.x)} 0)`);
    function wake() {
      const s = Math.max(W / HZ_W, H / HZ_H);
      const off = (W - HZ_W * s) / 2;
      const front = off + (BUS_X + o.x + BUS_LEN) * s;
      const e = Math.min((front - BUS_LEN * s * 0.25) / W, 0.5);
      if (e > edge) {
        edge = e;
        dirty = true;
        kick();
      }
    }
    function drive(delay: number) {
      o.x = -900;
      place();
      return gsap.to(o, {
        x: 0,
        duration: 2.6,
        delay,
        ease: "power3.out",
        onStart: () => play("whoosh", { ambient: true }),
        onUpdate() {
          place();
          wake();
        },
        onComplete() {
          edge = Math.max(edge, 0.5);
          dirty = true;
          kick();
        },
      });
    }
    // Synced with the hero card's first "Bus 08" chip, which pops 2.2 s after load.
    drive(Math.max(0.25, 2.2 - performance.now() / 1000));

    // At 70% a gust sweeps the rest off to the right.
    const gx = { e: 0 };
    function gust() {
      gusting = true;
      play("whoosh", { ambient: true });
      gx.e = Math.max(edge, 0);
      gsap.to(gx, {
        e: 1 + soft,
        duration: 1.1,
        ease: "power2.in",
        onUpdate() {
          edge = gx.e;
          dirty = true;
          kick();
        },
        onComplete() {
          shown = DAY_G;
          num.current!.textContent = String(DAY_G);
          setCleared(DAY_G);
          stopWind();
          to("clear");
          draw(0);
          const c = chip.current?.getBoundingClientRect();
          if (c) burst(c.left + Math.min(c.width / 2, 120), c.top + c.height / 2, 16, 0.8);
        },
      });
    }

    resetRef.current = () => {
      gsap.killTweensOf([o, gx]);
      gusting = false;
      user = false;
      edge = -1;
      shown = 0;
      num.current!.textContent = "0";
      fillMask(m, mask.width, mask.height);
      to("haze");
      dirty = true;
      gsap.fromTo(cv, { opacity: 0 }, { opacity: 1, duration: 0.8, ease: "power1.out", clearProps: "opacity" });
      // The parked bus pulls out to the right, then comes round again.
      gsap.to(o, { x: 1000, duration: 1, ease: "power2.in", onUpdate: place, onComplete: () => void drive(0.3) });
      requestAnimationFrame(() => kick());
    };

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      kick();
    });
    io.observe(scene);
    const ro = new ResizeObserver(size);
    ro.observe(scene);
    size();
    const onVis = () => kick();
    document.addEventListener("visibilitychange", onVis);
    // The haze takes its colour from the theme.
    const mo = new MutationObserver(retint);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    const dark = matchMedia("(prefers-color-scheme: dark)");
    dark.addEventListener("change", retint);
    cv.addEventListener("pointermove", onMove, { passive: true });
    cv.addEventListener("pointerleave", onLeave);
    cv.addEventListener("pointercancel", onLeave);
    cv.addEventListener("pointerdown", onDown, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      gsap.killTweensOf([o, gx, cv]);
      io.disconnect();
      ro.disconnect();
      mo.disconnect();
      dark.removeEventListener("change", retint);
      document.removeEventListener("visibilitychange", onVis);
      cv.removeEventListener("pointermove", onMove);
      cv.removeEventListener("pointerleave", onLeave);
      cv.removeEventListener("pointercancel", onLeave);
      cv.removeEventListener("pointerdown", onDown);
      stopWind();
    };
  }, []);

  const row = phase === "haze" ? 0 : phase === "air" ? 1 : 2;
  const live = phase === "haze" || phase === "air";

  return (
    <div ref={root} className={`street ${className}`} data-state={phase}>
      <div className="street-scene" aria-hidden="true">
        {children}
        <canvas ref={canvas} className="street-haze" data-cursor-mode={live ? "breeze" : undefined} />
      </div>
      <div className="street-ui" aria-hidden="true">
        <span ref={chip} className="street-chip">
          <span className={`street-chip-row${row === 0 ? " is-on" : ""}`}>
            Haze: one student&apos;s motorbike commute for a day · <b className="text-accent-text">{DAY_G} g CO₂</b>
          </span>
          <span className={`street-chip-row${row === 1 ? " is-on" : ""}`}>
            Air cleared: <b className="text-[var(--success)]"><span ref={num}>0</span> g</b>
            <em> · sweep away the rest</em>
          </span>
          <span className={`street-chip-row${row === 2 ? " is-on" : ""}`}>
            <b className="text-[var(--success)]">{DAY_G} g cleared.</b> Those {LEAVES} leaves are waiting at the bottom of the page.
          </span>
        </span>
        {phase === "clear" && (
          <button type="button" tabIndex={-1} className="street-reset" onClick={() => resetRef.current()}>
            Bring the haze back
          </button>
        )}
      </div>
      <p className="sr-only">
        A drawing of a Hanoi street under motorbike haze, as much CO₂ as one student&apos;s commute makes in a day ({DAY_G} g). A green
        number 08 bus drives through and the air clears behind it.
      </p>
    </div>
  );
}
