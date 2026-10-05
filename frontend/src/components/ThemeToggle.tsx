"use client";

import { useSyncExternalStore } from "react";
import { play } from "@/lib/sfx";
import { reducedMotion } from "@/lib/motion";

type Theme = "system" | "light" | "dark";
const ORDER: Theme[] = ["system", "light", "dark"];
const LABEL: Record<Theme, string> = { system: "Auto", light: "Light", dark: "Dark" };

const listeners = new Set<() => void>();
function read(): Theme {
  try {
    const t = localStorage.getItem("theme");
    return t === "light" || t === "dark" ? t : "system";
  } catch {
    return "system";
  }
}
function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

/** Cycles Auto → Light → Dark. Auto follows the system setting. The new theme spreads out from the button as a circle where the browser supports view transitions. */
export default function ThemeToggle({ className = "inline-flex" }: { className?: string }) {
  const theme = useSyncExternalStore(subscribe, read, () => "system" as Theme);

  function apply(t: Theme) {
    try {
      if (t === "system") localStorage.removeItem("theme");
      else localStorage.setItem("theme", t);
    } catch {}
    if (t === "system") delete document.documentElement.dataset.theme;
    else document.documentElement.dataset.theme = t;
    listeners.forEach((l) => l());
  }

  function next(e: React.MouseEvent<HTMLButtonElement>) {
    const t = ORDER[(ORDER.indexOf(theme) + 1) % ORDER.length];
    play("toggle");
    const doc = document as Document & { startViewTransition?: (cb: () => void) => { ready: Promise<void> } };
    if (!doc.startViewTransition || reducedMotion()) return apply(t);
    const b = e.currentTarget.getBoundingClientRect();
    const x = b.left + b.width / 2;
    const y = b.top + b.height / 2;
    const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    const vt = doc.startViewTransition(() => apply(t));
    vt.ready
      .then(() =>
        document.documentElement.animate(
          { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
          { duration: 650, easing: "cubic-bezier(.7,0,.2,1)", pseudoElement: "::view-transition-new(root)" }
        )
      )
      .catch(() => {});
  }

  return (
    <button
      type="button"
      onClick={next}
      data-sfx="own"
      className={`items-center gap-2 rounded-full border-2 border-border px-3 h-9 text-[13px] font-semibold text-text-secondary hover:text-text-display hover:border-border-visible transition-colors ${className}`}
      aria-label={`Theme: ${LABEL[theme]}. Switch theme`}
    >
      <span aria-hidden="true" className="theme-dot" data-t={theme} />
      {LABEL[theme]}
    </button>
  );
}
