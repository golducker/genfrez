"use client";

import { useEffect, useRef } from "react";
import { setFlowSection, type FlowId } from "@/lib/flow";

/*
 * One continuous background for the one-page site. Each part declares data-flow="<id>" and its
 * colour lives in the --flow-<id> token (light and dark). As the next part's top rises from the
 * bottom of the screen to 30% from the top, its colour blooms out of a soft-edged circle; when the
 * circle covers the screen the base colour switches, so there is never a seam.
 */
const ease = (t: number) => t * t * (3 - 2 * t);

export default function FlowCanvas() {
  const bg = useRef<HTMLDivElement>(null);
  const bloom = useRef<HTMLDivElement>(null);
  const route = useRef<HTMLDivElement>(null);
  const fill = useRef<HTMLElement>(null);

  useEffect(() => {
    const parts = [...document.querySelectorAll<HTMLElement>("[data-flow]")];
    if (!parts.length || !bg.current || !bloom.current || !route.current || !fill.current) return;
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const stops = parts.map(() => route.current!.appendChild(document.createElement("b")));
    let raf = 0;

    function placeStops() {
      const total = document.documentElement.scrollHeight - innerHeight;
      parts.forEach((p, i) => (stops[i].style.top = `${Math.min(100, (p.offsetTop / total) * 100)}%`));
    }

    function frame() {
      raf = 0;
      const y = scrollY;
      const vh = innerHeight;
      let cur = 0;
      parts.forEach((p, i) => {
        if (y + vh * 0.3 >= p.offsetTop) cur = i;
      });
      const next = parts[cur + 1];
      const t = next ? Math.min(1, Math.max(0, (y + vh - next.offsetTop) / (vh * 0.7))) : 0;

      bg.current!.style.background = `var(--flow-${parts[cur].dataset.flow})`;
      if (next && t > 0 && !still) {
        const c = `var(--flow-${next.dataset.flow})`;
        const r = ease(t) * 150;
        bloom.current!.style.background = `radial-gradient(circle at 70% 85%, ${c} 0%, ${c} ${r}%, transparent ${r + 35}%)`;
      } else {
        bloom.current!.style.background = "none";
      }

      const total = document.documentElement.scrollHeight - vh;
      fill.current!.style.height = `${total > 0 ? (y / total) * 100 : 0}%`;
      stops.forEach((b, i) => b.classList.toggle("on", i <= cur));
      setFlowSection(parts[cur].dataset.flow as FlowId);
    }

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(frame);
    };
    const onResize = () => {
      placeStops();
      frame();
    };
    // Section heights change as images and fonts load.
    const ro = new ResizeObserver(onResize);
    ro.observe(document.body);
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onResize);
    onResize();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", onResize);
      stops.forEach((b) => b.remove());
    };
  }, []);

  return (
    <>
      <div ref={bg} aria-hidden="true" className="flow-layer" style={{ zIndex: -2 }} />
      <div ref={bloom} aria-hidden="true" className="flow-layer" style={{ zIndex: -1 }} />
      <div ref={route} aria-hidden="true" className="flow-route">
        <i ref={fill} />
      </div>
    </>
  );
}
