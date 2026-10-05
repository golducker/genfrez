import ContactForm from "@/components/ContactForm";
import Mascot from "@/components/Mascot";
import Split from "@/components/fx/Split";
import { site } from "@/lib/site";

export default function ContactSection() {
  return (
    <>
      <section className="relative">
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 pt-16 sm:pt-24 pb-12 grid gap-8 lg:grid-cols-[1fr_auto] items-end">
          <div>
            <p data-reveal className="t-label label-rule">Contact</p>
            <h2 data-split className="t-display text-[44px] sm:text-[84px] mt-4">
              <Split text="Want to" /> <Split text="move" className="text-accent-text" /> <Split text="with us?" />
            </h2>
            <p data-reveal className="mt-6 max-w-xl text-[18px] text-text-primary">
              Have a question, partnership idea, or just want to say hi? Partners, judges, mentors, curious students. We read everything.
            </p>
          </div>
          <div data-reveal="pop" className="hidden lg:block">
            <Mascot name="heart-hug" scale={1.4} className="bob" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-8 grid gap-6 lg:grid-cols-[1.5fr_1fr] items-start">
        <div data-reveal="left" className="card p-6 sm:p-10">
          <ContactForm />
        </div>
        <aside data-reveal="right" className="aurora tone-navy card p-8 grid gap-8 content-start">
          <div>
            <p className="t-label">Email</p>
            <a href={`mailto:${site.contactEmail}`} className="mt-2 block text-[17px] font-bold text-text-display hover:text-accent-text break-all transition-colors">
              {site.contactEmail}
            </a>
          </div>
          <div>
            <p className="t-label">Social</p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {site.socials.map((s) => (
                <li key={s.label}>
                  <a href={s.href} target="_blank" rel="noreferrer" className="pill hover:bg-surface-raised transition-colors">
                    {s.label} ↗
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="t-label">Where</p>
            <p className="mt-2 text-[15px] text-text-secondary">
              Foreign Trade University · Hanoi, Vietnam
              <br />
              {site.event}
            </p>
          </div>
        </aside>
      </section>
    </>
  );
}
