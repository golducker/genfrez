"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import Logo, { Wordmark } from "./Logo";
import ThemeToggle from "./ThemeToggle";
import SoundToggle from "./SoundToggle";
import { getFlowSection, subscribeFlow, type FlowId } from "@/lib/flow";

const links: { id: FlowId; label: string }[] = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "solution", label: "Solution" },
  { id: "contact", label: "Contact" },
];

export default function Nav() {
  const path = usePathname();
  // The site is one continuous page; the active link follows the part on screen.
  const current = useSyncExternalStore(subscribeFlow, getFlowSection, () => "home" as FlowId);
  const onHome = path === "/";
  const navRef = useRef<HTMLElement>(null);
  const [pill, setPill] = useState<{ x: number; w: number } | null>(null);

  // The dark pill slides between links instead of jumping.
  useLayoutEffect(() => {
    const place = () => {
      const a = navRef.current?.querySelector<HTMLElement>(`[data-id="${current}"]`);
      setPill(a && onHome ? { x: a.offsetLeft, w: a.offsetWidth } : null);
    };
    place();
    addEventListener("resize", place);
    document.fonts?.ready.then(place).catch(() => {});
    return () => removeEventListener("resize", place);
  }, [current, onHome]);

  return (
    <header className="sticky top-0 z-30 px-3 sm:px-6 pt-3">
      <div className="nav-shell mx-auto max-w-6xl h-16 pl-2 pr-2 sm:pl-3 sm:pr-3 flex items-center justify-between gap-3 rounded-full">
        <Link href="/#home" className="nav-logo flex items-center gap-2.5 text-text-display shrink-0" aria-label="GenFreZ home">
          <Logo size={40} className="block nav-logo-mark" />
          <Wordmark className="hidden sm:inline text-[20px]" />
        </Link>
        <nav ref={navRef} aria-label="Primary" className="relative flex items-center gap-0.5 sm:gap-1">
          {pill && <span aria-hidden="true" className="nav-pill" style={{ transform: `translateX(${pill.x}px)`, width: pill.w }} />}
          {links.map((l) => {
            const active = onHome && current === l.id;
            return (
              <Link
                key={l.id}
                data-id={l.id}
                href={`/#${l.id}`}
                aria-current={active ? "location" : undefined}
                className={`relative z-[1] rounded-full px-2 sm:px-4 h-9 sm:h-10 inline-flex items-center text-[12.5px] sm:text-[14px] font-semibold whitespace-nowrap transition-colors duration-300 ${
                  active ? "text-black" : "text-text-secondary hover:text-text-display"
                } ${active && !pill ? "bg-text-display" : ""}`}
              >
                {l.label}
              </Link>
            );
          })}
          <ThemeToggle className="hidden md:inline-flex ml-2" />
          <SoundToggle className="hidden md:inline-flex ml-1" />
        </nav>
        <span className="nav-progress" aria-hidden="true" />
      </div>
    </header>
  );
}
