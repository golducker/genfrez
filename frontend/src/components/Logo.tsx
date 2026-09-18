/* Dot-matrix "G" mark. 5x7 grid, 1 = lit dot. */
const G = [
  [0, 1, 1, 1, 0],
  [1, 0, 0, 0, 1],
  [1, 0, 0, 0, 0],
  [1, 0, 1, 1, 1],
  [1, 0, 0, 0, 1],
  [1, 0, 0, 0, 1],
  [0, 1, 1, 1, 0],
];

export default function Logo({ size = 28, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size * (5 / 7)} height={size} viewBox="0 0 5 7" aria-hidden="true" className={className} style={{ display: "block" }}>
      {G.flatMap((row, y) =>
        row.map((on, x) => (
          <circle key={`${x}-${y}`} cx={x + 0.5} cy={y + 0.5} r={0.36} fill="currentColor" opacity={on ? 1 : 0.12} />
        ))
      )}
    </svg>
  );
}
