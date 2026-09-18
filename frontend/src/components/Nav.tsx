"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "./Logo";

const links = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/solution", label: "Solution" },
  { href: "/contact", label: "Contact" },
];

export default function Nav() {
  const path = usePathname();
  return (
    <header className="sticky top-0 z-20 bg-black border-b border-border">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 h-16 flex items-center justify-between gap-6">
        <Link href="/" className="flex items-center gap-3 text-text-display">
          <Logo size={24} />
          <span className="font-mono text-[13px] tracking-[0.08em] uppercase">GenFreZ</span>
        </Link>
        <nav aria-label="Primary" className="flex items-center gap-4 sm:gap-8">
          {links.map((l) => {
            const active = l.href === "/" ? path === "/" : path.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? "page" : undefined}
                className={`font-mono text-[11px] sm:text-[12px] tracking-[0.08em] uppercase transition-colors duration-200 ${active ? "text-text-display" : "text-text-disabled hover:text-text-secondary"}`}
              >
                {active ? `[ ${l.label} ]` : l.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
