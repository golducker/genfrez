/*
 * What this visitor has done on the page so far, for parts that answer each other: the hero street
 * records the grams of haze cleared, the leaf jar at the bottom pours one leaf per 25 g.
 * Kept in sessionStorage (inside try/catch, so private windows still work) and never goes down:
 * bringing the haze back replays the street without emptying the jar.
 */

const KEY = "cleared-g";
let grams: number | null = null;
const subs = new Set<() => void>();

function load() {
  if (grams !== null) return grams;
  grams = 0;
  try {
    grams = Math.max(0, Number(sessionStorage.getItem(KEY)) || 0);
  } catch {}
  return grams;
}

/** Grams of CO₂ haze cleared in this visit (the most reached, in 25 g steps). */
export const getCleared = () => (typeof window === "undefined" ? 0 : load());

export function setCleared(g: number) {
  if (g <= load()) return;
  grams = g;
  try {
    sessionStorage.setItem(KEY, String(g));
  } catch {}
  subs.forEach((f) => f());
}

export function subscribeCleared(cb: () => void) {
  subs.add(cb);
  return () => {
    subs.delete(cb);
  };
}
