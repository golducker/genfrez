export default function Stat({
  value,
  unit,
  label,
  note,
  size = "lg",
}: {
  value: string;
  unit?: string;
  label: string;
  note?: string;
  size?: "xl" | "lg" | "md";
}) {
  const cls = size === "xl" ? "text-[64px] sm:text-[96px]" : size === "lg" ? "text-[40px] sm:text-[56px]" : "text-[28px] sm:text-[36px]";
  return (
    <div>
      <p className="t-label">{label}</p>
      <p className={`t-display ${cls} mt-2 flex items-baseline gap-2 flex-wrap`}>
        <span>{value}</span>
        {unit && <span className="font-mono text-[12px] tracking-[0.08em] uppercase text-text-secondary font-normal">{unit}</span>}
      </p>
      {note && <p className="mt-2 text-[14px] text-text-secondary max-w-xs">{note}</p>}
    </div>
  );
}
