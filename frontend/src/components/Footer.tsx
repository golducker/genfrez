import Link from "next/link";
import { site } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="border-t border-border mt-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 grid gap-6 sm:grid-cols-3">
        <div>
          <p className="t-label">GenFreZ</p>
          <p className="mt-2 text-text-secondary text-[14px]">Your green reward platform. {site.city}, 2026.</p>
        </div>
        <div>
          <p className="t-label">Links</p>
          <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-1">
            {site.socials.map((s) => (
              <li key={s.label}>
                <a href={s.href} target="_blank" rel="noreferrer" className="font-mono text-[12px] tracking-[0.04em] uppercase text-text-secondary hover:text-text-display transition-colors">
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className="sm:text-right">
          <p className="t-label">{site.event}</p>
          <p className="mt-2 font-mono text-[12px] text-text-disabled">
            <Link href="/contact" className="hover:text-text-primary transition-colors">{site.contactEmail}</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
