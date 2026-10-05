"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import Logo from "./Logo";
import Icon from "./Icon";
import SegBar from "./SegBar";
import { burst } from "./ClickFx";
import { play } from "@/lib/sfx";
import { finePointer, reducedMotion } from "@/lib/motion";
import { appNum, avoidedG, enNum, tripPoints } from "@/lib/points";

/*
 * The hero's points card, playable. Tèo (a demo user) is 1,333 points short of Gold. Holding the
 * button rides Bus 08 to class, day by day through one semester: every trip lands +5.7 points from
 * the published formula, the bar fills, the CO₂ readout climbs. At 15,000 the card flips over into a
 * holographic Gold card and a voucher slides out. One click or Enter rides the whole semester.
 *
 * All the per-frame numbers are written to textContent; React state only changes on press,
 * release and finish. The SSR markup is the finished idle card, so the card is never empty.
 */

const START = 13667;
const GOAL = 15000;
const KM = 5;
const PER_TRIP = tripPoints(KM, "bus"); // 5.7
const TRIPS = Math.ceil((GOAL - START) / PER_TRIP); // 234 trips
const DAYS = TRIPS / 2; // 117 school days, there and back
const G_PER_TRIP = avoidedG(KM, 0); // 475 g
const KG = Math.floor((TRIPS * G_PER_TRIP) / 1000); // 111 kg
const SEGS = 24;

// Spring semester 2026, Monday to Friday, with the Tết week off.
const SCHOOL_DAYS = (() => {
  const WD = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const MO = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const tet = [Date.UTC(2026, 1, 16), Date.UTC(2026, 1, 20)];
  const out: string[] = [];
  const d = new Date(Date.UTC(2026, 0, 5));
  while (out.length < DAYS) {
    const wd = d.getUTCDay();
    const t = d.getTime();
    if (wd > 0 && wd < 6 && (t < tet[0] || t > tet[1])) out.push(`${WD[wd]} ${d.getUTCDate()} ${MO[d.getUTCMonth()]}`);
    d.setUTCDate(d.getUTCDate() + 1);
  }
  return out;
})();

type Phase = "idle" | "riding" | "paused" | "gold";

const srIdle = `Tèo has ${enNum(START)} of ${enNum(GOAL)} points. ${enNum(GOAL - START)} more points unlock Gold.`;

export default function PointsCardPlay({ children }: { children?: React.ReactNode }) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [daysLeft, setDaysLeft] = useState(DAYS);
  const [sr, setSr] = useState(srIdle);

  const root = useRef<HTMLDivElement>(null);
  const tilt = useRef<HTMLDivElement>(null);
  const btn = useRef<HTMLButtonElement>(null);
  const back = useRef<HTMLButtonElement>(null);
  const api = useRef<{ go: (auto: boolean) => void; stop: () => void; flipBack: () => void } | null>(null);
  const press = useRef({ at: 0, released: 0 });
  const focusBack = useRef(false);
  const focusFront = useRef(false);
  const gyro = useRef<"no" | "asked" | "ok">("no");

  useEffect(() => {
    const el = root.current!;
    const q = <T extends Element>(s: string) => el.querySelector<T>(s)!;
    const count = q<HTMLElement>("[data-count]");
    const pop = q<HTMLElement>(".gold-pop");
    const left = q<HTMLElement>(".gold-left");
    const dayEl = q<HTMLElement>(".gold-day");
    const dateEl = q<HTMLElement>(".gold-date");
    const co2 = q<HTMLElement>(".gold-co2");
    const fill = q<HTMLElement>(".gold-hold");
    const road = q<HTMLElement>(".gold-road");
    const bus = q<HTMLElement>(".gold-road > i");
    const segs = [...el.querySelectorAll<HTMLElement>(".gold-front .seg > i")];
    const still = reducedMotion();

    const o = { trips: 0 };
    let shown = -1;
    let day = 0;
    let lastTick = 0;
    let phaseNow: Phase = "idle";
    let auto = false;
    let ramp: gsap.core.Tween | null = null;
    const timers: number[] = [];
    const set = (p: Phase) => {
      phaseNow = p;
      setPhase(p);
    };

    function render() {
      const n = Math.min(TRIPS, Math.floor(o.trips));
      if (n === shown) return;
      shown = n;
      const total = START + n * PER_TRIP;
      count.textContent = appNum(Math.floor(total + 1e-6));
      left.textContent = `${appNum(Math.max(0, Math.ceil(GOAL - total - 1e-6)))} more points`;
      // The last block only lights when Gold is actually reached.
      const lit = n >= TRIPS ? SEGS : Math.min(SEGS - 1, Math.round((total / GOAL) * SEGS));
      segs.forEach((s, i) => {
        s.classList.toggle("warn", i < lit);
        s.classList.toggle("charge", i === lit && n > 0 && n < TRIPS);
      });
      const d = Math.ceil(n / 2);
      const g = n * G_PER_TRIP;
      dayEl.textContent = String(Math.max(1, d));
      co2.textContent = g < 1000 ? `${g} g` : `${Math.floor(g / 1000)} kg`;
      fill.style.setProperty("--p", (n / TRIPS).toFixed(3));

      // Feedback is rate-limited to about 12 a second, however fast the trips land.
      const now = performance.now();
      if (n > 0 && now - lastTick > 83) {
        lastTick = now;
        play("trip", { value: n / TRIPS });
        if (!still) pop.animate([{ opacity: 0, transform: "translateY(8px)" }, { opacity: 1, transform: "translateY(-6px)", offset: 0.35 }, { opacity: 0, transform: "translateY(-16px)" }], { duration: 520, easing: "cubic-bezier(.2,.8,.2,1)" });
        if (d !== day && !still) dateEl.animate([{ transform: "rotateX(70deg)", opacity: 0.2 }, { transform: "none", opacity: 1 }], { duration: 160, easing: "ease-out" });
      }
      if (d !== day) {
        day = d;
        dateEl.textContent = SCHOOL_DAYS[Math.max(0, d - 1)];
      }
    }

    const tl = gsap.timeline({ paused: true, onUpdate: render, onComplete: finish });
    // Nominal 6.2 s; the hold ramps timeScale from 0.8 up to 2.4, which lands Gold in about 3.5 s.
    tl.to(o, { trips: TRIPS, duration: 6.2, ease: "none" });
    const loop = gsap.fromTo(bus, { x: -30 }, { x: () => road.clientWidth + 6, duration: 1.2, ease: "none", repeat: -1, paused: true });

    function go(isAuto: boolean) {
      if (phaseNow === "gold") return;
      if (isAuto) auto = true;
      if (phaseNow === "riding") return;
      // Take the figure over from the scroll engine's intro count-up.
      count.dataset.live = "1";
      if (still) {
        o.trips = TRIPS;
        render();
        return finish();
      }
      render();
      ramp?.kill();
      tl.timeScale(0.8).play();
      loop.timeScale(1).play();
      ramp = gsap.to([tl, loop], { timeScale: (i: number) => (i ? 2.2 : 2.4), duration: 1.4, ease: "power2.in" });
      set("riding");
    }

    function stop() {
      if (auto || phaseNow !== "riding") return;
      ramp?.kill();
      ramp = gsap.to([tl, loop], {
        timeScale: 0.001,
        duration: 0.25,
        ease: "power2.out",
        onComplete() {
          tl.pause();
          loop.pause();
          // Read once the bus has come to rest, so the label matches the day on the card.
          const left = DAYS - day;
          setDaysLeft(left);
          setSr(`Day ${day} of ${DAYS}. ${enNum(Math.floor(START + shown * PER_TRIP))} points. ${left} school days left to Gold.`);
        },
      });
      set("paused");
    }

    function finish() {
      ramp?.kill();
      loop.pause();
      auto = false;
      focusBack.current = document.activeElement === btn.current;
      set("gold");
      setSr(`Gold unlocked. One semester of Bus 08 to class avoided ${KG} kg of CO₂. Voucher: bubble tea 20% off.`);
      play("hook");
      const b = tilt.current!.getBoundingClientRect();
      // Mid-flip, when the card is edge-on, leaves burst out of it.
      timers.push(
        window.setTimeout(() => {
          burst(b.left + b.width / 2, b.top + b.height / 2, 22, 1.4);
          burst(b.left + b.width * 0.2, b.top + b.height * 0.85, 10, 0.8);
          burst(b.left + b.width * 0.85, b.top + b.height * 0.2, 10, 0.8);
        }, 380)
      );
    }

    function flipBack() {
      if (phaseNow !== "gold") return;
      focusFront.current = document.activeElement === back.current;
      // The front faces away while the card turns back, so it resets out of sight.
      tl.pause(0);
      loop.pause(0);
      o.trips = 0;
      shown = -1;
      day = 0;
      lastTick = performance.now();
      render();
      segs.forEach((s) => s.classList.remove("charge"));
      dateEl.textContent = SCHOOL_DAYS[0];
      setDaysLeft(DAYS);
      setSr(srIdle);
      set("idle");
      play("whoosh");
    }

    api.current = { go, stop, flipBack };

    // The foil's slow shimmer and the tilt listener only run while the card is on screen.
    const io = new IntersectionObserver(([e]) => el.classList.toggle("is-off", !e.isIntersecting));
    io.observe(el);

    return () => {
      api.current = null;
      io.disconnect();
      timers.forEach(clearTimeout);
      ramp?.kill();
      tl.kill();
      loop.kill();
    };
  }, []);

  // Phones: the Gold foil follows the tilt of the device once the visitor has allowed it.
  useEffect(() => {
    const card = tilt.current!;
    // Keyboard focus follows the face that is showing.
    if (phase === "idle" && focusFront.current) btn.current?.focus({ preventScroll: true });
    focusFront.current = false;
    if (phase !== "gold") return;
    if (focusBack.current) back.current?.focus({ preventScroll: true });
    focusBack.current = false;
    if (gyro.current !== "ok" || reducedMotion()) return;
    let raf = 0;
    let mx = 0.5,
      my = 0.5;
    const el = root.current!;
    function on(e: DeviceOrientationEvent) {
      if (e.gamma == null || e.beta == null || el.classList.contains("is-off")) return;
      mx = Math.min(1, Math.max(0, (e.gamma + 30) / 60));
      my = Math.min(1, Math.max(0, (e.beta - 15) / 60));
      if (!raf)
        raf = requestAnimationFrame(() => {
          raf = 0;
          el.classList.add("gyro");
          card.style.setProperty("--mx", mx.toFixed(3));
          card.style.setProperty("--my", my.toFixed(3));
        });
    }
    addEventListener("deviceorientation", on);
    return () => {
      removeEventListener("deviceorientation", on);
      cancelAnimationFrame(raf);
      el.classList.remove("gyro");
    };
  }, [phase]);

  // iOS asks for motion access, and only from a tap; everywhere else the events just arrive.
  function askGyro() {
    if (gyro.current !== "no" || finePointer()) return;
    gyro.current = "asked";
    const D = (window as unknown as { DeviceOrientationEvent?: { requestPermission?: () => Promise<string> } }).DeviceOrientationEvent;
    if (!D) return;
    if (typeof D.requestPermission !== "function") return void (gyro.current = "ok");
    D.requestPermission()
      .then((r) => void (gyro.current = r === "granted" ? "ok" : "asked"))
      .catch(() => {});
  }

  function down() {
    press.current.at = performance.now();
    api.current?.go(false);
  }
  // A quick press counts as a click: ride the whole semester. A long one stops where it was let go.
  function up() {
    const now = performance.now();
    press.current.released = now;
    askGyro();
    if (now - press.current.at < 280) api.current?.go(true);
    else api.current?.stop();
  }
  const isKey = (k: string) => k === " " || k === "Enter";

  const gold = phase === "gold";
  const label = phase === "riding" ? "Riding Bus 08 to class" : phase === "paused" ? `Keep going: ${daysLeft} days left` : "Hold to ride Bus 08 to class";

  return (
    <div ref={root} data-hero-out="wide" className={`gold-play is-${phase} relative mx-auto w-full max-w-[420px] pt-6 sm:pt-10 pb-36`}>
      <div className="points-card-in">
        {/* Slides out from under the card once Gold is reached */}
        <div className="gold-voucher" aria-hidden="true">
          <span className="gold-voucher-stub">
            <Icon name="ticket" size={18} />
          </span>
          <span className="grid">
            <span className="t-label !text-[10px] !text-[#6b4a07]">Gold reward · demo</span>
            <b className="text-[17px] leading-tight">Bubble tea −20%</b>
          </span>
        </div>

        {/* While Gold shows, a click anywhere on the card turns it back. Chrome hit-tests a tilted 3D
            card unreliably, so the wrapper listens; the back face is the keyboard control. */}
        <div
          ref={tilt}
          data-tilt="10"
          className="points-card"
          onClick={(e) => {
            if (!(e.target as Element).closest(".gold-hold")) api.current?.flipBack();
          }}
        >
          <div className="gold-flip">
            <div className="gold-front tone-navy card p-5 sm:p-8 rounded-[32px]" inert={gold} role="group" aria-label="Demo points card for Tèo, a sample user">
              <p className="flex items-center gap-2.5 text-[15px] font-semibold text-text-secondary">
                Hello, Tèo! <span className="gold-tag">Demo user</span>
              </p>
              <p className="mt-4 sm:mt-5 t-label">My points</p>
              <p className="sr-only">{sr}</p>
              <p className="mt-1 t-display text-[44px] sm:text-[56px] whitespace-nowrap" aria-hidden="true">
                <span className="relative inline-block">
                  <span className="tabular-nums" data-count={START} data-sep="." data-delay="hero" data-duration="2.2">
                    {appNum(START)}
                  </span>
                  <span className="gold-pop">+{appNum(PER_TRIP, 1)}</span>
                </span>
                <span className="text-[18px] sm:text-[20px] text-text-secondary font-bold"> / {appNum(GOAL)}</span>
              </p>
              <div className="mt-4" aria-hidden="true">
                <SegBar value={START / GOAL} segments={SEGS} tone="warn" height={10} />
              </div>
              <p className="mt-4 text-[15px] text-text-primary" aria-hidden="true">
                <span className="gold-left font-bold text-accent-text">{appNum(GOAL - START)} more points</span> and Gold is yours!
              </p>

              <button
                ref={btn}
                type="button"
                className="gold-hold mt-5"
                data-sfx="own"
                aria-describedby="gold-hint"
                onPointerDown={(e) => {
                  if (e.button !== 0) return;
                  e.currentTarget.setPointerCapture(e.pointerId);
                  down();
                }}
                onPointerUp={up}
                onPointerCancel={() => api.current?.stop()}
                onKeyDown={(e) => {
                  if (!isKey(e.key)) return;
                  e.preventDefault();
                  if (!e.repeat) down();
                }}
                onKeyUp={(e) => {
                  if (!isKey(e.key)) return;
                  e.preventDefault();
                  up();
                }}
                // Screen readers and switch access send a bare click: ride the whole semester.
                onClick={() => {
                  if (performance.now() - press.current.released > 400) api.current?.go(true);
                }}
                onContextMenu={(e) => e.preventDefault()}
              >
                <span className="gold-hold-icon" aria-hidden="true">
                  <Icon name="bus" size={17} />
                </span>
                <span className="relative">{label}</span>
              </button>
              <span id="gold-hint" className="sr-only">
                Hold to ride one school day at a time, or press once to ride the whole semester.
              </span>

              <div className="gold-tray mt-4" aria-hidden="true">
                <div className="gold-tabs grid grid-cols-3 gap-2">
                  {["Missions", "Vouchers", "Scan"].map((k) => (
                    <span key={k} className="rounded-2xl bg-surface-raised px-2 py-2.5 text-center text-[13px] font-bold text-text-display">
                      {k}
                    </span>
                  ))}
                </div>
                <div className="gold-ride">
                  <span>
                    <span className="t-label block">
                      Day <span className="gold-day">1</span> of {DAYS}
                    </span>
                    <b className="gold-date">{SCHOOL_DAYS[0]}</b>
                  </span>
                  <span className="text-right">
                    <span className="t-label block">CO₂ avoided</span>
                    <b className="gold-co2">0 g</b>
                  </span>
                </div>
              </div>
              <div className="gold-road" aria-hidden="true">
                <i>
                  <Icon name="bus" size={12} />
                </i>
              </div>
            </div>

            <button
              ref={back}
              type="button"
              className="gold-back"
              inert={!gold}
              data-sfx="own"
              data-cursor="Flip"
              aria-label="Gold card, Tèo, member since 2026. Flip back to ride again."
            >
              <span className="gold-foil" aria-hidden="true" />
              <span className="gold-sheen" aria-hidden="true" />
              <span className="gold-back-in" aria-hidden="true">
                <span className="flex items-center gap-2">
                  <Logo size={34} className="block rounded-full" />
                  <span className="text-[15px] font-extrabold tracking-[-0.02em]">GenFreZ</span>
                  <span className="gold-back-tag">Demo</span>
                </span>
                <span className="gold-word">GOLD</span>
                <span className="flex items-end justify-between gap-3">
                  <span className="grid">
                    <span className="text-[26px] font-extrabold leading-none tracking-[-0.02em]">Tèo</span>
                    <span className="mt-1.5 text-[11.5px] font-bold uppercase tracking-[0.12em] opacity-80">Member since 2026</span>
                  </span>
                  <span className="text-right">
                    <span className="block text-[11px] font-bold uppercase tracking-[0.12em] opacity-80">Points</span>
                    <span className="text-[20px] font-extrabold tabular-nums">{appNum(GOAL)}</span>
                  </span>
                </span>
              </span>
            </button>
          </div>
        </div>
      </div>

      <p className="gold-caption" aria-hidden={!gold}>
        One semester of Bus 08 to class{" "}
        <span className="whitespace-nowrap">
          = <b>{KG} kg CO₂</b> = Gold.
        </span>
        <span className="block t-caption mt-1">
          <span className="gold-touch">Tap</span>
          <span className="gold-mouse">Click</span> the card to ride again.
        </span>
      </p>
      <p className="sr-only" aria-live="polite">
        {phase === "paused" || gold ? sr : ""}
      </p>

      {children}
    </div>
  );
}
