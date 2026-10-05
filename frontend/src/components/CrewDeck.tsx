"use client";

import { useEffect, useRef, type ReactNode } from "react";

/* Phones have no hover, so the pass centred in the swipe deck gets its colour back instead. */
export default function CrewDeck({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const ul = ref.current;
    if (!ul) return;
    const mq = matchMedia("(max-width: 639px)");
    let io: IntersectionObserver | null = null;

    const setup = () => {
      io?.disconnect();
      io = null;
      ul.querySelectorAll(".is-live").forEach((el) => el.classList.remove("is-live"));
      if (!mq.matches) return;
      io = new IntersectionObserver(
        (entries) => entries.forEach((e) => e.target.classList.toggle("is-live", e.intersectionRatio >= 0.75)),
        { root: ul, threshold: [0, 0.75] },
      );
      ul.querySelectorAll(".cp-pass").forEach((li) => io!.observe(li));
    };

    setup();
    mq.addEventListener("change", setup);
    return () => {
      mq.removeEventListener("change", setup);
      io?.disconnect();
    };
  }, []);

  return (
    <ul ref={ref} className="cp-deck">
      {children}
    </ul>
  );
}
