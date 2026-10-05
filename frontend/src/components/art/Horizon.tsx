/*
 * A flat-colour Hanoi street, generated from a seeded PRNG so the server and the client always
 * agree on the markup. Tube houses with balconies and AC boxes, sagging power lines, sấu trees,
 * Keangnam and Lotte in the distance and the orange trusses of Long Biên on the right.
 *
 * Every fill is a CSS variable (--hz-*, defined for day, night and .tone-navy in horizon.css), so
 * a theme switch recolours the scene with no JS. Geometry is batched into a few long <path>s to
 * keep the DOM small. The scene is 1600 x 240 units with the ground along the bottom; callers crop
 * it with preserveAspectRatio "xMidYMax slice", and phones see the middle 550 units.
 */

import { BUS_LEN, BUS_X, HZ_H, HZ_W } from "./geo";
import "./horizon.css";

const GROUND = 196; // pavement top
const ROAD = 206;
const BRIDGE_X = 1130; // houses stop here, the river and Long Biên take over
const SUN = [1036, 50]; // inside the middle 550 units, so phones get it too

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const n = (v: number) => Math.round(v * 10) / 10;
const rect = (x: number, y: number, w: number, h: number) => `M${n(x)} ${n(y)}h${n(w)}v${n(h)}h${n(-w)}z`;
const circle = (cx: number, cy: number, r: number) => `M${n(cx - r)} ${n(cy)}a${n(r)} ${n(r)} 0 1 0 ${n(2 * r)} 0a${n(r)} ${n(r)} 0 1 0 ${n(-2 * r)} 0`;

export type Street = ReturnType<typeof generateStreet>;

/** The whole street as path strings, one per colour. Reusable by anything else that wants Hanoi. */
export function generateStreet(seed = 8) {
  const R = mulberry32(seed);
  let stars = "";
  for (let i = 0; i < 46; i++) {
    const s = 1.1 + R() * 1.3;
    stars += rect(R() * HZ_W, 8 + R() * 110, s, s);
  }

  // Far layer: a ragged line of tower blocks with a scatter of windows.
  let far = "";
  let farWin = "";
  for (let x = -10; x < HZ_W; ) {
    const w = 34 + R() * 52;
    const top = 70 + R() * 84;
    far += rect(x, top, w, GROUND - top);
    for (let fy = top + 8; fy < GROUND - 30; fy += 11)
      for (let fx = x + 6; fx < x + w - 8; fx += 9) if (R() < 0.22) farWin += rect(fx, fy, 3.5, 4.5);
    x += w + R() * 8;
  }
  // Keangnam's twin towers and the tapering Lotte slab.
  const landmarks =
    "M246 196V44l16-12 16 12v152zM292 196V58l14-10 14 10v138z" + // Keangnam
    "M712 196l10-150q16-26 32 0l10 150z" + // Lotte
    "M729 47h18v-9h-18z";

  // Long Biên: a curved top chord over each span, diagonals, a deck and piers in the river.
  let chords = "";
  let truss = "";
  let piers = "";
  for (let bx = BRIDGE_X - 10; bx < HZ_W + 80; bx += 78) {
    chords += `M${bx} 150Q${bx + 39} 112 ${bx + 78} 150`;
    for (let k = 0; k < 6; k++) {
      const x0 = bx + k * 13;
      const y0 = 150 - 38 * Math.sin((Math.PI * (k * 13)) / 78) * 0.98;
      const y1 = 150 - 38 * Math.sin((Math.PI * (k * 13 + 13)) / 78) * 0.98;
      truss += `M${n(x0)} ${n(Math.min(y0, 149))}L${n(x0 + 13)} 150M${n(x0)} 150L${n(x0 + 13)} ${n(Math.min(y1, 149))}`;
    }
    piers += rect(bx - 4, 153, 8, GROUND - 153);
  }
  const deck = rect(BRIDGE_X - 14, 148, HZ_W - BRIDGE_X + 30, 6);
  const river = rect(BRIDGE_X - 20, 160, HZ_W - BRIDGE_X + 40, GROUND - 160);

  // Tube houses: narrow, tall, each a different pastel, with a shop at street level.
  const houses = ["", "", "", "", ""];
  let outlines = "";
  let winA = "";
  let winB = "";
  let rails = "";
  let ac = "";
  let tanks = "";
  let plants = "";
  const signs = ["", "", ""];
  let shutters = "";
  for (let x = -8; x < BRIDGE_X; ) {
    const w = Math.min(36 + R() * 30, BRIDGE_X - x + 6);
    const h = Math.min(66 + R() * 94, Math.abs(x + w / 2 - SUN[0]) < 90 ? 104 : 999); // leave the sun some sky
    const top = GROUND - h;
    const k = Math.floor(R() * 5);
    houses[k] += rect(x, top, w, h);
    outlines += rect(x, top, w, h);
    if (R() < 0.38) {
      // A stepped top floor, set back from the street.
      const sw = w * (0.45 + R() * 0.25);
      houses[k] += rect(x + 3, top - 12, sw, 12);
      outlines += rect(x + 3, top - 12, sw, 12);
    } else if (R() < 0.6) tanks += rect(x + w * 0.55, top - 9, 11, 9);
    // Shop floor: a sign over a dark shutter.
    signs[Math.floor(R() * 3)] += rect(x + 4, 168, w - 8, 7);
    shutters += rect(x + 6, 178, w - 12, GROUND - 178);
    for (let fy = top + 10; fy + 14 < 164; fy += 24) {
      const ww = w * 0.5;
      const win = rect(x + (w - ww) / 2, fy, ww, 11);
      if (R() < 0.5) winA += win;
      else winB += win;
      rails += rect(x + 3, fy + 14, w - 6, 2.4);
      if (R() < 0.28) ac += rect(x + w - 12, fy + 2, 8, 6.5);
      if (R() < 0.3) for (let p = 0; p < 3; p++) plants += circle(x + 8 + p * ((w - 16) / 2), fy + 12, 3.4);
    }
    x += w;
  }

  // Power lines: poles every couple of hundred units, sagging wires and a tangle at each pole.
  const poles: number[] = [];
  for (let x = 40; x < HZ_W + 120; x += 200 + R() * 50) poles.push(x);
  let poleD = "";
  let wires = "";
  for (const p of poles) {
    poleD += rect(p - 2, 90, 4, GROUND - 90) + rect(p - 9, 96, 18, 2.5);
    wires += circle(p + 4, 104, 4) + circle(p - 3, 110, 3);
  }
  for (let k = 0; k < 4; k++)
    for (let i = 0; i < poles.length - 1; i++) {
      const a = poles[i];
      const b = poles[i + 1];
      const y0 = 97 + k * 6;
      wires += `M${n(a)} ${y0}Q${n((a + b) / 2)} ${n(y0 + 16 + k * 3 + R() * 10)} ${n(b)} ${y0}`;
    }

  // Sấu trees along the pavement: three round puffs on a trunk, with a light patch on top.
  let crowns = "";
  let crownsHi = "";
  let trunks = "";
  for (let x = 20 + R() * 60; x < HZ_W; x += 130 + R() * 120) {
    if (x > BUS_X - 10 && x < BUS_X + BUS_LEN + 10) continue; // keep the bus stop open
    const r = 14 + R() * 9;
    const cy = GROUND - 26 - r * 0.6;
    crowns += circle(x, cy - r * 0.35, r) + circle(x - r * 0.75, cy + r * 0.15, r * 0.72) + circle(x + r * 0.78, cy + r * 0.2, r * 0.7);
    crownsHi += circle(x - r * 0.25, cy - r * 0.6, r * 0.38);
    trunks += rect(x - 2.2, cy, 4.4, GROUND - cy + 2);
  }

  // Petrol motorbikes in the far lane, each trailing a puff of exhaust.
  let motos = "";
  let puffs = "";
  for (let i = 0; i < 7; i++) {
    const x = 60 + i * 225 + R() * 90;
    const y = ROAD + 15; // wheel centre
    motos +=
      circle(x, y, 4.6) +
      circle(x + 20, y, 4.6) +
      `M${n(x - 1)} ${y - 4}h22l-4-8h-9l-3 5h-6z` + // body
      rect(x + 7, y - 22, 6, 11) + // rider
      circle(x + 10, y - 26, 4.2);
    puffs += circle(x - 7, y - 3, 3.6) + circle(x - 13, y - 6, 4.8);
  }

  return { stars, far, farWin, landmarks, chords, truss, piers, deck, river, houses, outlines, winA, winB, rails, ac, tanks, plants, signs, shutters, poles: poleD, wires, crowns, crownsHi, trunks, motos, puffs };
}

const STREET = generateStreet();

/** The bus, parked at its stop facing right. HazeWipe moves it by rewriting the outer transform. */
function Bus() {
  const w = BUS_LEN;
  return (
    <g className="hz-bus" transform={`translate(${BUS_X} 0)`}>
      <path className="hz-cone" d={`M${w - 2} 200L${w + 120} 184V226z`} />
      <ellipse cx={w / 2} cy={231} rx={w / 2 + 6} ry={4} className="hz-shadow" />
      <rect x={0} y={160} width={w} height={60} rx={11} className="hz-bus-body" />
      <path d={`M11 160h${w - 22}a11 11 0 0 1 11 11v1H0v-1a11 11 0 0 1 11-11z`} className="hz-ink" />
      <path d={[0, 1, 2, 3, 4].map((i) => rect(12 + i * 34, 178, 28, 19)).join("") + rect(w - 30, 178, 22, 32)} className="hz-bus-win" />
      <path d={rect(150, 178, 20, 36)} className="hz-bus-win" />
      <path d="M156 178v36M164 178v36" className="hz-ink-line" />
      <rect x={w - 54} y={163} width={22} height={7} rx={1.5} className="hz-sign" />
      <text x={w - 43} y={169.2} className="hz-route" textAnchor="middle">
        08
      </text>
      <text x={64} y={213} className="hz-bus-text">
        BUS 08
      </text>
      <rect x={w - 6} y={198} width={6} height={6} rx={2} className="hz-lamp" />
      <circle cx={44} cy={220} r={11} className="hz-ink" />
      <circle cx={44} cy={220} r={4.2} className="hz-hub" />
      <circle cx={w - 46} cy={220} r={11} className="hz-ink" />
      <circle cx={w - 46} cy={220} r={4.2} className="hz-hub" />
    </g>
  );
}

/** The street as one decorative SVG. The far layer carries data-speed for a little parallax. */
export default function Horizon({ className = "" }: { className?: string }) {
  const s = STREET;
  return (
    <svg className={`hz ${className}`} viewBox={`0 0 ${HZ_W} ${HZ_H}`} preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">
      <path d={s.stars} className="hz-stars" />
      <circle cx={SUN[0]} cy={SUN[1]} r={24} className="hz-sun" />
      <path d={circle(SUN[0] - 8, SUN[1] - 6, 5) + circle(SUN[0] + 7, SUN[1] + 7, 3.5)} className="hz-crater" />
      <g data-speed="0.12">
        <path d={s.far} className="hz-far" />
        <path d={s.farWin} className="hz-far-win" />
        <path d={s.landmarks} className="hz-far-2" />
      </g>
      <path d={s.river} className="hz-water" />
      <path d={s.piers + s.deck} className="hz-bridge" />
      <path d={s.chords} className="hz-bridge-line" strokeWidth={3.2} />
      <path d={s.truss} className="hz-bridge-line" strokeWidth={1.6} />
      {s.houses.map((d, i) => (
        <path key={i} d={d} style={{ fill: `var(--hz-house-${i + 1})` }} />
      ))}
      <path d={s.shutters} className="hz-shutter" />
      {s.signs.map((d, i) => (
        <path key={i} d={d} style={{ fill: `var(--hz-sign-${i + 1})` }} />
      ))}
      <path d={s.winA} className="hz-win-a" />
      <path d={s.winB} className="hz-win-b" />
      <path d={s.outlines} className="hz-outline" />
      <path d={s.rails + s.ac + s.tanks} className="hz-ink" />
      <path d={s.plants} className="hz-tree-2" />
      <path d={s.poles} className="hz-ink" />
      <path d={s.wires} className="hz-wire" />
      <path d={s.trunks} className="hz-ink" />
      <path d={s.crowns} className="hz-tree" />
      <path d={s.crownsHi} className="hz-tree-2" />
      <path d={rect(0, 192, HZ_W, ROAD - 192)} className="hz-kerb" />
      <path d={rect(0, ROAD, HZ_W, HZ_H - ROAD)} className="hz-road" />
      <path d={rect(0, ROAD - 1.5, HZ_W, 2.5)} className="hz-ink" />
      <path d={Array.from({ length: 34 }, (_, i) => rect(i * 48 + 10, 226, 24, 2.6)).join("")} className="hz-lane" />
      <path d={s.puffs} className="hz-puff" />
      <path d={s.motos} className="hz-moto" />
      <Bus />
    </svg>
  );
}
