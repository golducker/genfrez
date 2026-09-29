"use client";

import { useEffect, useSyncExternalStore } from "react";

/* Click feedback for every link and button: a short synthesized "pop" (Web Audio, no asset files)
   plus a ripple on .btn. Sound can be muted; the choice is kept in localStorage. */

let ctx: AudioContext | null = null;
const listeners = new Set<() => void>();

function readMuted(): boolean {
  try {
    return localStorage.getItem("sound") === "off";
  } catch {
    return false;
  }
}
function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function pop(kind: "tap" | "nav" | "cta") {
  if (readMuted()) return;
  try {
    ctx ??= new AudioContext();
    const t = ctx.currentTime;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    const base = kind === "cta" ? 440 : kind === "nav" ? 560 : 680;
    o.type = "sine";
    o.frequency.setValueAtTime(base, t);
    o.frequency.exponentialRampToValueAtTime(base * 1.9, t + 0.07);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(kind === "cta" ? 0.22 : 0.14, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
    o.connect(g).connect(ctx.destination);
    o.start(t);
    o.stop(t + 0.18);
  } catch {}
}

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

export default function ClickFx() {
  useEffect(() => {
    function onDown(e: PointerEvent) {
      if (e.button !== 0) return;
      const el = (e.target as Element | null)?.closest<HTMLElement>("a, button");
      if (!el) return;
      const isBtn = el.classList.contains("btn");
      pop(el.classList.contains("btn-primary") ? "cta" : el.closest("header") ? "nav" : "tap");
      if (isBtn) ripple(el, e);
    }
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, []);
  return null;
}

export function SoundToggle({ className = "inline-flex" }: { className?: string }) {
  const muted = useSyncExternalStore(subscribe, readMuted, () => false);
  function toggle() {
    try {
      localStorage.setItem("sound", muted ? "on" : "off");
    } catch {}
    listeners.forEach((l) => l());
  }
  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={!muted}
      aria-label={muted ? "Sound off. Turn click sounds on" : "Sound on. Turn click sounds off"}
      className={`items-center gap-1.5 rounded-full border-2 border-border px-3 h-9 text-[13px] font-semibold text-text-secondary hover:text-text-display hover:border-border-visible transition-colors ${className}`}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor" />
        {muted ? <path d="M17 9l5 6M22 9l-5 6" /> : <path d="M17 8.5a5 5 0 0 1 0 7M19.5 6a8.5 8.5 0 0 1 0 12" />}
      </svg>
      {muted ? "Off" : "Sound"}
    </button>
  );
}
