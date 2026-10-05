"use client";

import { useEffect, useRef } from "react";
import { reducedMotion, finePointer } from "@/lib/motion";
import { getCleared, subscribeCleared, projectedG, setJarFullG } from "@/lib/visit";
import { G_PER_POINT } from "@/lib/points";
import { play } from "@/lib/sfx";
import { rustle, buzz } from "@/lib/sfx-jar";
import "./LeafJar.css";

/*
 * The footer wordmark as a glass jar. Each leaf is 25 g of the Year-1 projection counted while the
 * page was open (lib/visit.ts); the Z is walled off and holds only orange leaves, one per 25 g of haze
 * the visitor cleared in the hero street. Leaves pour in when the footer arrives, keep dripping while
 * it stays in view, and pile up under Verlet physics clipped to the letter shapes. The loop sleeps
 * once nothing moves, stops off screen and in hidden tabs. Reduced motion draws the pile once.
 * Lives inside .footer-mega and reads the letters' boxes from its .split-w spans.
 */

const GREENS = ["#7dc62f", "#5aae3a", "#a6dc6a", "#3f8a24", "#c8efa5"];
const ORANGES = ["#f26a1b", "#ff9a5c", "#ffb347"];
const COLORS = [...GREENS, ...ORANGES];

type Leaf = { x: number; y: number; px: number; py: number; r: number; a: number; c: number; z: 0 | 1 };
type Geo = {
  w: number;
  h: number;
  floor: number;
  top: number; // cap height line: the brim
  lo: number[]; // left wall per region (0 green, 1 the Z)
  hi: number[];
  R: number;
  caps: number[];
};

const STEP = 1000 / 60;

export default function LeafJar() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current!;
    const host = cv.parentElement as HTMLElement;
    const g = cv.getContext("2d")!;
    const mask = document.createElement("canvas");
    const rim = document.createElement("canvas");
    const still = reducedMotion();
    const cap = matchMedia("(min-width: 640px)").matches ? 520 : 260;

    let geo: Geo | null = null;
    let dpr = 1;
    let leaves: Leaf[] = [];
    let counts = [0, 0];
    let raf = 0;
    let poll = 0;
    let visible = false;
    let fontsOk = false;
    let calm = 0;
    let quietMs = 0;
    let acc = 0;
    let last = 0;
    let spawnRate = 1;
    let full = false;
    let lastPt: { x: number; y: number } | null = null;
    const timers: number[] = [];
    // Spatial hash, rebuilt per constraint pass. Linked lists in typed arrays: no allocation per frame.
    let cell = 1,
      cols = 1,
      rows = 1,
      y0 = 0,
      head = new Int32Array(1),
      next = new Int32Array(1);

    host.classList.add("jar");
    void document.fonts?.ready.then(() => {
      fontsOk = true;
      if (visible) check();
    });

    /** The letters are home when every .split-i sits at the top of its .split-w (the rise is over). */
    const lettersHome = () =>
      [...host.querySelectorAll<HTMLElement>(".split-w")].every((w) => {
        const i = w.firstElementChild as HTMLElement | null;
        return !!i && Math.abs(i.getBoundingClientRect().top - w.getBoundingClientRect().top) < 1;
      });

    function measure(): Geo | null {
      const hb = cv.getBoundingClientRect();
      const spans = [...host.querySelectorAll<HTMLElement>(".split-w")];
      if (!hb.width || spans.length < 2) return null;
      const cs = getComputedStyle(host);
      const fs = parseFloat(cs.fontSize);
      // The family next/font resolved, not the name we asked for.
      const font = `800 ${fs}px ${cs.fontFamily}`;
      const lineH = parseFloat(cs.lineHeight) || fs * 0.82;
      dpr = Math.min(2, devicePixelRatio || 1);
      const w = hb.width,
        h = hb.height;
      cv.width = mask.width = rim.width = Math.round(w * dpr);
      cv.height = mask.height = rim.height = Math.round(h * dpr);

      const m = mask.getContext("2d")!;
      m.setTransform(dpr, 0, 0, dpr, 0, 0);
      m.clearRect(0, 0, w, h);
      m.font = font;
      m.textBaseline = "alphabetic";
      m.fillStyle = "#000";
      const gm = m.measureText("G");
      const asc = gm.fontBoundingBoxAscent,
        desc = gm.fontBoundingBoxDescent;
      let base = 0,
        ink0 = Infinity,
        ink1 = 0,
        wall = 0,
        prevRight = 0;
      spans.forEach((s, k) => {
        const c = s.textContent || "";
        const b = s.getBoundingClientRect();
        const x = b.left - hb.left;
        // CSS centres the font's content box in the line box: half the leading above the ascent.
        base = b.top - hb.top + (lineH - (asc + desc)) / 2 + asc;
        m.fillText(c, x, base);
        const t = m.measureText(c);
        ink0 = Math.min(ink0, x - t.actualBoundingBoxLeft);
        ink1 = Math.max(ink1, x + t.actualBoundingBoxRight);
        if (k === spans.length - 1) wall = (Math.max(prevRight, x - t.actualBoundingBoxLeft) + (x - t.actualBoundingBoxLeft)) / 2;
        prevRight = x + t.actualBoundingBoxRight;
      });
      const zm = m.measureText("Z");
      const top = base - zm.actualBoundingBoxAscent;
      const floor = base + Math.max(1, m.measureText("Ge").actualBoundingBoxDescent);
      const brim = floor - top;
      const R = Math.sqrt((0.92 * (ink1 - ink0) * brim) / (cap * Math.PI));
      glassRim(wall, Math.max(1, fs * 0.007));
      const greenCap = Math.round((cap * (wall - ink0)) / (ink1 - ink0));
      setJarFullG(greenCap * G_PER_POINT);

      cell = R * 2.7;
      y0 = top - R * 14;
      cols = Math.ceil((ink1 - ink0) / cell) + 3;
      rows = Math.ceil((floor - y0) / cell) + 2;
      head = new Int32Array(cols * rows);
      return { w, h, floor, top, lo: [ink0, wall], hi: [wall, ink1], R, caps: [greenCap, cap - greenCap] };
    }

    /**
     * The glass edge, drawn once per size: the glyph minus itself nudged one way leaves a thin rim on
     * the opposite side. Light on the top left, dimmer on the bottom right, orange around the Z.
     * (A CSS text-stroke would trace the variable font's overlapping contours inside each letter.)
     */
    function glassRim(wall: number, o: number) {
      const r = rim.getContext("2d")!;
      const tmp = document.createElement("canvas");
      tmp.width = rim.width;
      tmp.height = rim.height;
      const t = tmp.getContext("2d")!;
      r.setTransform(1, 0, 0, 1, 0, 0);
      r.clearRect(0, 0, rim.width, rim.height);
      const d = o * dpr;
      for (const [dx, dy, a] of [
        [d, d * 1.4, 0.62],
        [-d, -d, 0.22],
      ]) {
        t.globalCompositeOperation = "source-over";
        t.clearRect(0, 0, tmp.width, tmp.height);
        t.drawImage(mask, 0, 0);
        t.globalCompositeOperation = "destination-out";
        t.drawImage(mask, dx, dy);
        r.globalAlpha = a;
        r.drawImage(tmp, 0, 0);
      }
      r.globalAlpha = 1;
      r.globalCompositeOperation = "source-atop";
      r.fillStyle = "#fbf6e0";
      r.fillRect(0, 0, wall * dpr, rim.height);
      r.fillStyle = "#ff9a5c";
      r.fillRect(wall * dpr, 0, rim.width, rim.height);
      r.globalCompositeOperation = "source-over";
    }

    const wanted = (G: Geo) => [Math.min(G.caps[0], Math.floor(projectedG() / G_PER_POINT)), Math.min(G.caps[1], Math.floor(getCleared() / G_PER_POINT))];

    function makeLeaf(G: Geo, z: 0 | 1, x: number, y: number): Leaf {
      const r = G.R * (0.82 + Math.random() * 0.4);
      const c = z ? GREENS.length + Math.floor(Math.random() * ORANGES.length) : Math.floor(Math.random() * GREENS.length);
      return { x, y, px: x, py: y, r, a: Math.random() * Math.PI * 2, c, z };
    }

    /** Settled rows from the floor up: the reduced-motion picture, and the restart after a resize. */
    function stack(G: Geo, n: number[]) {
      leaves = [];
      for (const z of [0, 1] as const) {
        const d = G.R * 1.95,
          rowH = d * 0.87;
        const per = Math.max(1, Math.floor((G.hi[z] - G.lo[z] - G.R * 0.5) / d));
        for (let i = 0; i < n[z]; i++) {
          const row = Math.floor(i / per),
            col = i % per;
          const x = G.lo[z] + G.R * 1.05 + col * d + (row % 2 ? d / 2 : 0) + (Math.random() - 0.5) * G.R * 0.3;
          const y = G.floor - G.R - row * rowH + (Math.random() - 0.5) * G.R * 0.3;
          leaves.push(makeLeaf(G, z, Math.min(G.hi[z] - G.R, x), y));
        }
      }
      counts = n.slice();
    }

    function spawn(G: Geo) {
      const want = wanted(G);
      let made = 0;
      for (const z of [0, 1] as const) {
        for (let k = 0; k < spawnRate && counts[z] < want[z]; k++) {
          const x = G.lo[z] + G.R + Math.random() * (G.hi[z] - G.lo[z] - 2 * G.R);
          const l = makeLeaf(G, z, x, G.top - G.R * (1 + Math.random() * 10));
          l.py = l.y - G.R * 0.25;
          leaves.push(l);
          counts[z]++;
          made++;
        }
      }
      if (made) rustle(Math.min(1, spawnRate / 4));
      return made;
    }

    function step(G: Geo) {
      const gr = G.R * 0.045,
        vmax = G.R * 1.4;
      let motion = 0;
      for (const p of leaves) {
        let vx = (p.x - p.px) * 0.985,
          vy = (p.y - p.py) * 0.985;
        const v = Math.hypot(vx, vy);
        if (v > vmax) {
          vx *= vmax / v;
          vy *= vmax / v;
        }
        p.px = p.x;
        p.py = p.y;
        p.x += vx;
        p.y += vy + gr;
        p.a += vx * 0.05;
      }
      const n = leaves.length;
      if (next.length < n) next = new Int32Array(n * 2);
      for (let pass = 0; pass < 2; pass++) {
        head.fill(-1);
        for (let i = 0; i < n; i++) {
          const p = leaves[i];
          const cx = Math.min(cols - 1, Math.max(0, Math.floor((p.x - G.lo[0]) / cell) + 1));
          const cy = Math.min(rows - 1, Math.max(0, Math.floor((p.y - y0) / cell)));
          const k = cx + cy * cols;
          next[i] = head[k];
          head[k] = i;
        }
        for (let i = 0; i < n; i++) {
          const p = leaves[i];
          const cx = Math.min(cols - 1, Math.max(0, Math.floor((p.x - G.lo[0]) / cell) + 1));
          const cy = Math.min(rows - 1, Math.max(0, Math.floor((p.y - y0) / cell)));
          for (let dy = -1; dy <= 1; dy++) {
            const yy = cy + dy;
            if (yy < 0 || yy >= rows) continue;
            for (let dx = -1; dx <= 1; dx++) {
              const xx = cx + dx;
              if (xx < 0 || xx >= cols) continue;
              for (let j = head[xx + yy * cols]; j !== -1; j = next[j]) {
                if (j <= i) continue;
                const q = leaves[j];
                if (q.z !== p.z) continue; // the wall keeps the Z's leaves apart
                let ex = q.x - p.x,
                  ey = q.y - p.y;
                const d2 = ex * ex + ey * ey,
                  min = (p.r + q.r) * 0.92;
                if (d2 > 0.0001 && d2 < min * min) {
                  const d = Math.sqrt(d2),
                    o = ((min - d) / d) * 0.5;
                  ex *= o;
                  ey *= o;
                  p.x -= ex;
                  p.y -= ey;
                  q.x += ex;
                  q.y += ey;
                }
              }
            }
          }
        }
        for (const p of leaves) {
          if (p.y > G.floor - p.r * 0.7) {
            p.y = G.floor - p.r * 0.7;
            p.px = p.x - (p.x - p.px) * 0.5; // friction on the floor
          }
          const lo = G.lo[p.z] + p.r * 0.6,
            hi = G.hi[p.z] - p.r * 0.6;
          if (p.x < lo) p.x = lo;
          else if (p.x > hi) p.x = hi;
        }
      }
      for (const p of leaves) motion = Math.max(motion, Math.abs(p.x - p.px) + Math.abs(p.y - p.py));
      return motion;
    }

    function draw(G: Geo) {
      g.globalCompositeOperation = "source-over";
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.clearRect(0, 0, G.w, G.h);
      // One path per colour: a leaf is two quadratic arcs tip to tip, rotated by hand.
      for (let ci = 0; ci < COLORS.length; ci++) {
        g.beginPath();
        for (const p of leaves) {
          if (p.c !== ci) continue;
          const L = p.r * 1.35,
            W = p.r * 1.05,
            c = Math.cos(p.a),
            s = Math.sin(p.a);
          g.moveTo(p.x + L * s, p.y - L * c);
          g.quadraticCurveTo(p.x + W * c, p.y + W * s, p.x - L * s, p.y + L * c);
          g.quadraticCurveTo(p.x - W * c, p.y - W * s, p.x + L * s, p.y - L * c);
        }
        g.fillStyle = COLORS[ci];
        g.fill();
      }
      if (G.R >= 5) {
        g.beginPath();
        for (const p of leaves) {
          const L = p.r * 1.0,
            c = Math.cos(p.a),
            s = Math.sin(p.a);
          g.moveTo(p.x + L * s, p.y - L * c);
          g.lineTo(p.x - L * s, p.y + L * c);
        }
        g.strokeStyle = "rgba(255,255,255,.38)";
        g.lineWidth = Math.max(0.7, G.R * 0.09);
        g.stroke();
      }
      // Keep only what falls inside the letters, then a light sheen down the glass.
      g.globalCompositeOperation = "destination-in";
      g.setTransform(1, 0, 0, 1, 0, 0);
      g.drawImage(mask, 0, 0);
      g.globalCompositeOperation = "source-atop";
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      const sheen = g.createLinearGradient(0, G.top, 0, G.floor);
      sheen.addColorStop(0, "rgba(255,255,255,.22)");
      sheen.addColorStop(0.45, "rgba(255,255,255,0)");
      sheen.addColorStop(1, "rgba(13,36,64,.18)");
      g.fillStyle = sheen;
      g.fillRect(0, 0, G.w, G.h);
      g.globalCompositeOperation = "source-over";
      g.setTransform(1, 0, 0, 1, 0, 0);
      g.drawImage(rim, 0, 0);
    }

    function frame(now: number) {
      raf = 0;
      if (!visible || document.hidden || !geo) return;
      const G = geo;
      acc += Math.min(100, now - last);
      last = now;
      let moved = 0;
      while (acc >= STEP) {
        acc -= STEP;
        const made = spawn(G);
        moved = Math.max(moved, step(G));
        quietMs = made ? 0 : quietMs + STEP;
      }
      draw(G);
      const want = wanted(G);
      const pending = counts[0] < want[0] || counts[1] < want[1];
      calm = moved < G.R * 0.02 ? calm + 1 : 0;
      // Full: light the Z a beat after the last leaf lands, without waiting for the pile to sleep.
      if (counts[0] >= G.caps[0] && quietMs > 1200) fill();
      // Sleep once the pile is still (or has only crept for 3.5 s since the last leaf landed).
      if (!pending && (calm > 30 || quietMs > 3500)) return;
      raf = requestAnimationFrame(frame);
    }

    function wake() {
      if (raf || !visible || document.hidden || !geo || still) return;
      calm = 0;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    }

    /** The jar is full: the Z strikes like a neon shop sign, then the sound logo. Once per visit. */
    function fill() {
      if (full) return;
      full = true;
      host.classList.add("jar-full");
      if (still) return;
      [0, 170, 380].forEach((t) => timers.push(window.setTimeout(buzz, t)));
      timers.push(window.setTimeout(() => play("hook", { ambient: true }), 820));
    }

    /** Called while the footer is in view: measure once the font and the letters are in place. */
    function check() {
      if (!visible || !fontsOk) return;
      if (!geo) {
        if (!still && !lettersHome()) {
          host.classList.remove("jar-show");
          return;
        }
        geo = measure();
        if (!geo) return;
        host.classList.add("jar-show");
      }
      if (still) {
        // One still picture of the pile as it stands, redrawn each time the footer comes back.
        stack(geo, wanted(geo));
        draw(geo);
        if (counts[0] >= geo.caps[0]) fill();
        return;
      }
      const want = wanted(geo);
      const backlog = want[0] - counts[0] + want[1] - counts[1];
      if (backlog > 0) {
        // A big backlog pours in about two seconds; the live drip is a leaf at a time.
        if (!raf) spawnRate = Math.max(1, Math.ceil(backlog / 130));
        wake();
      } else if (counts[0] >= geo.caps[0]) stopPoll(); // full: nothing left to wait for
    }

    function startPoll() {
      if (poll || still) return;
      poll = window.setInterval(check, 250);
    }
    function stopPoll() {
      clearInterval(poll);
      poll = 0;
    }

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) {
        check();
        startPoll();
      } else {
        stopPoll();
        cancelAnimationFrame(raf);
        raf = 0;
      }
    });
    io.observe(host);

    let lastW = 0;
    const ro = new ResizeObserver(([e]) => {
      const w = e.contentRect.width;
      if (Math.abs(w - lastW) < 1) return;
      lastW = w;
      if (!geo) return;
      // A new size moves every letter: re-measure and restart from a settled pile.
      cancelAnimationFrame(raf);
      raf = 0;
      const n = counts.slice();
      geo = measure();
      if (!geo) return;
      stack(geo, [Math.min(n[0], geo.caps[0]), Math.min(n[1], geo.caps[1])]);
      draw(geo);
      wake();
    });
    ro.observe(host);

    const onVis = () => {
      if (document.hidden) stopPoll();
      else if (visible) {
        startPoll();
        wake();
      }
    };
    document.addEventListener("visibilitychange", onVis);
    const offCleared = subscribeCleared(() => check());

    // Stirring: the pointer shoves the leaves it passes through and they hop and resettle.
    function onMove(e: PointerEvent) {
      if (!geo || still) return;
      const hb = cv.getBoundingClientRect();
      const x = e.clientX - hb.left,
        y = e.clientY - hb.top;
      const prev = lastPt;
      lastPt = { x, y };
      if (!prev) return;
      const mx = x - prev.x,
        my = y - prev.y;
      const rr = Math.max(26, geo.R * 4.5);
      let hit = 0;
      for (const p of leaves) {
        const dx = p.x - x,
          dy = p.y - y,
          d = Math.hypot(dx, dy);
        if (d > rr) continue;
        const f = 1 - d / rr;
        p.px -= mx * 0.3 * f;
        p.py -= my * 0.2 * f - geo.R * 0.5 * f; // a little hop upward
        hit++;
      }
      if (hit) {
        rustle(Math.min(0.6, hit / 40));
        quietMs = 0;
        wake();
      }
    }
    const onLeave = () => (lastPt = null);
    host.addEventListener("pointermove", onMove, { passive: true });
    host.addEventListener("pointerleave", onLeave);
    if (finePointer() && !still) host.setAttribute("data-cursor", "Stir");

    return () => {
      cancelAnimationFrame(raf);
      stopPoll();
      timers.forEach(clearTimeout);
      io.disconnect();
      ro.disconnect();
      offCleared();
      document.removeEventListener("visibilitychange", onVis);
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
      host.removeAttribute("data-cursor");
      host.classList.remove("jar", "jar-show", "jar-full");
    };
  }, []);

  return <canvas ref={ref} aria-hidden="true" className="jar-canvas" />;
}
