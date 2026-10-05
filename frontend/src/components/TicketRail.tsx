"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import TicketSkyline from "./TicketSkyline";
import { getLenis, reducedMotion } from "@/lib/motion";
import { beep, stamp } from "@/lib/sfx-tickets";
import "./TicketRail.css";

gsap.registerPlugin(ScrollTrigger);

/*
 * Features as paper bus tickets that tap in at a GenFreZ gate. On a laptop the block pins and the
 * page turns sideways: each ticket passes the gate, a green scanline sweeps it, the reader beeps,
 * a VERIFIED stamp lands and the paper flips into a navy e-ticket. The benefits follow as four
 * receipts. On phones (and short laptop screens) it is a native swipe rail that snaps to each
 * ticket, and the scan plays on whichever ticket lands in the middle. With reduced motion it is a
 * plain grid of finished e-tickets (all CSS, see TicketRail.css).
 * The text lives on the e-ticket face; the paper face repeats it for the eye only (aria-hidden).
 */

export type TicketItem = { title: string; body: string };
export type Receipt = { who: string; title: string; body: string; line: string; value: string };

// Desktop pin needs room for a whole ticket under the nav. Shorter screens get the swipe rail.
const PIN = "(min-width: 1024px) and (min-height: 700px)";

const pad = (n: number) => String(n).padStart(2, "0");

/** A 21x21 QR-looking grid hashed from the title: three finder squares, the rest seeded noise. */
function qrPath(seedText: string) {
  let s = 7;
  for (const ch of seedText) s = (s * 31 + ch.charCodeAt(0)) % 2147483647;
  s = s || 1;
  const R = () => (s = (s * 16807) % 2147483647) / 2147483647;
  let d = "";
  for (let y = 0; y < 21; y++)
    for (let x = 0; x < 21; x++) {
      const finder = (x < 7 && y < 7) || (x > 13 && y < 7) || (x < 7 && y > 13);
      let on: boolean;
      if (finder) {
        const fx = x % 14,
          fy = y % 14;
        on = fx === 0 || fx === 6 || fy === 0 || fy === 6 || (fx > 1 && fx < 5 && fy > 1 && fy < 5);
      } else on = !(x === 7 || y === 7 || x === 13 || y === 13) && R() < 0.5;
      if (on) d += `M${x} ${y}h1v1h-1z`;
    }
  return d;
}

/** One ticket's tap-in: scanline, beep, stamp, flip. Sounds only play going forward. */
function scanTimeline(t: HTMLElement, gate: HTMLElement | null) {
  const q = (s: string) => t.querySelector<HTMLElement>(s)!;
  const tl = gsap.timeline({ paused: true });
  const fwd = () => !tl.reversed();
  tl.set(q(".tk-line"), { opacity: 1, top: "0%" })
    .to(q(".tk-line"), { top: "100%", duration: 0.55, ease: "power1.inOut" }, 0)
    .fromTo(q(".tk-wash"), { opacity: 1, clipPath: "inset(0% 0% 100% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.55, ease: "power1.inOut" }, 0)
    .call(() => {
      if (!fwd()) return;
      beep();
      if (gate) {
        gate.classList.add("is-ok");
        gsap.delayedCall(0.9, () => gate.classList.remove("is-ok"));
      }
    }, [], 0.45)
    .to(q(".tk-line"), { opacity: 0, duration: 0.15 }, 0.55)
    .to(q(".tk-wash"), { opacity: 0, duration: 0.4 }, 0.6)
    .fromTo(q(".tk-stamp"), { scale: 1.6, rotate: -16, opacity: 0 }, { scale: 1, rotate: -8, opacity: 1, duration: 0.3, ease: "back.out(3)" }, 0.6)
    .call(() => void (fwd() && stamp()), [], 0.72)
    .fromTo(q(".tk-paper"), { y: 0 }, { y: 5, duration: 0.07, yoyo: true, repeat: 1, ease: "power1.out" }, 0.74)
    .fromTo(q(".tk-inner"), { rotateY: 0 }, { rotateY: 180, duration: 0.75, ease: "power3.inOut" }, 1.25);
  return tl;
}

export default function TicketRail({ features, receipts }: { features: TicketItem[]; receipts: Receipt[] }) {
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reducedMotion()) return;
    const root = wrap.current!;
    const view = root.querySelector<HTMLElement>(".tk-view")!;
    const track = root.querySelector<HTMLElement>(".tk-track")!;
    const gate = root.querySelector<HTMLElement>(".tk-gate");
    const count = root.querySelector<HTMLElement>(".tk-count-n")!;
    const tickets = gsap.utils.toArray<HTMLElement>(".tk-ticket", root);
    let done = 0;
    const tally = (n: number) => {
      done = Math.max(0, Math.min(tickets.length, n));
      count.textContent = String(done);
    };

    const mm = gsap.matchMedia();

    mm.add(PIN, () => {
      root.classList.add("is-pinned");
      view.scrollLeft = 0;
      const dist = () => Math.max(0, track.scrollWidth - view.clientWidth);
      const layers = gsap.utils.toArray<SVGSVGElement>(".tk-sky-layer", root).map((l) => ({ set: gsap.quickSetter(l, "x", "px"), f: parseFloat(l.dataset.f || "0") }));

      // The sideways ride. Slightly shorter than the distance travelled, so it never drags.
      const move = gsap.to(track, {
        x: () => -dist(),
        ease: "none",
        onUpdate() {
          const x = gsap.getProperty(track, "x") as number;
          layers.forEach((l) => l.set(x * l.f));
        },
        scrollTrigger: { trigger: root, start: "top top+=84", end: () => "+=" + Math.round(dist() * 0.8), scrub: 0.6, pin: true, anticipatePin: 1, invalidateOnRefresh: true },
      });

      tickets.forEach((t, i) => {
        const tl = scanTimeline(t, gate);
        ScrollTrigger.create({
          trigger: t,
          containerAnimation: move,
          start: "center 52%",
          onEnter: () => {
            tl.timeScale(1).play();
            tally(i + 1);
          },
          onLeaveBack: () => {
            tl.timeScale(2.2).reverse();
            tally(i);
          },
        });
      });

      // Keyboard: tabbing to a ticket or receipt scrolls the page to the point where it sits mid-screen.
      function onFocus(e: FocusEvent) {
        const el = (e.target as Element).closest<HTMLElement>(".tk-ticket, .tk-rcpt");
        const st = move.scrollTrigger;
        if (!el || !st) return;
        view.scrollLeft = 0; // focus can nudge an overflow box sideways; the transform does the moving here
        const left = el.getBoundingClientRect().left - track.getBoundingClientRect().left;
        const p = gsap.utils.clamp(0, 1, (left + el.offsetWidth / 2 - view.clientWidth * 0.5) / (dist() || 1));
        const y = st.start + p * (st.end - st.start);
        const lenis = getLenis();
        if (lenis) lenis.scrollTo(y, { duration: 0.9 });
        else scrollTo({ top: y });
      }
      root.addEventListener("focusin", onFocus);

      return () => {
        root.removeEventListener("focusin", onFocus);
        root.classList.remove("is-pinned");
      };
    });

    // Swipe rail: scan whichever ticket is mostly in view. The root is the page viewport, and the
    // rail clips its children, so a ticket only counts when it is centred in the rail and on screen.
    mm.add(`not all and ${PIN}`, () => {
      const io = new IntersectionObserver(
        (entries) =>
          entries.forEach((en) => {
            if (!en.isIntersecting) return;
            io.unobserve(en.target);
            scanTimeline(en.target as HTMLElement, null).play();
            tally(done + 1);
          }),
        { threshold: 0.6 }
      );
      tickets.forEach((t) => io.observe(t));
      return () => io.disconnect();
    });

    return () => mm.revert();
  }, []);

  return (
    <div ref={wrap} className="tk">
      <div className="tk-head">
        <div>
          <p className="t-label">Features · what the platform does</p>
          <p className="t-caption mt-1">
            <span className="tk-hint-pin">Keep scrolling. Each ticket taps in at the gate.</span>
            <span className="tk-hint-swipe">Swipe the tickets. Each one taps in as it reaches the middle. →</span>
          </p>
        </div>
        <p className="tk-count t-label" aria-hidden="true">
          <span className="tk-count-n">0</span> / {features.length} verified
        </p>
      </div>

      <div className="tk-view" data-lenis-prevent-horizontal data-lenis-prevent-touch>
        <TicketSkyline />
        <div className="tk-gate" aria-hidden="true">
          <div className="tk-gate-head">
            <span className="tk-gate-led" />
            <span className="tk-gate-brand">GenFreZ</span>
            <span className="tk-gate-tap">TAP IN</span>
          </div>
          <div className="tk-gate-beam" />
          <div className="tk-gate-foot" />
        </div>

        <div className="tk-track">
          <ol className="tk-list" aria-label="Features">
            {features.map((f, i) => {
              const id = `tk-f${i + 1}`;
              return (
                <li key={f.title} className="tk-item">
                  <article className="tk-ticket" tabIndex={0} aria-labelledby={id}>
                    <div className="tk-inner">
                      <div className="tk-paper" aria-hidden="true">
                        <div className="tk-paper-top">
                          <span>
                            VÉ XE BUÝT · № 000 {pad(i + 1)}
                            <br />
                            <em>Hà Nội · one trip</em>
                          </span>
                          <b className="tk-route">08</b>
                        </div>
                        <p className="tk-title">{f.title}</p>
                        <p className="tk-body">{f.body}</p>
                        <div className="tk-check">
                          <span>Kiểm soát · check</span>
                          <div className="tk-stamp">Verified · 1.0</div>
                        </div>
                        <div className="tk-stub">
                          <span className="tk-bars" />
                          <span>Feature {pad(i + 1)}</span>
                        </div>
                        <div className="tk-wash" />
                        <div className="tk-line" />
                      </div>
                      <div className="tk-eticket">
                        <div className="tk-paper-top">
                          <span>
                            E-TICKET · № 000 {pad(i + 1)}
                            <br />
                            <em>GenFreZ · route 08</em>
                          </span>
                          <b className="tk-ok">Verified · 1.0</b>
                        </div>
                        <h4 id={id} className="tk-title">
                          {f.title}
                        </h4>
                        <p className="tk-body">{f.body}</p>
                        <div className="tk-check tk-check-e">
                          <svg className="tk-qr" viewBox="-1 -1 23 23" aria-hidden="true">
                            <rect x="-1" y="-1" width="23" height="23" rx="1.5" className="tk-qr-bg" />
                            <path d={qrPath(f.title)} />
                          </svg>
                          <span>
                            Trip proof
                            <br />
                            <em>Rotating QR, new every trip</em>
                          </span>
                        </div>
                        <div className="tk-stub">
                          <span>Feature {pad(i + 1)}</span>
                          <span className="tk-stub-brand">GenFreZ</span>
                        </div>
                      </div>
                    </div>
                  </article>
                </li>
              );
            })}
          </ol>

          <div className="tk-mid">
            <p className="t-label">Benefits · what each side gets</p>
            <p className="tk-mid-t">Four sides. Four receipts.</p>
          </div>

          <ul className="tk-list tk-rcpts" aria-label="Benefits">
            {receipts.map((r, i) => {
              const id = `tk-b${i + 1}`;
              return (
                <li key={r.title} className="tk-item">
                  <article className="tk-rcpt" tabIndex={0} aria-labelledby={id}>
                    <p className="tk-rcpt-top">
                      <span>GenFreZ · receipt</span>
                      <span>#{pad(i + 1)}</span>
                    </p>
                    <p className="tk-rcpt-who">For: {r.who}</p>
                    <h4 id={id} className="tk-rcpt-title">
                      {r.title}
                    </h4>
                    <p className="tk-rcpt-body">{r.body}</p>
                    <p className="tk-rcpt-total">
                      <span>{r.line}</span>
                      <b>{r.value}</b>
                    </p>
                  </article>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
