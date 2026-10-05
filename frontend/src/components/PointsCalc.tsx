"use client";

import { useMemo, useRef, useState } from "react";
import SegBar from "./SegBar";
import Icon from "./Icon";
import RollingNumber from "./fx/RollingNumber";
import { burst } from "./ClickFx";
import { play } from "@/lib/sfx";

const MODES = [
  { id: "bus", label: "Bus", factor: 0, tier: "A-2", conf: 1.0, icon: "bus" },
  { id: "ebike", label: "E-bike", factor: 30, tier: "A-1", conf: 1.0, icon: "bike" },
  { id: "bicycle", label: "Public bike", factor: 0, tier: "A-1", conf: 1.0, icon: "bike" },
  { id: "walk", label: "Walk (GPS)", factor: 0, tier: "B", conf: 0.7, icon: "leaf" },
] as const;

const BASELINE = 95; // g CO2/km, petrol motorbike
const G_PER_POINT = 25;
const VND_PER_POINT = 100;
const BUDGET = 0.3; // pilot budget coefficient
const MAX_KM = 30;

export default function PointsCalc() {
  const [km, setKm] = useState(5);
  const [mode, setMode] = useState<(typeof MODES)[number]["id"]>("ebike");
  const m = MODES.find((x) => x.id === mode)!;
  const pointsEl = useRef<HTMLParagraphElement>(null);

  const r = useMemo(() => {
    const avoided = km * (BASELINE - m.factor);
    const raw = avoided / G_PER_POINT;
    const points = Math.round(raw * m.conf * 1 * BUDGET);
    return { avoided, raw, points, vnd: points * VND_PER_POINT };
  }, [km, m]);

  // A small celebration whenever the points figure goes up.
  const lastPoints = useRef(r.points);
  function celebrate(next: number) {
    if (next > lastPoints.current && pointsEl.current) {
      const b = pointsEl.current.getBoundingClientRect();
      burst(b.left + 30, b.top + b.height / 2, 8, 0.5);
      play("ting");
    }
    lastPoints.current = next;
  }

  function points(kmV: number, f: number, conf: number) {
    return Math.round(((kmV * (BASELINE - f)) / G_PER_POINT) * conf * BUDGET);
  }

  function onKm(v: number) {
    if (v === km) return;
    setKm(v);
    play("tick", { value: v / MAX_KM });
    const p = points(v, m.factor, m.conf);
    if (p > lastPoints.current) celebrate(p);
    else lastPoints.current = p;
  }

  function onMode(id: (typeof MODES)[number]["id"]) {
    if (id === mode) return;
    setMode(id);
    const nm = MODES.find((x) => x.id === id)!;
    play("pop");
    celebrate(points(km, nm.factor, nm.conf));
  }

  const idx = MODES.findIndex((x) => x.id === mode);
  const fill = ((km - 1) / (MAX_KM - 1)) * 100;

  return (
    <div className="card calc p-6 sm:p-10 grid gap-10 lg:grid-cols-[1fr_1fr]" data-reveal="scale">
      <div className="grid gap-7">
        <div>
          <div className="flex items-baseline justify-between">
            <label htmlFor="km" className="t-label">Trip distance</label>
            <span className="t-data text-[15px] text-text-display">{km} km</span>
          </div>
          <input
            id="km"
            type="range"
            min={1}
            max={MAX_KM}
            step={1}
            value={km}
            onChange={(e) => onKm(Number(e.target.value))}
            className="range mt-4"
            style={{ "--fill": `${fill}%` } as React.CSSProperties}
            data-cursor="Drag"
          />
          <div className="mt-2 flex justify-between t-caption" aria-hidden="true">
            <span>1 km</span>
            <span>15</span>
            <span>30 km</span>
          </div>
        </div>
        <div>
          <p className="t-label mb-3">Instead of a petrol motorbike, you took</p>
          <div className="seg-ctl" role="radiogroup" aria-label="Transport mode" style={{ "--n": MODES.length, "--idx": idx } as React.CSSProperties}>
            <span className="seg-ctl-thumb" aria-hidden="true" />
            {MODES.map((x) => (
              <button
                key={x.id}
                type="button"
                role="radio"
                aria-checked={mode === x.id}
                onClick={() => onMode(x.id)}
                data-sfx="own"
                className={`seg-ctl-btn ${mode === x.id ? "on" : ""}`}
              >
                <Icon name={x.icon} size={16} />
                <span>{x.label}</span>
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

      <div className="calc-out grid content-between gap-8">
        <div>
          <p className="t-label">Avoided CO₂</p>
          <p className="t-display text-[64px] sm:text-[96px] mt-2 flex items-baseline gap-2" aria-live="polite">
            <span className="calc-big">
              <RollingNumber value={r.avoided} />
            </span>
            <span className="text-[18px] font-bold text-text-secondary">g</span>
          </p>
          <SegBar value={Math.min(1, r.avoided / 2850)} segments={24} tone="good" height={10} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="calc-chip">
            <p className="t-label">Points issued</p>
            <p ref={pointsEl} className="t-data text-[40px] text-text-display mt-1 leading-none">
              <RollingNumber value={r.points} />
            </p>
          </div>
          <div className="calc-chip">
            <p className="t-label">Voucher value</p>
            <p className="t-data text-[40px] text-text-display mt-1 leading-none">
              <RollingNumber value={r.vnd} />
              <span className="text-[18px] ml-1">₫</span>
            </p>
          </div>
        </div>
        <p className="t-caption">points = avoided g ÷ 25 × confidence × additionality × budget. Same formula as the ledger.</p>
      </div>
    </div>
  );
}
