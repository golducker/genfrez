"use client";

import { useEffect, useRef } from "react";
import { reducedMotion } from "@/lib/motion";

/*
 * Drifting leaves on a canvas behind a section. Each leaf sways, spins and flips on its long axis,
 * and the cursor pushes nearby leaves away like a breeze. The loop pauses while the section is off
 * screen or the tab is hidden, and nothing draws with reduced motion.
 */
type Leaf = { x: number; y: number; vx: number; vy: number; s: number; r: number; vr: number; flip: number; vf: number; sway: number; c: string; kind: number };

const PALETTE = ["#7dc62f", "#5aae3a", "#a6dc6a", "#c8efa5", "#3f8a24", "#f26a1b", "#a9def2"];

export default function Leaves({ count = 22, className = "", direction = "down" }: { count?: number; className?: string; direction?: "down" | "up" }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (reducedMotion()) return;
    const cv = ref.current!;
    const g = cv.getContext("2d")!;
    let w = 0,
      h = 0,
      dpr = 1,
      raf = 0,
      visible = false,
      mx = -9999,
      my = -9999,
      last = performance.now();
    const dir = direction === "up" ? -1 : 1;

    const make = (initial: boolean): Leaf => {
      const s = 7 + Math.random() * 11;
      return {
        x: Math.random() * w,
        y: initial ? Math.random() * h : dir > 0 ? -30 : h + 30,
        vx: (Math.random() - 0.5) * 12,
        vy: (14 + Math.random() * 26) * dir,
        s,
        r: Math.random() * Math.PI * 2,
        vr: (Math.random() - 0.5) * 1.6,
        flip: Math.random() * Math.PI * 2,
        vf: 1 + Math.random() * 2.2,
        sway: Math.random() * Math.PI * 2,
        c: PALETTE[Math.random() < 0.82 ? Math.floor(Math.random() * 5) : 5 + Math.floor(Math.random() * 2)],
        kind: Math.random() < 0.75 ? 0 : 1,
      };
    };

    let leaves: Leaf[] = [];
    function size() {
      const b = cv.getBoundingClientRect();
      dpr = Math.min(2, devicePixelRatio || 1);
      w = b.width;
      h = b.height;
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
      if (!leaves.length) leaves = Array.from({ length: count }, () => make(true));
    }

    function draw(l: Leaf) {
      g.save();
      g.translate(l.x, l.y);
      g.rotate(l.r);
      g.scale(Math.cos(l.flip), 1);
      g.fillStyle = l.c;
      g.globalAlpha = 0.85;
      g.beginPath();
      if (l.kind === 0) {
        // Leaf: two arcs meeting at the tips, plus a vein.
        g.moveTo(0, -l.s);
        g.quadraticCurveTo(l.s * 0.9, 0, 0, l.s);
        g.quadraticCurveTo(-l.s * 0.9, 0, 0, -l.s);
        g.fill();
        g.strokeStyle = "rgba(255,255,255,.45)";
        g.lineWidth = 1;
        g.beginPath();
        g.moveTo(0, -l.s * 0.8);
        g.lineTo(0, l.s * 0.8);
        g.stroke();
      } else {
        // Petal: a soft rounded diamond.
        g.ellipse(0, 0, l.s * 0.45, l.s * 0.7, 0, 0, Math.PI * 2);
        g.fill();
      }
      g.restore();
    }

    function frame(now: number) {
      raf = 0;
      if (!visible || document.hidden) return;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.clearRect(0, 0, w, h);
      for (let i = 0; i < leaves.length; i++) {
        const l = leaves[i];
        l.sway += dt * 1.3;
        const dx = l.x - mx,
          dy = l.y - my,
          d2 = dx * dx + dy * dy;
        if (d2 < 140 * 140) {
          const f = (1 - Math.sqrt(d2) / 140) * 420 * dt;
          const d = Math.sqrt(d2) || 1;
          l.vx += (dx / d) * f * 6;
          l.vy += (dy / d) * f * 3;
          l.vr += (Math.random() - 0.5) * 0.6;
        }
        l.vx *= 0.985;
        l.vy += ((dir * (14 + l.s)) - l.vy) * 0.6 * dt;
        l.x += (l.vx + Math.sin(l.sway) * 22) * dt;
        l.y += l.vy * dt;
        l.r += l.vr * dt;
        l.flip += l.vf * dt;
        if ((dir > 0 && l.y > h + 30) || (dir < 0 && l.y < -30) || l.x < -60 || l.x > w + 60) leaves[i] = make(false);
        draw(l);
      }
      raf = requestAnimationFrame(frame);
    }
    const start = () => {
      if (!raf && visible) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    };

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      start();
    });
    io.observe(cv);
    const ro = new ResizeObserver(size);
    ro.observe(cv);
    size();

    function onMove(e: PointerEvent) {
      const b = cv.getBoundingClientRect();
      mx = e.clientX - b.left;
      my = e.clientY - b.top;
    }
    const onVis = () => start();
    addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("visibilitychange", onVis);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      removeEventListener("pointermove", onMove);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [count, direction]);

  return <canvas ref={ref} aria-hidden="true" className={`pointer-events-none absolute inset-0 h-full w-full ${className}`} />;
}
