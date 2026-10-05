import { audioOut, noise, tone } from "./sfx";

/*
 * The footer leaf jar's cues. Both are ambient: they stay silent until the first click unlocks audio,
 * and audioOut() is null while muted. tone() and noise() play into the shared master bus.
 */

let lastRustle = 0;

/** Leaves landing: a dry 2 kHz band of noise, louder as more of them pour in (level 0..1). */
export function rustle(level: number) {
  const out = audioOut();
  if (!out) return;
  const now = performance.now();
  if (now - lastRustle < 90) return;
  lastRustle = now;
  try {
    const t = out.ctx.currentTime + 0.005;
    const v = Math.max(0, Math.min(1, level));
    noise(t, 0.09 + v * 0.08, 0.008 + v * 0.04, 1700 + Math.random() * 700, 2600, 1.6);
  } catch {}
}

/** The neon Z striking: a 60 ms mains hum with a spit of static, the way a shop sign catches. */
export function buzz() {
  const out = audioOut();
  if (!out) return;
  try {
    const t = out.ctx.currentTime + 0.005;
    tone(100, t, 0.06, 0.05, "sawtooth");
    tone(200, t, 0.05, 0.025, "square");
    noise(t, 0.06, 0.03, 4200, 3000, 2);
  } catch {}
}
