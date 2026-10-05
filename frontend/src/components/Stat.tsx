export default function Stat({
  value,
  unit,
  label,
  note,
  source,
  size = "lg",
  countTo,
  decimals = 0,
}: {
  value: string;
  unit?: string;
  label: string;
  note?: string;
  source?: string;
  size?: "xl" | "lg" | "md";
  /** When set, the figure counts up from zero as it scrolls into view. `value` stays the server-rendered text. */
  countTo?: number;
  decimals?: number;
}) {
  const cls = size === "xl" ? "text-[64px] sm:text-[96px]" : size === "lg" ? "text-[40px] sm:text-[56px]" : "text-[28px] sm:text-[36px]";
  return (
    <div>
      <p className="t-label">{label}</p>
      <p className={`t-display ${cls} mt-2 flex items-baseline gap-2 flex-wrap`}>
        {countTo !== undefined ? (
          <>
            {/* The animated digits start at 0, so screen readers read the final figure instead. */}
            <span className="sr-only">{value}</span>
            <span className="tabular-nums" aria-hidden="true" data-count={countTo} data-decimals={decimals}>
              {value}
            </span>
          </>
        ) : (
          <span>{value}</span>
        )}
        {unit && <span className="font-mono text-[12px] tracking-[0.08em] uppercase text-text-secondary font-normal">{unit}</span>}
      </p>
      {note && <p className="mt-2 text-[14px] text-text-secondary max-w-xs">{note}</p>}
      {source && <p className="mt-2 t-caption max-w-xs">Source: {source}</p>}
    </div>
  );
}
