"use client";

import { useSyncExternalStore } from "react";

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

/** Cycles Auto → Light → Dark. Auto follows the system setting. */
export default function ThemeToggle({ className = "inline-flex" }: { className?: string }) {
  const theme = useSyncExternalStore(subscribe, read, () => "system" as Theme);

  function next() {
    const t = ORDER[(ORDER.indexOf(theme) + 1) % ORDER.length];
    try {
      if (t === "system") localStorage.removeItem("theme");
      else localStorage.setItem("theme", t);
    } catch {}
    if (t === "system") delete document.documentElement.dataset.theme;
    else document.documentElement.dataset.theme = t;
    listeners.forEach((l) => l());
  }

  return (
    <button
      type="button"
      onClick={next}
      className={`items-center gap-2 rounded-full border-2 border-border px-3 h-9 text-[13px] font-semibold text-text-secondary hover:text-text-display hover:border-border-visible transition-colors ${className}`}
      aria-label={`Theme: ${LABEL[theme]}. Switch theme`}
    >
      <span aria-hidden="true" className="inline-block w-3 h-3 rounded-full border-2 border-current" style={{ background: "linear-gradient(90deg, currentColor 50%, transparent 50%)" }} />
      {LABEL[theme]}
    </button>
  );
}
