/* Which part of the one-page flow is on screen. FlowCanvas writes it, Nav reads it. */
export const FLOW_IDS = ["home", "about", "solution", "contact"] as const;
export type FlowId = (typeof FLOW_IDS)[number];

let current: FlowId = "home";
const listeners = new Set<() => void>();

export function setFlowSection(id: FlowId) {
  if (id === current) return;
  current = id;
  listeners.forEach((l) => l());
}
export const getFlowSection = () => current;
export function subscribeFlow(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}
