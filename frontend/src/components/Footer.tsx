import Link from "next/link";
import Logo, { Wordmark } from "./Logo";
import ThemeToggle from "./ThemeToggle";
import SoundToggle from "./SoundToggle";
import Icon from "./Icon";
import Leaves from "./fx/Leaves";
import { site } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="tone-navy relative mt-24 overflow-hidden rounded-t-[40px] sm:rounded-t-[56px]">
      <Leaves count={14} direction="up" className="opacity-70" />
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 pt-16 pb-10 grid gap-10 sm:grid-cols-[1.4fr_1fr_1fr]">
        <div className="flex items-start gap-4">
          <Logo size={64} className="shrink-0 block nav-logo-mark" />
          <div>
            <Wordmark className="text-[24px] text-text-display" />
            <p className="mt-1 text-[15px] font-semibold text-text-display">{site.tagline}</p>
            <p className="mt-1 text-text-secondary text-[14px]">{site.subTagline} · {site.city}, 2026</p>
          </div>
        </div>
        <div>
          <p className="t-label">Follow us</p>
          <ul className="mt-3 grid gap-2">
            {site.socials.map((s) => (
              <li key={s.label}>
                <a href={s.href} target="_blank" rel="noreferrer" className="text-[15px] text-text-primary hover:text-accent-text transition-colors">
                  {s.label} ↗
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className="grid gap-4 content-start">
          <div>
            <p className="t-label">Say hi</p>
            <Link href="/#contact" className="mt-3 block text-[15px] text-text-primary hover:text-accent-text transition-colors break-all">
              {site.contactEmail}
            </Link>
          </div>
          <p className="t-caption">{site.event}</p>
          <div className="flex flex-wrap gap-2">
            <ThemeToggle />
            <SoundToggle />
          </div>
        </div>
      </div>

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 flex items-end justify-between gap-6">
        <p data-split className="footer-mega select-none" aria-hidden="true">
          {"GenFre".split("").map((c, i) => (
            <span key={i} className="split-w">
              <span className="split-i">{c}</span>
            </span>
          ))}
          <span className="split-w z">
            <span className="split-i">Z</span>
          </span>
        </p>
        <Link href="/#home" data-magnetic className="mb-10 shrink-0 hidden sm:grid place-items-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[var(--orange)] text-[#0d2440] shadow-[0_16px_30px_-12px_rgb(242_106_27/0.8)] transition-[translate] duration-500" aria-label="Back to top">
          <Icon name="arrowUp" size={24} stroke={2.6} />
        </Link>
      </div>
    </footer>
  );
}
