import { audioOut } from "./sfx";

/*
 * The hero street's wind: a looping band of noise whose loudness and pitch follow how fast the
 * cursor or finger sweeps the haze. Like every ambient cue it stays silent until the first click
 * unlocks audio, and it falls quiet on its own a moment after the sweeping stops.
 */

let src: AudioBufferSourceNode | null = null;
let band: BiquadFilterNode | null = null;
let gain: GainNode | null = null;
let idle = 0;

function stop() {
  const s = src;
  const g = gain;
  src = band = gain = null;
  if (!s || !g) return;
  try {
    g.gain.setTargetAtTime(0, g.context.currentTime, 0.05);
    s.stop(g.context.currentTime + 0.3);
  } catch {}
}

/** level 0..1, from pointer speed. Call on every move; silence follows by itself. */
export function wind(level: number) {
  const out = audioOut();
  if (!out) return stop();
  const { ctx, master } = out;
  try {
    if (!src) {
      const len = ctx.sampleRate * 2;
      const buf = ctx.createBuffer(1, len, ctx.sampleRate);
      const d = buf.getChannelData(0);
      // Brown-ish noise: smoother and softer than white, closer to air than hiss.
      let last = 0;
      for (let i = 0; i < len; i++) {
        last = (last + 0.04 * (Math.random() * 2 - 1)) / 1.04;
        d[i] = last * 3.2;
      }
      src = ctx.createBufferSource();
      src.buffer = buf;
      src.loop = true;
      band = ctx.createBiquadFilter();
      band.type = "bandpass";
      band.Q.value = 0.7;
      gain = ctx.createGain();
      gain.gain.value = 0.0001;
      src.connect(band).connect(gain).connect(master);
      src.start();
    }
    const t = ctx.currentTime;
    const v = Math.max(0, Math.min(1, level));
    gain!.gain.cancelScheduledValues(t);
    gain!.gain.setTargetAtTime(0.02 + v * 0.16, t, 0.06);
    gain!.gain.setTargetAtTime(0.0001, t + 0.14, 0.18);
    band!.frequency.setTargetAtTime(320 + v * 1500, t, 0.08);
  } catch {}
  clearTimeout(idle);
  idle = window.setTimeout(stop, 1500);
}

export function stopWind() {
  clearTimeout(idle);
  stop();
}
