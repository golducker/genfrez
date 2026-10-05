/*
 * GenFreZ sound kit. Every sound is synthesized with Web Audio, so there are no asset files.
 * Browsers only allow audio after a user gesture: the context is created on the first click or key
 * press, and ambient cues (hover, section chime) stay silent until then. Muting is kept in localStorage.
 */

type Sfx = "tap" | "nav" | "cta" | "hover" | "toggle" | "tick" | "trip" | "ting" | "levelup" | "hook" | "boing" | "whoosh" | "pop" | "chime";

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let unlocked = false;
let lastHover = 0;
const listeners = new Set<() => void>();

export function isMuted(): boolean {
  try {
    return localStorage.getItem("sound") === "off";
  } catch {
    return false;
  }
}
export function setMuted(muted: boolean) {
  try {
    localStorage.setItem("sound", muted ? "off" : "on");
  } catch {}
  listeners.forEach((l) => l());
}
export function subscribeSound(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

/** Call from a click/keydown handler. Creates the audio graph the first time. */
export function unlockAudio() {
  try {
    if (!ctx) {
      const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AC) return;
      ctx = new AC();
      // A gentle compressor keeps overlapping sounds from clipping.
      const comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -18;
      comp.ratio.value = 4;
      master = ctx.createGain();
      master.gain.value = 0.9;
      master.connect(comp).connect(ctx.destination);
    }
    if (ctx.state === "suspended") void ctx.resume();
    unlocked = true;
  } catch {}
}

function tone(freq: number, start: number, dur: number, peak: number, type: OscillatorType = "sine", glideTo?: number) {
  const c = ctx!;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, start);
  if (glideTo) o.frequency.exponentialRampToValueAtTime(glideTo, start + dur * 0.6);
  g.gain.setValueAtTime(0.0001, start);
  g.gain.exponentialRampToValueAtTime(peak, start + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  o.connect(g).connect(master!);
  o.start(start);
  o.stop(start + dur + 0.02);
}

function noise(start: number, dur: number, peak: number, from: number, to: number, q = 1.2) {
  const c = ctx!;
  const len = Math.ceil(c.sampleRate * dur);
  const buf = c.createBuffer(1, len, c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  const src = c.createBufferSource();
  src.buffer = buf;
  const f = c.createBiquadFilter();
  f.type = "bandpass";
  f.Q.value = q;
  f.frequency.setValueAtTime(from, start);
  f.frequency.exponentialRampToValueAtTime(to, start + dur);
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, start);
  g.gain.exponentialRampToValueAtTime(peak, start + dur * 0.35);
  g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  src.connect(f).connect(g).connect(master!);
  src.start(start);
  src.stop(start + dur);
}

/** For feature kits (sfx-<feature>.ts): runs f on the shared graph with the same mute and unlock rules as play(). */
export function voice(f: (t: number, kit: { tone: typeof tone; noise: typeof noise }) => void, ambient = false) { if (isMuted() || (ambient && !unlocked)) return; if (!ambient) unlockAudio(); if (ctx && master) try { f(ctx.currentTime + 0.005, { tone, noise }); } catch {} }

// C major pentatonic, two octaves up: hovers always land on a pleasant note.
const PENTA = [1046.5, 1174.7, 1318.5, 1568, 1760, 2093];

/** opts.ambient: the sound is not a direct answer to a click (scroll cues), so it never unlocks audio itself. */
export function play(kind: Sfx, opts: { value?: number; ambient?: boolean } = {}) {
  if (isMuted()) return;
  if (opts.ambient || kind === "hover" || kind === "chime") {
    if (!unlocked) return;
  } else {
    unlockAudio();
  }
  if (!ctx || !master) return;
  try {
    const t = ctx.currentTime + 0.005;
    switch (kind) {
      case "tap":
        tone(620, t, 0.14, 0.12, "sine", 1150);
        break;
      case "nav":
        tone(470, t, 0.16, 0.12, "sine", 900);
        break;
      case "cta":
        tone(523.25, t, 0.22, 0.14, "triangle");
        tone(784, t + 0.045, 0.28, 0.12, "sine");
        noise(t, 0.06, 0.05, 3000, 1500, 0.8);
        break;
      case "hover": {
        const now = performance.now();
        if (now - lastHover < 70) return;
        lastHover = now;
        tone(PENTA[Math.floor(Math.random() * PENTA.length)], t, 0.07, 0.025, "sine");
        break;
      }
      case "toggle":
        tone(660, t, 0.08, 0.1, "square");
        tone(990, t + 0.06, 0.12, 0.08, "sine");
        break;
      case "tick": {
        const v = opts.value ?? 0.5;
        tone(500 + v * 900, t, 0.035, 0.06, "triangle");
        break;
      }
      case "trip": {
        // One trip landing: climbs two octaves of the pentatonic scale as value goes 0 -> 1.
        const i = Math.min(11, Math.floor(Math.max(0, opts.value ?? 0) * 12));
        tone((PENTA[i % 6] / 2) * (i < 6 ? 1 : 2), t, 0.05, 0.05, "triangle");
        break;
      }
      case "ting":
        tone(880, t, 0.28, 0.12);
        tone(1318.5, t + 0.07, 0.34, 0.11);
        break;
      case "levelup":
        [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(f, t + i * 0.085, 0.36, 0.16, "triangle"));
        tone(2093, t + 0.34, 0.5, 0.05);
        break;
      case "hook": {
        // The GenFreZ sound logo, "Gen-Fre-Z!": three quick notes up the scale, then a held high C
        // with a soft fifth under it. About one second. Plays on every reward moment.
        const n = PENTA.map((f) => f / 2);
        [n[3], n[4], n[1]].forEach((f, i) => tone(f, t + i * 0.11, 0.2, 0.15, "triangle"));
        tone(n[5], t + 0.36, 0.7, 0.17, "triangle");
        tone(n[5] * 2, t + 0.36, 0.6, 0.04);
        tone(n[3], t + 0.38, 0.62, 0.06);
        noise(t + 0.34, 0.12, 0.03, 5000, 2500, 0.8);
        break;
      }
      case "boing": {
        const c = ctx;
        const o = c.createOscillator();
        const g = c.createGain();
        o.type = "sine";
        o.frequency.setValueAtTime(170, t);
        o.frequency.exponentialRampToValueAtTime(560, t + 0.09);
        o.frequency.exponentialRampToValueAtTime(240, t + 0.22);
        o.frequency.exponentialRampToValueAtTime(380, t + 0.34);
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.2, t + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.42);
        o.connect(g).connect(master);
        o.start(t);
        o.stop(t + 0.45);
        break;
      }
      case "whoosh":
        noise(t, 0.5, 0.07, 350, 2600, 0.9);
        break;
      case "pop":
        tone(900 + Math.random() * 600, t, 0.06, 0.06, "sine", 1800);
        break;
      case "chime":
        tone(1318.5, t, 0.5, 0.035);
        tone(1975.5, t + 0.09, 0.6, 0.025);
        break;
    }
  } catch {}
}
