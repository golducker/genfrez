"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Icon, { type IconName } from "./Icon";
import { site } from "@/lib/site";
import { reducedMotion } from "@/lib/motion";
import { play } from "@/lib/sfx";

gsap.registerPlugin(ScrollTrigger);

/*
 * The live Mini App inside a phone, at its real size.
 *
 * The demo (golducker/Hackathon-i-Hons) draws its own 390 x 844 phone frame, centred in a page with
 * 12px side and 24px top padding. Below 640px wide it skips its own bezel. So the iframe is given the
 * viewport the app expects (414 x 892) and shifted by (-12, -24) inside a 390 x 844 window: the app's
 * phone fills the screen exactly, and our bezel wraps it. The whole device is then scaled down only
 * as far as the column and the window height require, never up.
 */
const SCREEN_W = 390;
const SCREEN_H = 844;
const PAD_X = 12;
const PAD_Y = 24;
const BEZEL = 12;
const DEVICE_W = SCREEN_W + BEZEL * 2;
const DEVICE_H = SCREEN_H + BEZEL * 2;

export type DemoScreen = { title: string; body: string; icon: IconName };

function Callout({ s, side, i }: { s: DemoScreen; side: "left" | "right"; i: number }) {
  return (
    <li data-reveal={side} className={`callout card ${side === "left" ? "lg:text-right lg:flex-row-reverse" : ""}`} style={{ "--i": i } as React.CSSProperties}>
      <span className="callout-icon" aria-hidden="true">
        <Icon name={s.icon} size={22} />
      </span>
      <span className="grid gap-1">
        <span className="text-[16px] font-extrabold text-text-display">{s.title}</span>
        <span className="text-[14px] text-text-secondary leading-snug">{s.body}</span>
      </span>
      <i className="callout-dot hidden lg:block" aria-hidden="true" />
    </li>
  );
}

export default function DemoStage({ screens }: { screens: DemoScreen[] }) {
  const col = useRef<HTMLDivElement>(null);
  const tilt = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.86);
  const [src, setSrc] = useState<string | null>(null);
  const [state, setState] = useState<"waiting" | "loading" | "ready" | "slow">("waiting");
  const [nonce, setNonce] = useState(0);

  // Fit the device to the column and the window, at most 1:1. The height comes from the root
  // element's clientHeight, which (unlike innerHeight) stays put while a mobile browser's toolbar
  // slides in and out, so the phone does not resize mid-scroll.
  useEffect(() => {
    const el = col.current!;
    const fit = () => {
      const w = el.clientWidth;
      const h = document.documentElement.clientHeight - 120;
      setScale(Math.max(0.55, Math.min(1, w / DEVICE_W, h / DEVICE_H)));
    };
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    addEventListener("resize", fit);
    fit();
    return () => {
      ro.disconnect();
      removeEventListener("resize", fit);
    };
  }, []);

  // Load the demo only when the stage gets close, so the page itself stays light.
  useEffect(() => {
    const el = col.current!;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        setSrc(site.demoUrl);
        setState("loading");
        io.disconnect();
      },
      { rootMargin: "900px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (state !== "loading") return;
    const t = setTimeout(() => setState("slow"), 9000);
    return () => clearTimeout(t);
  }, [state, nonce]);

  // The phone swings in from a tilted angle and settles flat as it reaches the middle of the screen.
  useEffect(() => {
    if (reducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        tilt.current,
        { rotateX: 26, rotateY: -18, rotateZ: 5, y: 120, scale: 0.86 },
        { rotateX: 0, rotateY: 0, rotateZ: 0, y: 0, scale: 1, ease: "none", scrollTrigger: { trigger: col.current, start: "top bottom", end: "top 18%", scrub: 0.8 } }
      );
    });
    return () => ctx.revert();
  }, []);

  function reload() {
    setState("loading");
    setNonce((n) => n + 1);
  }

  const left = screens.slice(0, Math.ceil(screens.length / 2));
  const right = screens.slice(Math.ceil(screens.length / 2));
  const loading = state === "loading" || state === "slow" || state === "waiting";

  return (
    <div className="demo-stage relative">
      <div aria-hidden="true" className="stage-glow" />
      <div aria-hidden="true" className="stage-orbit stage-orbit-1" />
      <div aria-hidden="true" className="stage-orbit stage-orbit-2" />

      <div className="relative grid gap-10 lg:gap-8 lg:grid-cols-[1fr_auto_1fr] items-center">
        <ul className="order-2 lg:order-1 grid gap-4 content-center">
          {left.map((s, i) => (
            <Callout key={s.title} s={s} side="left" i={i} />
          ))}
        </ul>

        <div ref={col} className="order-1 lg:order-2 mx-auto w-full lg:w-[414px] max-w-[414px] grid justify-items-center">
          <div style={{ width: DEVICE_W * scale, height: DEVICE_H * scale, perspective: 1600 }}>
            <div ref={tilt} className="device-tilt relative h-full w-full" style={{ transformOrigin: "50% 60%" }}>
              <div className="device absolute left-0 top-0" style={{ width: DEVICE_W, height: DEVICE_H, transform: `scale(${scale})` }}>
                <span className="device-btn device-btn-power" aria-hidden="true" />
                <span className="device-btn device-btn-vol1" aria-hidden="true" />
                <span className="device-btn device-btn-vol2" aria-hidden="true" />
                <div className="device-screen" style={{ width: SCREEN_W, height: SCREEN_H }} data-cursor="hide">
                  {src && (
                    <iframe
                      key={nonce}
                      src={src}
                      title="GenFreZ Zalo Mini App, live demo"
                      onLoad={() => setTimeout(() => setState("ready"), 350)}
                      allow="autoplay; clipboard-write"
                      style={{ position: "absolute", left: -PAD_X, top: -PAD_Y, width: SCREEN_W + PAD_X * 2, height: SCREEN_H + PAD_Y * 2, border: 0, background: "#edf3d0" }}
                    />
                  )}
                  <div className={`device-boot ${loading ? "" : "done"}`} aria-hidden={!loading}>
                    {/* eslint-disable-next-line @next/next/no-img-element -- small static brand mark */}
                    <img src="/logo.png" alt="" width={84} height={84} className="boot-logo" />
                    <div className="boot-bars">
                      <i />
                      <i />
                      <i />
                    </div>
                    <p className="text-[13px] font-bold text-[#17394a]">Waking up the Mini App…</p>
                    {state === "slow" && (
                      <a href={site.demoUrl} target="_blank" rel="noreferrer" className="text-[13px] font-bold text-[#b84a0c] underline underline-offset-4">
                        Taking a while? Open it in a new tab ↗
                      </a>
                    )}
                  </div>
                </div>
                <span className="device-island" aria-hidden="true" />
                <span className="device-glare" aria-hidden="true" />
              </div>
            </div>
          </div>

          <div className="demo-controls mt-6" role="group" aria-label="Demo controls">
            <span className="live-dot" aria-live="polite">
              <i aria-hidden="true" />
              {state === "ready" ? "Live" : "Loading"}
            </span>
            <button type="button" onClick={reload} className="demo-ctl" aria-label="Reload the demo">
              <Icon name="reload" size={16} /> Reload
            </button>
            <a href={site.demoUrl} target="_blank" rel="noreferrer" className="demo-ctl" onClick={() => play("whoosh")}>
              <Icon name="external" size={16} /> Full screen
            </a>
          </div>
        </div>

        <ul className="order-3 grid gap-4 content-center">
          {right.map((s, i) => (
            <Callout key={s.title} s={s} side="right" i={i} />
          ))}
          <li data-reveal="pop" className="hidden lg:flex items-end gap-3 pl-6">
            <span className="mascot-hit bob inline-block [--r:-6deg]">
              {/* eslint-disable-next-line @next/next/no-img-element -- pre-cut transparent PNG */}
              <img src="/mascots/blue-wave.png" alt="" width={88} height={91} draggable={false} className="mascot-img block select-none" />
            </span>
            <span className="speech">It&apos;s live. Tap around!</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
