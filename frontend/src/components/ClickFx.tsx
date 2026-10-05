"use client";

import { useEffect } from "react";
import { play, unlockAudio } from "@/lib/sfx";
import { reducedMotion } from "@/lib/motion";

/* Click feedback for the whole page:
   - every link and button gets a synthesized sound (see lib/sfx)
   - .btn gets an ink ripple from the press point
   - primary buttons and pills throw a small burst of leaves and confetti
   - mascots squash, stretch and boing when poked
   The ripple starts on pointerdown so it feels instant; sound waits for click, because Safari and
   mobile browsers only unlock audio on a click/tap, not on pointerdown. */

const COLORS = ["#7dc62f", "#c8efa5", "#f26a1b", "#a9def2", "#ffd45a", "#5aae3a"];

function ripple(el: HTMLElement, e: PointerEvent) {
  const r = el.getBoundingClientRect();
  const d = Math.max(r.width, r.height) * 2.2;
  const s = document.createElement("span");
  s.className = "ripple";
  s.style.width = s.style.height = `${d}px`;
  s.style.left = `${e.clientX - r.left - d / 2}px`;
  s.style.top = `${e.clientY - r.top - d / 2}px`;
  el.appendChild(s);
  s.addEventListener("animationend", () => s.remove());
}

/** Leaves and dots that spray out of (x, y) and fall with a little gravity. */
export function burst(x: number, y: number, count = 14, spread = 1) {
  if (reducedMotion()) return;
  const layer = document.createElement("div");
  layer.className = "burst";
  layer.style.left = `${x}px`;
  layer.style.top = `${y}px`;
  document.body.appendChild(layer);
  let left = count;
  for (let i = 0; i < count; i++) {
    const p = document.createElement("i");
    const leaf = i % 3 !== 0;
    p.className = leaf ? "leaf" : "dot";
    p.style.background = COLORS[i % COLORS.length];
    const size = (leaf ? 9 : 6) + Math.random() * 6;
    p.style.width = `${size}px`;
    p.style.height = `${size}px`;
    layer.appendChild(p);
    const a = (Math.PI * 2 * i) / count + Math.random() * 0.5;
    const v = (60 + Math.random() * 90) * spread;
    const dx = Math.cos(a) * v;
    const dy = Math.sin(a) * v - 40 * spread;
    const rot = (Math.random() - 0.5) * 540;
    p.animate(
      [
        { transform: "translate(-50%, -50%) scale(0.2) rotate(0deg)", opacity: 1 },
        { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(1) rotate(${rot / 2}deg)`, opacity: 1, offset: 0.45 },
        { transform: `translate(calc(-50% + ${dx * 1.25}px), calc(-50% + ${dy + 90 * spread}px)) scale(0.6) rotate(${rot}deg)`, opacity: 0 },
      ],
      { duration: 900 + Math.random() * 500, easing: "cubic-bezier(.15,.7,.3,1)", fill: "forwards" }
    ).onfinish = () => {
      if (--left === 0) layer.remove();
    };
  }
}

export default function ClickFx() {
  useEffect(() => {
    const target = (e: Event) => (e.target as Element | null)?.closest<HTMLElement>("a, button") ?? null;

    function onDown(e: PointerEvent) {
      if (e.button !== 0) return;
      const el = target(e);
      if (el?.classList.contains("btn")) ripple(el, e);
    }

    function onClick(e: MouseEvent) {
      unlockAudio();
      const t = e.target as Element | null;
      const mascot = t?.closest<HTMLElement>(".mascot-hit");
      if (mascot) {
        play("boing");
        const img = mascot.querySelector<HTMLElement>(".mascot-img") ?? mascot;
        img.classList.remove("boing");
        void img.offsetWidth; // restart the animation
        img.classList.add("boing");
        img.addEventListener("animationend", () => img.classList.remove("boing"), { once: true });
        burst(e.clientX, e.clientY, 10, 0.7);
        return;
      }
      const el = target(e);
      if (!el) return;
      // Components with their own sound (calculator, toggles) mark themselves data-sfx="own".
      if (el.dataset.sfx === "own") return;
      const primary = el.classList.contains("btn-primary");
      play(primary ? "cta" : el.closest("header") ? "nav" : "tap");
      if (primary || el.classList.contains("pill")) burst(e.clientX, e.clientY, primary ? 16 : 9, primary ? 1 : 0.6);
    }

    function onKey(e: KeyboardEvent) {
      if (e.key === "Enter" || e.key === " ") unlockAudio();
    }

    document.addEventListener("pointerdown", onDown);
    document.addEventListener("click", onClick, true);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("keydown", onKey);
    };
  }, []);
  return null;
}
