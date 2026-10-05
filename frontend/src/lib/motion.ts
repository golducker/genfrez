import type Lenis from "lenis";

/* Shared handle on the smooth scroller, so links and the intro can drive it. */
let lenis: Lenis | null = null;
export const setLenis = (l: Lenis | null) => (lenis = l);
export const getLenis = () => lenis;

export const reducedMotion = () => typeof window !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;
export const finePointer = () => typeof window !== "undefined" && matchMedia("(hover: hover) and (pointer: fine)").matches;

/**
 * Smooth-scroll to an element id and move keyboard focus there. Room for the sticky nav comes from
 * each section's scroll-margin-top (scroll-mt-24), which Lenis honours just like a native jump.
 * Cancelling the native jump would otherwise leave focus behind (a skip link that skips nothing).
 */
export function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return false;
  if (lenis) lenis.scrollTo(el, { duration: 1.4 });
  else el.scrollIntoView({ behavior: reducedMotion() ? "auto" : "smooth" });
  if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "-1");
  el.focus({ preventScroll: true });
  return true;
}
