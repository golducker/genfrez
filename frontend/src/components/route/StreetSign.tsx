import "./route.css";
import { ROUTE, signLabel } from "@/lib/route";

/* Hanoi's street-sign emblem, simplified: Khuê Văn Các inside a ring. */
export function Emblem() {
  return (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="16" cy="16" r="14.2" />
      <path d="M9.5 11.6 Q16 7.4 22.5 11.6" />
      <path d="M12 11.4v3.4h8v-3.4" />
      <circle cx="16" cy="13.2" r="1.15" />
      <path d="M7.6 17.6 Q16 12.6 24.4 17.6" />
      <path d="M10 17.2v6.4M22 17.2v6.4M10 23.6h12" />
      <path d="M13.2 23.6v-3.1a2.8 2.8 0 0 1 5.6 0v3.1" />
    </svg>
  );
}

/* Tháp Rùa on Hoàn Kiếm Lake, for the destination sign. */
export function TurtleTower() {
  return (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M16 3.5v2.6" />
      <path d="M12.6 8.6 Q16 5.4 19.4 8.6" />
      <path d="M13.4 8.6v3.4h5.2V8.6" />
      <path d="M10.6 14.6 Q16 10.6 21.4 14.6" />
      <path d="M11.6 14.6v4.6h8.8v-4.6" />
      <path d="M8.6 21.4 Q16 17.2 23.4 21.4" />
      <path d="M9.6 21.4v3.2h12.8v-3.2" />
      <path d="M14.2 24.6v-2a1.8 1.8 0 0 1 3.6 0v2" />
      <path d="M3.5 27.4q3.1-1.6 6.2 0t6.3 0 6.3 0 6.2 0" />
    </svg>
  );
}

/**
 * A pole-mounted Hanoi street sign for one stop on the route (see lib/route.ts). The plate swings out
 * from the pole as it scrolls in, wobbles and clangs on hover, and spins on click (components/route/RouteFx).
 * pole: "short" fades out below the plate (section headers), "tall" stands on the pavement (hero street).
 */
export default function StreetSign({ id, size = "md", pole = "short", className = "" }: { id: string; size?: "sm" | "md"; pole?: "short" | "tall"; className?: string }) {
  const s = ROUTE.find((x) => x.id === id);
  if (!s) return null;
  const dest = s.kind === "HỒ";
  return (
    <div className={`rs rs--${size} rs-pole-${pole} ${dest ? "rs--dest" : ""} ${className}`} data-sign={s.id} role="img" aria-label={`Street sign: ${signLabel(s)}. ${s.note}`}>
      <i className="rs-pole" aria-hidden="true" />
      <div className="rs-swing" aria-hidden="true">
        <i className="rs-clamp rs-clamp-a" />
        <i className="rs-clamp rs-clamp-b" />
        <div className="rs-plate">
          <div className="rs-in">
            <span className="rs-emblem">{dest ? <TurtleTower /> : <Emblem />}</span>
            <span className="rs-kind">{dest ? "ĐIỂM ĐẾN" : s.kind}</span>
            <span className="rs-name">{(dest ? `Hồ ${s.name}` : s.name).toUpperCase()}</span>
          </div>
          <i className="rs-glint" />
        </div>
      </div>
      <span className="rs-note" aria-hidden="true">{s.note}</span>
    </div>
  );
}
