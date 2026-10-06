import { avoidedG, mode, tripPoints } from "./points";

/*
 * The page as one ride across Hanoi: from FTU at 91 Chùa Láng to Hoàn Kiếm Lake, one real street per
 * section, in driving order. Distances are approximate cumulative kilometres along that route.
 */
export type Stop = { id: string; kind: "PHỐ" | "ĐƯỜNG" | "HỒ"; name: string; km: number; note: string };

export const ROUTE: Stop[] = [
  { id: "home", kind: "PHỐ", name: "Chùa Láng", km: 0, note: "Start · FTU, 91 Chùa Láng" },
  { id: "about", kind: "ĐƯỜNG", name: "Nguyễn Chí Thanh", km: 1.0, note: "Stop 2 · ≈1.0 km" },
  { id: "solution", kind: "PHỐ", name: "Kim Mã", km: 3.1, note: "Stop 3 · ≈3.1 km" },
  { id: "how", kind: "PHỐ", name: "Nguyễn Thái Học", km: 4.4, note: "Stop 4 · ≈4.4 km" },
  { id: "demo", kind: "PHỐ", name: "Cửa Nam", km: 5.7, note: "Stop 5 · ≈5.7 km" },
  { id: "features", kind: "PHỐ", name: "Hàng Bông", km: 5.9, note: "Stop 6 · ≈5.9 km" },
  { id: "esg", kind: "PHỐ", name: "Hàng Gai", km: 6.8, note: "Stop 7 · ≈6.8 km" },
  { id: "outcomes", kind: "PHỐ", name: "Lê Thái Tổ", km: 7.2, note: "Stop 8 · ≈7.2 km" },
  { id: "contact", kind: "HỒ", name: "Hoàn Kiếm", km: 7.4, note: "Arrived · ≈7.4 km" },
];

export const TOTAL_KM = ROUTE[ROUTE.length - 1].km;
export const stop = (id: string) => ROUTE.find((s) => s.id === id);
/** The whole ride by bus instead of a petrol motorbike, priced with the published formula. */
export const TRIP = { km: TOTAL_KM, g: Math.round(avoidedG(TOTAL_KM, mode("bus").factor)), points: tripPoints(TOTAL_KM, "bus") };
export const signLabel = (s: Stop) => (s.kind === "HỒ" ? `Hồ ${s.name}` : `${s.kind === "PHỐ" ? "Phố" : "Đường"} ${s.name}`);
