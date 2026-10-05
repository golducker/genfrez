"use client";

import { useEffect, useRef } from "react";
import { finePointer, reducedMotion } from "@/lib/motion";
import { play } from "@/lib/sfx";

/*
 * Pointer effects for mouse and trackpad users (touch devices skip all of this):
 * - a soft ring that trails the cursor and swells over anything clickable (the system cursor stays)
 * - magnetic pull on large buttons and [data-magnetic]
 * - a light spot that follows the cursor across every .card
 * - 3D tilt on [data-tilt], which also gets --mx/--my (0..1, cursor position) for foil and glare
 * - a quiet pentatonic tick when hovering links and buttons (only after the first click unlocks audio)
 */
export default function Pointer() {
  const ring = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!finePointer()) return;
    const still = reducedMotion();
    const r = ring.current!;
    let x = innerWidth / 2,
      y = innerHeight / 2,
      rx = x,
      ry = y,
      raf = 0,
      shown = false;

    function loop() {
      rx += (x - rx) * 0.18;
      ry += (y - ry) * 0.18;
      r.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
      raf = Math.abs(x - rx) + Math.abs(y - ry) > 0.1 ? requestAnimationFrame(loop) : 0;
    }

    let magnet: HTMLElement | null = null;
    let tilt: HTMLElement | null = null;
    let hoverEl: Element | null = null;

    function onMove(e: PointerEvent) {
      if (e.pointerType !== "mouse") return;
      x = e.clientX;
      y = e.clientY;
      if (!shown) {
        shown = true;
        rx = x;
        ry = y;
        r.classList.add("on");
      }
      if (!still && !raf) raf = requestAnimationFrame(loop);
      if (still) r.style.transform = `translate3d(${x}px, ${y}px, 0)`;

      const t = e.target as Element;

      // Spotlight on cards
      const card = t.closest?.<HTMLElement>(".card");
      if (card) {
        const b = card.getBoundingClientRect();
        card.style.setProperty("--sx", `${x - b.left}px`);
        card.style.setProperty("--sy", `${y - b.top}px`);
      }

      // Hover state + label for the ring
      const hot = t.closest?.("a, button, [role=radio], input[type=range], [data-cursor], .mascot-hit");
      if (hot !== hoverEl) {
        hoverEl = hot;
        r.classList.toggle("hot", !!hot);
        const txt = hot?.getAttribute("data-cursor") ?? "";
        r.classList.toggle("labelled", !!txt && txt !== "hide");
        r.classList.toggle("hidden", txt === "hide");
        label.current!.textContent = txt !== "hide" ? txt : "";
        if (hot && (hot.matches("a, button") || hot.classList.contains("mascot-hit"))) play("hover");
      }

      // Over the hero street's haze the ring swells into a breeze (see HazeWipe).
      r.classList.toggle("breeze", !!t.closest?.("[data-cursor-mode='breeze']"));

      if (still) return;

      // Magnetic buttons
      const m = t.closest?.<HTMLElement>(".btn-lg, [data-magnetic]") ?? null;
      if (m !== magnet) {
        if (magnet) magnet.style.translate = "";
        magnet = m;
      }
      if (m) {
        const b = m.getBoundingClientRect();
        const dx = (x - (b.left + b.width / 2)) * 0.22;
        const dy = (y - (b.top + b.height / 2)) * 0.3;
        m.style.translate = `${dx}px ${dy}px`;
      }

      // Tilt
      const tl = t.closest?.<HTMLElement>("[data-tilt]") ?? null;
      if (tl !== tilt) {
        if (tilt) tilt.style.transform = "";
        tilt = tl;
      }
      if (tl) {
        const b = tl.getBoundingClientRect();
        const px = (x - b.left) / b.width - 0.5;
        const py = (y - b.top) / b.height - 0.5;
        const max = parseFloat(tl.dataset.tilt || "8");
        tl.style.transform = `perspective(1000px) rotateX(${(-py * max).toFixed(2)}deg) rotateY(${(px * max).toFixed(2)}deg) translateY(-4px)`;
        tl.style.setProperty("--mx", (px + 0.5).toFixed(3));
        tl.style.setProperty("--my", (py + 0.5).toFixed(3));
      }
    }

    function hide() {
      shown = false;
      r.classList.remove("on");
    }
    const down = () => r.classList.add("press");
    const up = () => r.classList.remove("press");
    // The live demo is an iframe: the page stops getting pointer events inside it, so park the ring.
    const over = (e: PointerEvent) => (e.target as Element).tagName === "IFRAME" && hide();

    addEventListener("pointerover", over);
    addEventListener("pointermove", onMove, { passive: true });
    addEventListener("pointerdown", down);
    addEventListener("pointerup", up);
    document.documentElement.addEventListener("pointerleave", hide);
    addEventListener("blur", hide);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("pointerover", over);
      removeEventListener("pointermove", onMove);
      removeEventListener("pointerdown", down);
      removeEventListener("pointerup", up);
      document.documentElement.removeEventListener("pointerleave", hide);
      removeEventListener("blur", hide);
    };
  }, []);

  return (
    <div ref={ring} className="cursor-ring" aria-hidden="true">
      <span ref={label} />
    </div>
  );
}
