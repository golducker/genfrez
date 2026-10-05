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

/*
 * The Year-1 projection clock behind the footer jar: 12,000 riders each take one 5 km e-bike trip a
 * day instead of a petrol motorbike, saving 95 − 30 = 65 g per km. That is 3.9 t a day, about 45 g a
 * second. The clock only runs while the tab is visible, so a page left in the background adds nothing.
 */
export const YEAR1 = { riders: 12000, km: 5, savedPerKm: 65 };
export const PROJ_G_PER_DAY = YEAR1.riders * YEAR1.km * YEAR1.savedPerKm;
export const PROJ_G_PER_S = PROJ_G_PER_DAY / 86400;

let ranMs = 0;
let since: number | null = null;
let started = false;

function clockStart() {
  if (started || typeof document === "undefined") return;
  started = true;
  if (!document.hidden) since = performance.now();
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && since !== null) {
      ranMs += performance.now() - since;
      since = null;
    } else if (!document.hidden && since === null) since = performance.now();
  });
}
clockStart();

/** Grams the Year-1 riders would have avoided while this page was open and visible. */
export function projectedG() {
  clockStart();
  return ((ranMs + (since === null ? 0 : performance.now() - since)) / 1000) * PROJ_G_PER_S;
}

/** Grams at which the footer jar is full (0 until the jar has measured itself). */
let jarFullG = 0;
export const getJarFullG = () => jarFullG;
export const setJarFullG = (g: number) => void (jarFullG = g);
