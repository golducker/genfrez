import Image from "next/image";
import type { Member } from "@/lib/site";
import CrewDeck from "./CrewDeck";
import "./CrewPasses.css";

/* Route plates cycle through the brand colours, like the badges on Hanoi's buses. */
const PLATE = ["var(--leaf)", "var(--orange)", "var(--sky)"];

function Initials({ name }: { name: string }) {
  const parts = name.trim().split(/\s+/);
  const initials = (parts[0]?.[0] ?? "") + (parts[parts.length - 1]?.[0] ?? "");
  return (
    <div className="cp-initials" aria-hidden="true">
      {initials.toUpperCase()}
    </div>
  );
}

/** The crew as bus passes: navy photo panel, perforated tear line, cream stub with the real text. */
export default function CrewPasses({ team }: { team: Member[] }) {
  return (
    <>
      {/* One shared duotone (navy, sky, cream) so six different photos read as a set. */}
      <svg width="0" height="0" className="absolute" aria-hidden="true" focusable="false">
        <filter id="cp-duo" colorInterpolationFilters="sRGB">
          <feColorMatrix type="matrix" values="0.3 0.59 0.11 0 0  0.3 0.59 0.11 0 0  0.3 0.59 0.11 0 0  0 0 0 1 0" />
          <feComponentTransfer>
            <feFuncR type="table" tableValues="0.075 0.663 0.984" />
            <feFuncG type="table" tableValues="0.204 0.871 0.965" />
            <feFuncB type="table" tableValues="0.369 0.949 0.878" />
          </feComponentTransfer>
        </filter>
      </svg>
      <CrewDeck>
        {team.map((m, i) => {
          const no = String(i + 1).padStart(2, "0");
          return (
            <li key={m.name} data-reveal="up" className="cp-pass">
              <div data-tilt="5" className="cp-card">
                <div className="cp-top">
                  <div className="cp-head" aria-hidden="true">
                    <span className="cp-plate" style={{ background: PLATE[i % PLATE.length] }}>{no}</span>
                    <span className="cp-kind">Thẻ xe buýt<br />Crew pass</span>
                  </div>
                  <div className="cp-photo">
                    {m.photo ? (
                      <>
                        <Image src={m.photo} alt="" aria-hidden="true" width={480} height={480} sizes="(min-width: 1024px) 340px, (min-width: 640px) 45vw, 80vw" className="cp-duo" />
                        <Image src={m.photo} alt={m.name} width={480} height={480} sizes="(min-width: 1024px) 340px, (min-width: 640px) 45vw, 80vw" className="cp-col" />
                      </>
                    ) : (
                      <Initials name={m.name} />
                    )}
                  </div>
                </div>
                <div className="cp-stub">
                  <p className="cp-no">Route {no} · FTU × UQ</p>
                  <h3 className="t-heading mt-1 cp-name">{m.name}</h3>
                  <p className="t-label mt-2 cp-role">{m.role}</p>
                  <p className="mt-3 text-[15px] cp-bio">{m.bio}</p>
                  {m.linkedin && (
                    <a href={m.linkedin} target="_blank" rel="noreferrer" className="cp-link">
                      LinkedIn ↗
                    </a>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </CrewDeck>
    </>
  );
}
