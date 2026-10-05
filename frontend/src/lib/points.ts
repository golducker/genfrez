/*
 * The GenFreZ scoring formula, in one place. Every figure on the site comes from here:
 *   points = km × (95 − mode g/km) / 25 × confidence × additionality × budget
 * Points are shown to one decimal (bus 5 km = 5.7), so the calculator, the ledger and the hero
 * card always agree. 1 point = 25 g CO₂ = 100 ₫.
 */

export const BASELINE = 95; // g CO2/km, petrol motorbike in Hanoi traffic
export const G_PER_POINT = 25;
export const VND_PER_POINT = 100;
export const BUDGET = 0.3; // pilot budget coefficient

export const MODES = [
  { id: "bus", label: "Bus", factor: 0, tier: "A-2", conf: 1.0, icon: "bus" },
  { id: "ebike", label: "E-bike", factor: 30, tier: "A-1", conf: 1.0, icon: "bike" },
  { id: "bicycle", label: "Public bike", factor: 0, tier: "A-1", conf: 1.0, icon: "bike" },
  { id: "walk", label: "Walk (GPS)", factor: 0, tier: "B", conf: 0.7, icon: "leaf" },
] as const;

export type ModeId = (typeof MODES)[number]["id"];
export const mode = (id: ModeId) => MODES.find((m) => m.id === id)!;

/** Grams of CO₂ avoided against the petrol-motorbike baseline. */
export const avoidedG = (km: number, factor: number) => km * (BASELINE - factor);

/** Points for one trip, rounded to the one decimal the app shows. */
export function tripPoints(km: number, id: ModeId, additionality = 1) {
  const m = mode(id);
  const raw = (avoidedG(km, m.factor) / G_PER_POINT) * m.conf * additionality * BUDGET;
  return Math.round(raw * 10) / 10;
}

/** Voucher value in đồng of a (one-decimal) points figure. */
export const toVnd = (points: number) => Math.round(points * VND_PER_POINT);

/** Mini App style, used only inside product mock-ups: 13.667 and +5.7. */
export function appNum(v: number, decimals = 0) {
  const [i, f] = v.toFixed(decimals).split(".");
  return i.replace(/\B(?=(\d{3})+(?!\d))/g, ".") + (f ? "." + f : "");
}

/** Everywhere else: en-US, 1,900 and 3.9. */
export const enNum = (v: number, decimals = 0) => v.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
