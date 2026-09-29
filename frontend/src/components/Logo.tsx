/* GenFreZ badge: the official logo file (public/logo.png, 512px, transparent outside the disc). */
export default function Logo({ size = 40, className = "block", label = false }: { size?: number; className?: string; label?: boolean }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- small static brand mark; the optimizer adds nothing here
    <img
      src="/logo.png"
      width={size}
      height={size}
      alt={label ? "GenFreZ logo" : ""}
      aria-hidden={label ? undefined : true}
      draggable={false}
      className={`select-none ${className}`}
    />
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
