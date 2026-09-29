/* GenFreZ badge: navy disc, cream "Gen / FreZ" with an orange Z, three leaves and two green hills.
   Redrawn as SVG from the brand logo so it stays sharp at any size. */
function Leaf({ x, y, r, s, fill, vein }: { x: number; y: number; r: number; s: number; fill: string; vein?: string }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
      <path d="M0 0 C 16 -14, 17 -42, 0 -60 C -17 -42, -16 -14, 0 0 Z" fill={fill} />
      {vein && <path d="M0 -4 L0 -50" stroke={vein} strokeWidth={2.4} strokeLinecap="round" />}
    </g>
  );
}

export default function Logo({ size = 40, className = "block", label = false }: { size?: number; className?: string; label?: boolean }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      className={className}
      role={label ? "img" : undefined}
      aria-label={label ? "GenFreZ logo" : undefined}
      aria-hidden={label ? undefined : true}
    >
      <defs>
        <clipPath id="genfrez-disc">
          <circle cx="100" cy="100" r="98" />
        </clipPath>
      </defs>
      <g clipPath="url(#genfrez-disc)">
        <rect width="200" height="200" fill="#13345e" />
        <Leaf x={160} y={100} r={-6} s={0.95} fill="#7dc62f" />
        <Leaf x={148} y={128} r={-24} s={0.62} fill="#c8efa5" vein="#5aae3a" />
        <Leaf x={176} y={128} r={22} s={0.74} fill="#c8efa5" vein="#5aae3a" />
        <path d="M0 146 Q 80 118 200 138 L200 200 L0 200 Z" fill="#86cb3a" />
        <path d="M44 200 Q 96 152 200 154 L200 200 Z" fill="#5aae3a" stroke="#13345e" strokeWidth={3} />
        <text x="26" y="86" fill="#fbf6e0" fontSize="39" fontWeight="700" fontFamily="var(--font-montserrat), Montserrat, Arial, sans-serif" letterSpacing="-1">
          Gen
        </text>
        <text x="26" y="132" fill="#fbf6e0" fontSize="39" fontWeight="700" fontFamily="var(--font-montserrat), Montserrat, Arial, sans-serif" letterSpacing="-1">
          Fre<tspan fill="#f26a1b">Z</tspan>
        </text>
      </g>
    </svg>
  );
}

/** Text wordmark with the brand's orange Z. */
export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`font-extrabold tracking-[-0.03em] ${className}`}>
      GenFre<span className="text-accent-text">Z</span>
    </span>
  );
}
