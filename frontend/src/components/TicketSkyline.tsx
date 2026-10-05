/*
 * A quiet Hanoi street behind the ticket rail, in three layers that TicketRail slides at different
 * speeds: towers far back, tube houses with roof tanks in the middle, lamp posts and trees up close.
 * Seeded, so the server and the browser draw the same street. Each layer is a handful of paths (one
 * per colour), not hundreds of nodes. Purely decorative.
 */

const H = 260; // band height in px; everything stands on y = H

function rng(seed: number) {
  let s = seed;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

const r1 = (n: number) => Math.round(n * 10) / 10;

function far(w: number) {
  const R = rng(11);
  let towers = "";
  for (let x = 0; x < w; ) {
    const bw = 34 + R() * 56,
      h = 70 + R() * 120;
    towers += `M${r1(x)} ${H}V${r1(H - h)}h${r1(bw)}V${H}Z`;
    x += bw + 6 + R() * 22;
  }
  return { towers };
}

function mid(w: number) {
  const R = rng(29);
  let houses = "",
    windows = "";
  for (let x = -6; x < w; ) {
    const bw = 30 + R() * 34,
      h = 64 + R() * 100,
      y = H - h;
    houses += `M${r1(x)} ${H}V${r1(y)}h${r1(bw)}V${H}Z`;
    // A water tank on some roofs, the Hanoi tell.
    if (R() < 0.4) houses += `M${r1(x + bw * 0.2)} ${r1(y)}v-9h11v9Z`;
    for (let fy = y + 12; fy < H - 26; fy += 26) windows += `M${r1(x + bw * 0.3)} ${r1(fy)}h${r1(bw * 0.4)}v10h${r1(-bw * 0.4)}Z`;
    x += bw + (R() < 0.15 ? 18 + R() * 30 : 0);
  }
  return { houses, windows };
}

function near(w: number) {
  const R = rng(53);
  let posts = "",
    trees = "";
  for (let x = 60; x < w; x += 300 + R() * 140) {
    // Lamp post with a short arm and a head.
    posts += `M${r1(x)} ${H}V${H - 176}h4V${H}Z M${r1(x)} ${H - 176}h30v4h-30Z M${r1(x + 22)} ${H - 172}h14v6h-14Z`;
    const tx = x + 120 + R() * 60,
      rr = 20 + R() * 16;
    trees += `M${r1(tx - 3)} ${H}V${r1(H - rr * 1.6)}h6V${H}Z`;
    for (const [dx, dy, k] of [
      [0, -2.2, 1],
      [-0.75, -1.6, 0.72],
      [0.75, -1.5, 0.78],
    ])
      trees += `M${r1(tx + dx * rr - k * rr)} ${r1(H + dy * rr)}a${r1(k * rr)} ${r1(k * rr)} 0 1 0 ${r1(2 * k * rr)} 0a${r1(k * rr)} ${r1(k * rr)} 0 1 0 ${r1(-2 * k * rr)} 0Z`;
  }
  return { posts, trees };
}

// Widths cover the slowest-to-fastest drift on screens up to about 2,560 px wide.
const W = { far: 2400, mid: 3400, near: 4600 };

export default function TicketSkyline() {
  const f = far(W.far);
  const m = mid(W.mid);
  const n = near(W.near);
  return (
    <div className="tk-sky" aria-hidden="true">
      <svg className="tk-sky-layer" data-f="0.15" width={W.far} height={H} viewBox={`0 0 ${W.far} ${H}`}>
        <path className="tk-sky-far" d={f.towers} />
      </svg>
      <svg className="tk-sky-layer" data-f="0.4" width={W.mid} height={H} viewBox={`0 0 ${W.mid} ${H}`}>
        <path className="tk-sky-mid" d={m.houses} />
        <path className="tk-sky-win" d={m.windows} />
      </svg>
      <svg className="tk-sky-layer" data-f="0.7" width={W.near} height={H} viewBox={`0 0 ${W.near} ${H}`}>
        <path className="tk-sky-tree" d={n.trees} />
        <path className="tk-sky-near" d={n.posts} />
      </svg>
    </div>
  );
}
