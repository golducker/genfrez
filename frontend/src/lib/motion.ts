import type Lenis from "lenis";

/* Shared handle on the smooth scroller, so links and the intro can drive it. */
let lenis: Lenis | null = null;
export const setLenis = (l: Lenis | null) => (lenis = l);
export const getLenis = () => lenis;

export const reducedMotion = () => typeof window !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;
export const finePointer = () => typeof window !== "undefined" && matchMedia("(hover: hover) and (pointer: fine)").matches;

/** Smooth-scroll to an element id, leaving room for the sticky nav. */
export function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return false;
  if (lenis) lenis.scrollTo(el, { offset: -88, duration: 1.4 });
  else el.scrollIntoView({ behavior: reducedMotion() ? "auto" : "smooth" });
  return true;
}
