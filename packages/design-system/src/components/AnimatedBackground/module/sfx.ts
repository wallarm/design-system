/**
 * Synthesized 8-bit SFX for the shooter easter egg.
 *
 * All sounds use the Web Audio API — square waves + band-passed noise,
 * the way original hardware made them. No audio files, no deps, no bundle weight.
 *
 * SSR-safe: nothing runs at import time (typeof window guard).
 * Autoplay-safe: AudioContext created lazily on the first play call,
 * which is always downstream of a user gesture.
 */

const MASTER_VOLUME = 0.06;

let ac: AudioContext | null = null;
let master: GainNode | null = null;

function ctx(): AudioContext | null {
  if (typeof window === 'undefined' || !window.AudioContext) return null;
  if (!ac) {
    ac = new window.AudioContext();
    master = ac.createGain();
    master.gain.value = MASTER_VOLUME;
    master.connect(ac.destination);
  }
  if (ac.state === 'suspended') ac.resume().catch(() => {});
  return ac;
}

// One enveloped oscillator: type + pitch glide f0→f1 over dur seconds.
function tone(type: OscillatorType, f0: number, f1: number, dur: number, vol: number, delay = 0) {
  const a = ctx();
  if (!a || !master) return;
  const t0 = a.currentTime + delay;
  const osc = a.createOscillator();
  const gain = a.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(Math.max(1, f0), t0);
  if (f1 !== f0) osc.frequency.exponentialRampToValueAtTime(Math.max(1, f1), t0 + dur);
  gain.gain.setValueAtTime(vol, t0);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(gain);
  gain.connect(master);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

// A short burst of band-passed white noise sweeping f0→f1 (the "crunch" layer).
function hiss(dur: number, vol: number, f0: number, f1: number, delay = 0) {
  const a = ctx();
  if (!a || !master) return;
  const t0 = a.currentTime + delay;
  const n = Math.floor(a.sampleRate * dur);
  const buf = a.createBuffer(1, n, a.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < n; i++) data[i] = Math.random() * 2 - 1;
  const src = a.createBufferSource();
  src.buffer = buf;
  const filter = a.createBiquadFilter();
  filter.type = 'bandpass';
  filter.Q.value = 1.2;
  filter.frequency.setValueAtTime(Math.max(1, f0), t0);
  filter.frequency.exponentialRampToValueAtTime(Math.max(40, f1), t0 + dur);
  const gain = a.createGain();
  gain.gain.setValueAtTime(vol, t0);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  src.connect(filter);
  filter.connect(gain);
  gain.connect(master);
  src.start(t0);
  src.stop(t0 + dur + 0.02);
}

/* ------------------------------------------------------------------ */
/*  Pew — bullet emitted                                               */
/*  Square 980 -> 180 Hz glide, 80 ms                                 */
/* ------------------------------------------------------------------ */

export function playPew(): void {
  tone('square', 980, 180, 0.08, 0.5);
}

/* ------------------------------------------------------------------ */
/*  Zap — armed kill (bullet or click)                                 */
/*  Square 320 -> 70 Hz 60 ms + band-passed noise burst 1400->300 Hz  */
/* ------------------------------------------------------------------ */

export function playZap(): void {
  tone('square', 320, 70, 0.06, 0.45);
  hiss(0.07, 0.3, 1400, 300);
}

/* ------------------------------------------------------------------ */
/*  Coin — idle/gate catch (INSERT COIN chirp)                         */
/*  Two square notes: B5 (988 Hz) 80 ms -> E6 (1319 Hz) 380 ms       */
/* ------------------------------------------------------------------ */

export function playCoin(): void {
  tone('square', 988, 988, 0.08, 0.4);
  tone('square', 1319, 1319, 0.38, 0.4, 0.08);
}

/* ------------------------------------------------------------------ */
/*  Power-up — arm / fresh round                                       */
/*  Rising square arpeggio G4-C5-E5-G5 (392/523/659/784 Hz), 60 ms   */
/* ------------------------------------------------------------------ */

export function playPowerUp(): void {
  const notes = [392, 523, 659, 784];
  for (let i = 0; i < notes.length; i++) tone('square', notes[i]!, notes[i]!, 0.07, 0.4, i * 0.06);
}

/* ------------------------------------------------------------------ */
/*  Fanfare — ceremony starts (tier >= 1)                              */
/*  C5-E5-G5 90 ms steps + C6 (1046 Hz) 220 ms                       */
/* ------------------------------------------------------------------ */

export function playFanfare(): void {
  const notes = [523, 659, 784];
  for (let i = 0; i < notes.length; i++) tone('square', notes[i]!, notes[i]!, 0.09, 0.4, i * 0.09);
  tone('square', 1046, 1046, 0.22, 0.4, 0.27);
}
