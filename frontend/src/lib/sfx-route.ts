import { voice } from "./sfx";

/* Street-sign sounds: the metal plate's clang, split-flap ticks and an arrival chime. Hover and scroll
   cues are ambient, so they stay silent until the first click unlocks audio. */

export const clang = (ambient = true, big = false) =>
  voice((t, { tone, noise }) => {
    const k = big ? 1.5 : 1;
    tone(1046.5, t, 0.55 * k, 0.045 * k);
    tone(1661, t + 0.004, 0.38 * k, 0.03 * k);
    tone(2793, t + 0.008, 0.22 * k, 0.018 * k);
    noise(t, 0.035, 0.05 * k, 4200, 2600, 1.4);
  }, ambient);

let lastTick = 0;
export function flapTick() {
  const now = performance.now();
  if (now - lastTick < 50) return;
  lastTick = now;
  voice((t, { tone, noise }) => {
    noise(t, 0.016, 0.03, 3400, 2200, 2);
    tone(1900, t, 0.012, 0.008, "square");
  }, true);
}

export const arrive = () =>
  voice((t, { tone }) => {
    [784, 987.8, 1174.7, 1568].forEach((f, i) => tone(f, t + i * 0.11, 0.5, 0.085, "triangle"));
    tone(2349, t + 0.46, 0.7, 0.03);
  }, true);
