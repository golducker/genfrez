import Link from "next/link";
import Logo, { Wordmark } from "./Logo";
import ThemeToggle from "./ThemeToggle";
import { SoundToggle } from "./ClickFx";
import { site } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="tone-navy mt-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-14 grid gap-10 sm:grid-cols-[1.4fr_1fr_1fr]">
        <div className="flex items-start gap-4">
          <Logo size={64} className="shrink-0" />
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
          <div className="flex gap-2">
            <ThemeToggle />
            <SoundToggle />
          </div>
        </div>
      </div>
    </footer>
  );
}
