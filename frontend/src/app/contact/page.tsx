import type { Metadata } from "next";
import ContactForm from "@/components/ContactForm";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "Contact", description: "Get in touch with the GenFreZ team." };

export default function Contact() {
  return (
    <>
      <section className="mx-auto max-w-6xl px-4 sm:px-6 pt-16 sm:pt-24 pb-12">
        <p className="t-label">Contact</p>
        <h1 className="t-display text-[40px] sm:text-[72px] mt-4">Talk to us.</h1>
        <p className="mt-6 max-w-xl text-[18px] font-light text-text-primary">
          Partners, judges, mentors, curious students. We read everything.
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-12 grid gap-16 lg:grid-cols-[1.4fr_1fr]">
        <ContactForm />
        <aside className="grid gap-10 content-start">
          <div>
            <p className="t-label">Email</p>
            <a href={`mailto:${site.contactEmail}`} className="mt-2 block t-data text-[16px] text-text-display hover:text-text-primary">
              {site.contactEmail}
            </a>
          </div>
          <div>
            <p className="t-label">Social</p>
            <ul className="mt-2 grid">
              {site.socials.map((s) => (
                <li key={s.label} className="row grid-cols-[1fr_auto] py-3">
                  <a href={s.href} target="_blank" rel="noreferrer" className="text-text-primary hover:text-text-display">
                    {s.label}
                  </a>
                  <span className="t-caption">↗</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="t-label">Where</p>
            <p className="mt-2 text-[15px] text-text-secondary">Foreign Trade University · Hanoi, Vietnam<br />{site.event}</p>
          </div>
        </aside>
      </section>
    </>
  );
}
