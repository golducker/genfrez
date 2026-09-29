"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";
import Logo, { Wordmark } from "./Logo";
import ThemeToggle from "./ThemeToggle";
import { SoundToggle } from "./ClickFx";
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
  return (
    <header className="sticky top-0 z-20 px-3 sm:px-6 pt-3">
      <div className="mx-auto max-w-6xl h-16 pl-2 pr-2 sm:pl-3 sm:pr-3 flex items-center justify-between gap-3 rounded-full bg-surface/90 backdrop-blur-md shadow-[0_12px_32px_-20px_rgb(var(--shadow)/0.45)] border border-border">
        <Link href="/#home" className="flex items-center gap-2.5 text-text-display shrink-0" aria-label="GenFreZ home">
          <Logo size={40} />
          <Wordmark className="hidden sm:inline text-[20px]" />
        </Link>
        <nav aria-label="Primary" className="flex items-center gap-0.5 sm:gap-1">
          {links.map((l) => {
            const active = onHome && current === l.id;
            return (
              <Link
                key={l.id}
                href={`/#${l.id}`}
                aria-current={active ? "location" : undefined}
                className={`rounded-full px-2 sm:px-4 h-9 sm:h-10 inline-flex items-center text-[12.5px] sm:text-[14px] font-semibold whitespace-nowrap transition-colors duration-300 ${
                  active ? "bg-text-display text-black" : "text-text-secondary hover:text-text-display hover:bg-surface-raised"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
          <ThemeToggle className="hidden md:inline-flex ml-2" />
          <SoundToggle className="hidden md:inline-flex ml-1" />
        </nav>
      </div>
    </header>
  );
}
