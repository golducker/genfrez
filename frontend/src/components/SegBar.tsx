/** Segmented progress bar: discrete blocks, no rounding. value 0..1 */
export default function SegBar({
  value,
  segments = 20,
  tone = "on",
  height = 10,
  label,
  readout,
}: {
  value: number;
  segments?: number;
  tone?: "on" | "good" | "warn" | "bad";
  height?: number;
  label?: string;
  readout?: string;
}) {
  const lit = Math.round(Math.min(1, Math.max(0, value)) * segments);
  return (
    <div>
      {(label || readout) && (
        <div className="flex items-baseline justify-between mb-2 gap-4">
          {label && <span className="t-label">{label}</span>}
          {readout && <span className="t-data text-[13px] text-text-display">{readout}</span>}
        </div>
      )}
      <div
        className="seg"
        style={{ gridTemplateColumns: `repeat(${segments}, 1fr)`, height }}
        role="img"
        aria-label={`${label ?? "progress"}: ${Math.round(value * 100)}%`}
      >
        {Array.from({ length: segments }, (_, i) => (
          <i key={i} className={i < lit ? tone : ""} />
        ))}
      </div>
    </div>
  );
}
