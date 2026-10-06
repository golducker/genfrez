"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { reducedMotion } from "@/lib/motion";
import { clang } from "@/lib/sfx-route";
import { burst } from "../ClickFx";

gsap.registerPlugin(ScrollTrigger);

/*
 * Street signs come alive: the pole rises, the plate swings out from it on its clamps and settles
 * with a wobble and a clang, then a glint runs across the reflective face. Hovering wobbles the plate,
 * clicking spins it right round the pole. The cursor drags a sheen across the face.
 */
export default function RouteFx() {
  useEffect(() => {
    const root = document.documentElement;
    const signs = gsap.utils.toArray<HTMLElement>("[data-sign]");
    const still = reducedMotion();
    const late = !root.classList.contains("motion");

    const restart = (s: HTMLElement, cls: string) => {
      s.classList.remove(cls);
      void s.offsetWidth;
      s.classList.add(cls);
    };
    const onEnter = (e: PointerEvent) => {
      const s = e.currentTarget as HTMLElement;
      if (!s.classList.contains("rs-ready") || s.classList.contains("rs-spin")) return;
      restart(s, "rs-wobble");
      clang(true);
    };
    const onMove = (e: PointerEvent) => {
      const p = (e.currentTarget as HTMLElement).querySelector<HTMLElement>(".rs-plate");
      if (!p) return;
      const b = p.getBoundingClientRect();
      p.style.setProperty("--gx", `${e.clientX - b.left}px`);
      p.style.setProperty("--gy", `${e.clientY - b.top}px`);
    };
    const onClick = (e: MouseEvent) => {
      const s = e.currentTarget as HTMLElement;
      s.classList.remove("rs-wobble");
      restart(s, "rs-spin");
      clang(false, true);
      burst(e.clientX, e.clientY, 9, 0.6);
    };
    // Only the plate's own wobble or spin ends the state; the glint's animationend bubbles up too.
    const onEnd = (e: AnimationEvent) => {
      if (e.animationName === "rs-wobble" || e.animationName === "rs-spin") (e.currentTarget as HTMLElement).classList.remove("rs-wobble", "rs-spin");
    };

    signs.forEach((s) => {
      s.addEventListener("pointerenter", onEnter);
      s.addEventListener("pointermove", onMove);
      s.addEventListener("click", onClick);
      s.addEventListener("animationend", onEnd);
    });

    let ctx: gsap.Context | null = null;
    if (still || late) {
      signs.forEach((s) => s.classList.add("rs-ready"));
    } else {
      ctx = gsap.context(() => {
        signs.forEach((s) => {
          const sw = s.querySelector(".rs-swing");
          const pole = s.querySelector(".rs-pole");
          gsap.set(sw, { rotateY: -96, opacity: 0 });
          gsap.set(pole, { scaleY: 0 });
          // The hero sign waits for the curtain and the bus, like the rest of the hero.
          const hero = s.dataset.sign === "home";
          ScrollTrigger.create({
            trigger: s,
            // The hero sign sits low in the first screen, so it starts as soon as any of it shows.
            start: hero ? "top bottom" : "top 88%",
            once: true,
            onEnter: () => {
              const delay = hero ? Math.max(0, (root.classList.contains("no-intro") ? 1.2 : 2.8) - performance.now() / 1000) : 0;
              gsap
                .timeline({ delay })
                .to(pole, { scaleY: 1, duration: 0.5, ease: "power3.out" })
                .set(sw, { opacity: 1 }, "-=0.15")
                .to(sw, { rotateY: 0, duration: 1.7, ease: "elastic.out(1.05, 0.3)" }, "<")
                .call(() => clang(true), [], "<+0.18")
                .call(() => s.classList.add("rs-shine"), [], "-=0.7")
                .call(() => {
                  s.classList.add("rs-ready");
                  gsap.set([sw, pole], { clearProps: "transform,opacity" });
                });
            },
          });
        });
      });
    }

    return () => {
      ctx?.revert();
      signs.forEach((s) => {
        s.removeEventListener("pointerenter", onEnter);
        s.removeEventListener("pointermove", onMove);
        s.removeEventListener("click", onClick);
        s.removeEventListener("animationend", onEnd);
      });
    };
  }, []);

  return null;
}
