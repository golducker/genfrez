"use client";

import { useMemo, useState } from "react";
import SegBar from "./SegBar";

const MODES = [
  { id: "bus", label: "Bus", factor: 0, tier: "A-2", conf: 1.0 },
  { id: "ebike", label: "E-bike", factor: 30, tier: "A-1", conf: 1.0 },
  { id: "bicycle", label: "Public bike", factor: 0, tier: "A-1", conf: 1.0 },
  { id: "walk", label: "Walk (GPS)", factor: 0, tier: "B", conf: 0.7 },
] as const;

const BASELINE = 95; // g CO2/km, petrol motorbike
const G_PER_POINT = 25;
const VND_PER_POINT = 100;
const BUDGET = 0.3; // pilot budget coefficient

export default function PointsCalc() {
  const [km, setKm] = useState(5);
  const [mode, setMode] = useState<(typeof MODES)[number]["id"]>("ebike");
  const m = MODES.find((x) => x.id === mode)!;

  const r = useMemo(() => {
    const avoided = km * (BASELINE - m.factor);
    const raw = avoided / G_PER_POINT;
    const points = Math.round(raw * m.conf * 1 * BUDGET);
    return { avoided, raw, points, vnd: points * VND_PER_POINT };
  }, [km, m]);

  return (
    <div className="border border-border-visible rounded-2xl p-6 sm:p-8 grid gap-8 lg:grid-cols-[1fr_1fr]">
      <div className="grid gap-6">
        <div>
          <div className="flex items-baseline justify-between">
            <label htmlFor="km" className="t-label">Trip distance</label>
            <span className="t-data text-[13px] text-text-display">{km} km</span>
          </div>
          <input id="km" type="range" min={1} max={30} step={1} value={km} onChange={(e) => setKm(Number(e.target.value))} className="mt-3 w-full accent-white" />
        </div>
        <div>
          <p className="t-label mb-3">Instead of a petrol motorbike, you took</p>
          <div className="inline-grid grid-cols-2 sm:grid-cols-4 border border-border-visible rounded-lg overflow-hidden" role="radiogroup" aria-label="Transport mode">
            {MODES.map((x) => (
              <button
                key={x.id}
                type="button"
                role="radio"
                aria-checked={mode === x.id}
                onClick={() => setMode(x.id)}
                className={`h-10 px-4 font-mono text-[11px] tracking-[0.08em] uppercase transition-colors duration-200 ${mode === x.id ? "bg-text-display text-black" : "text-text-secondary hover:text-text-display"}`}
              >
                {x.label}
              </button>
            ))}
          </div>
        </div>
        <dl className="text-[13px]">
          {[
            ["Baseline factor", `${BASELINE} g/km`],
            ["Replacement factor", `${m.factor} g/km`],
            ["Verification tier", `${m.tier} · confidence ${m.conf.toFixed(1)}`],
            ["Additionality", "1.0 (one-way trip)"],
            ["Budget coefficient", `${BUDGET} (pilot)`],
          ].map(([k, v]) => (
            <div key={k} className="row grid-cols-[1fr_auto] py-3">
              <dt className="t-label">{k}</dt>
              <dd className="t-data text-text-primary">{v}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="grid content-between gap-8">
        <div>
          <p className="t-label">Avoided CO₂</p>
          <p className="t-display text-[56px] sm:text-[72px] mt-2 flex items-baseline gap-2">
            <span>{r.avoided.toLocaleString("en-US")}</span>
            <span className="font-mono text-[12px] tracking-[0.08em] uppercase text-text-secondary font-normal">g</span>
          </p>
          <SegBar value={Math.min(1, r.avoided / 2850)} segments={24} tone="good" height={8} />
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="t-label">Points issued</p>
            <p className="t-data text-[32px] text-text-display mt-1">{r.points}</p>
          </div>
          <div>
            <p className="t-label">Voucher value</p>
            <p className="t-data text-[32px] text-text-display mt-1">{r.vnd.toLocaleString("en-US")} ₫</p>
          </div>
        </div>
        <p className="t-caption">points = avoided g ÷ 25 × confidence × additionality × budget. Same formula as the ledger.</p>
      </div>
    </div>
  );
}
