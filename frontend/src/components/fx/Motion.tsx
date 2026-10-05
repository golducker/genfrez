"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { setLenis, scrollToId, reducedMotion } from "@/lib/motion";
import { subscribeFlow } from "@/lib/flow";
import { play } from "@/lib/sfx";

gsap.registerPlugin(ScrollTrigger);

/*
 * Scroll engine for the one-page site. Lenis smooths the wheel, GSAP ScrollTrigger runs everything
 * that reacts to scroll. Markup opts in with data attributes, so sections stay server components:
 *   data-reveal="up|scale|left|right|fade|pop|clip"  element eases in once when it enters
 *   data-stagger                                    direct children ease in one after another
 *   data-split                                      .split-i words rise out of a mask (see Split)
 *   data-scrub                                      .split-i words light up while you scroll past
 *   data-speed="0.3"                                parallax drift, positive = slower than the page
 *   data-count="13667" data-sep="." data-decimals   number counts up from zero (stops if data-live is set)
 *   .seg                                            segmented bars fill block by block
 * The hidden start states live in globals.css under html.motion, which an inline script sets before
 * first paint. With reduced motion none of this runs and everything is simply visible. If the page
 * took so long to hydrate that the head script's failsafe already dropped html.motion, content is
 * left visible rather than hidden again and replayed.
 * Split headings start at clamp(top 90%), so the footer wordmark at the very bottom of the page
 * still fires on a phone where the scroll cannot reach its normal start point. The other entrances
 * keep plain starts: a clamped start of 0 never fires at scroll position 0, which would leave the
 * hero's points card at 0 until the first scroll.
 * The effect re-runs on every route change, so a client-side navigation back to / (from the 404
 * page, say) wires up the new page instead of leaving it hidden.
 */

const FROM: Record<string, gsap.TweenVars> = {
  up: { y: 56, opacity: 0, filter: "blur(8px)" },
  scale: { y: 30, scale: 0.92, opacity: 0, filter: "blur(6px)" },
  left: { x: -80, opacity: 0, filter: "blur(6px)" },
  right: { x: 80, opacity: 0, filter: "blur(6px)" },
  fade: { opacity: 0 },
  pop: { scale: 0.4, rotate: -12, opacity: 0 },
  clip: { clipPath: "inset(100% 0% 0% 0% round 28px)", opacity: 1 },
};

function fmt(v: number, decimals: number, sep: string, dec: string) {
  const [i, f] = v.toFixed(decimals).split(".");
  return i.replace(/\B(?=(\d{3})+(?!\d))/g, sep) + (f ? dec + f : "");
}

/** One-shot entrances: reveals, staggers, split headings, count-ups and segment bars. */
function entrances(root: HTMLElement) {
  // Single reveals, batched so things entering together cascade.
  const groups = new Map<string, HTMLElement[]>();
  gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
    const k = el.dataset.reveal || "up";
    gsap.set(el, FROM[k] ?? FROM.up);
    groups.set(k, [...(groups.get(k) ?? []), el]);
  });
  groups.forEach((els, k) => {
    ScrollTrigger.batch(els, {
      start: "top 88%",
      once: true,
      onEnter: (batch) =>
        gsap.to(batch, {
          x: 0,
          y: 0,
          scale: 1,
          rotate: 0,
          opacity: 1,
          filter: "blur(0px)",
          ...(k === "clip" ? { clipPath: "inset(0% 0% 0% 0% round 28px)" } : {}),
          duration: k === "pop" ? 0.9 : 1.15,
          ease: k === "pop" ? "back.out(2.2)" : "expo.out",
          stagger: 0.09,
          onComplete() {
            (batch as HTMLElement[]).forEach((el) => el.classList.add("is-in"));
            gsap.set(batch, { clearProps: "transform,filter,opacity,clipPath" });
          },
        }),
    });
  });

  gsap.utils.toArray<HTMLElement>("[data-stagger]").forEach((group) => {
    const kids = [...group.children] as HTMLElement[];
    gsap.set(kids, { y: 48, opacity: 0, filter: "blur(6px)" });
    ScrollTrigger.create({
      trigger: group,
      start: "top 86%",
      once: true,
      onEnter: () =>
        gsap.to(kids, {
          y: 0,
          opacity: 1,
          filter: "blur(0px)",
          duration: 1.1,
          ease: "expo.out",
          stagger: 0.08,
          onComplete() {
            group.classList.add("is-in");
            gsap.set(kids, { clearProps: "transform,filter,opacity" });
          },
        }),
    });
  });

  gsap.utils.toArray<HTMLElement>("[data-split]").forEach((el) => {
    const words = el.querySelectorAll(".split-i");
    // y: 0 first, or GSAP folds the CSS start offset into y and the words never come home.
    gsap.set(words, { y: 0, yPercent: 115, rotate: 6 });
    ScrollTrigger.create({
      trigger: el,
      start: "clamp(top 90%)",
      once: true,
      onEnter: () =>
        gsap.to(words, {
          yPercent: 0,
          rotate: 0,
          duration: 1.15,
          ease: "expo.out",
          stagger: 0.055,
          onComplete: () => el.classList.add("is-in"),
        }),
    });
  });

  gsap.utils.toArray<HTMLElement>("[data-count]").forEach((el) => {
    const target = parseFloat(el.dataset.count || "0");
    const decimals = parseInt(el.dataset.decimals || "0", 10);
    const sep = el.dataset.sep ?? ",";
    const dec = el.dataset.dec ?? ".";
    const o = { v: 0 };
    el.textContent = fmt(0, decimals, sep, dec);
    ScrollTrigger.create({
      trigger: el,
      start: "top 92%",
      once: true,
      onEnter: () =>
        gsap.to(o, {
          v: target,
          duration: el.dataset.duration ? parseFloat(el.dataset.duration) : 1.8,
          // "hero" waits for the opening curtain and the hero entrance to finish.
          // Counted from page load, so it only waits when the figure is on screen from the start.
          delay: el.dataset.delay === "hero" ? Math.max(0, (root.classList.contains("no-intro") ? 0.6 : 2.1) - performance.now() / 1000) : parseFloat(el.dataset.delay || "0"),
          ease: "power3.out",
          // A component that takes the figure over (the hero card's hold-to-ride) sets data-live.
          onUpdate() {
            if (el.dataset.live) return void this.kill();
            el.textContent = fmt(o.v, decimals, sep, dec);
          },
        }),
    });
  });

  ScrollTrigger.batch(".seg", { start: "top 92%", once: true, onEnter: (b) => b.forEach((el) => el.classList.add("seg-in")) });
}

/** Scroll-linked effects that only move things, never hide them. */
function drifts() {
  gsap.utils.toArray<HTMLElement>("[data-scrub]").forEach((el) => {
    gsap.fromTo(
      el.querySelectorAll(".split-i"),
      { opacity: 0.16 },
      { opacity: 1, ease: "none", stagger: 0.1, scrollTrigger: { trigger: el, start: "clamp(top 82%)", end: "clamp(bottom 50%)", scrub: 0.6 } }
    );
  });

  gsap.utils.toArray<HTMLElement>("[data-speed]").forEach((el) => {
    const s = parseFloat(el.dataset.speed || "0.2");
    gsap.fromTo(el, { y: -s * 120 }, { y: s * 120, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } });
  });

  // Hero copy drifts up and softens as the page leaves it. data-hero-out="wide" only drifts on wide
  // screens: on phones the hero card sits below the fold and has to stay solid to be played with.
  const hero = document.querySelector<HTMLElement>("[data-hero]");
  if (hero) {
    const wide = matchMedia("(min-width: 1024px)").matches;
    gsap.to(gsap.utils.toArray<HTMLElement>("[data-hero-out]", hero).filter((el) => wide || el.dataset.heroOut !== "wide"), {
      y: (i) => -80 - i * 40,
      opacity: 0.2,
      ease: "none",
      scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true },
    });
  }
}

export default function Motion() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    const still = reducedMotion();
    const late = !still && !root.classList.contains("motion");

    // Same-page anchor links glide instead of jumping. This listens in the capture phase so it runs
    // before React's delegated handlers: Next's <Link> then sees defaultPrevented and leaves the
    // scroll to Lenis. scrollToId also moves keyboard focus to the target (the skip link relies on it).
    function onClick(e: MouseEvent) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest<HTMLAnchorElement>("a[href*='#']");
      if (!a || a.target === "_blank") return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || url.pathname !== location.pathname || !url.hash) return;
      if (scrollToId(decodeURIComponent(url.hash.slice(1)))) {
        e.preventDefault();
        history.replaceState(history.state, "", url.hash);
      }
    }
    document.addEventListener("click", onClick, true);

    // A soft chime when the page flows into a new part. Silent until the visitor has clicked once.
    let first = true;
    let lastChime = 0;
    const offFlow = subscribeFlow(() => {
      if (first) return void (first = false);
      const now = performance.now();
      if (now - lastChime > 1400) play("chime");
      lastChime = now;
    });

    if (still) {
      root.classList.remove("motion");
      return () => {
        document.removeEventListener("click", onClick, true);
        offFlow();
      };
    }

    const lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 1, smoothWheel: true, prevent: (n) => !!n.closest?.("[data-lenis-prevent]") });
    setLenis(lenis);
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (t: number) => lenis.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    const ctx = gsap.context(() => {
      if (!late) entrances(root);
      drifts();
    });

    // Sections change height as images, fonts and the demo load.
    let t = 0;
    const ro = new ResizeObserver(() => {
      clearTimeout(t);
      t = window.setTimeout(() => ScrollTrigger.refresh(), 200);
    });
    ro.observe(document.body);

    (window as unknown as { __fxReady?: boolean }).__fxReady = true;

    // Arriving with a hash (e.g. /about redirects to /#about): land on it after layout settles.
    let hashTimer = 0;
    if (location.hash) {
      const id = decodeURIComponent(location.hash.slice(1));
      hashTimer = window.setTimeout(() => {
        const el = document.getElementById(id);
        if (el) lenis.scrollTo(el, { immediate: true });
      }, 60);
    }

    return () => {
      document.removeEventListener("click", onClick, true);
      offFlow();
      ro.disconnect();
      clearTimeout(t);
      clearTimeout(hashTimer);
      ctx.revert();
      gsap.ticker.remove(tick);
      lenis.destroy();
      setLenis(null);
    };
  }, [pathname]);

  return null;
}
