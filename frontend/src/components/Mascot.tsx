import { mascots, type MascotName } from "@/lib/mascots";

/**
 * Renders one mascot at `scale` x its native size (default 1). The source art is ~100px tall,
 * so keep scale <= 2 to stay sharp. Decorative by default; pass `label` to expose it to screen readers.
 */
export default function Mascot({
  name,
  scale = 1,
  label,
  className = "",
}: {
  name: MascotName;
  scale?: number;
  label?: boolean;
  className?: string;
}) {
  const m = mascots[name];
  return (
    // eslint-disable-next-line @next/next/no-img-element -- pre-cut transparent PNG; the optimizer would re-encode it
    <img
      src={`/mascots/${name}.png`}
      width={Math.round(m.w * scale)}
      height={Math.round(m.h * scale)}
      alt={label ? m.alt : ""}
      aria-hidden={label ? undefined : true}
      draggable={false}
      className={`select-none ${className}`}
    />
  );
}
