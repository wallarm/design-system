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

let ctx: AudioContext | null = null;
let master: GainNode | null = null;

function ensureAudio(): { ac: AudioContext; out: GainNode } | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    ctx = new AudioContext();
    master = ctx.createGain();
    master.gain.value = MASTER_VOLUME;
    master.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') {
    ctx.resume();
  }
  if (!master) return null;
  return { ac: ctx, out: master };
}

/** Schedule a sequence of equal-length square-wave notes and return the end time. */
function scheduleNotes(
  ac: AudioContext,
  out: GainNode,
  notes: number[],
  step: number,
  volume = 0.4,
): number {
  const now = ac.currentTime;
  for (let i = 0; i < notes.length; i++) {
    const t = now + i * step;
    const osc = ac.createOscillator();
    osc.type = 'square';
    osc.frequency.value = notes[i]!;

    const gain = ac.createGain();
    gain.gain.setValueAtTime(volume, t);
    gain.gain.setValueAtTime(volume, t + step * 0.85);
    gain.gain.linearRampToValueAtTime(0, t + step);

    osc.connect(gain).connect(out);
    osc.start(t);
    osc.stop(t + step);
  }
  return now + notes.length * step;
}

/* ------------------------------------------------------------------ */
/*  Pew — bullet emitted                                               */
/*  Square 980 -> 180 Hz glide, 80 ms                                 */
/* ------------------------------------------------------------------ */

export function playPew(): void {
  const audio = ensureAudio();
  if (!audio) return;
  const { ac, out } = audio;

  const now = ac.currentTime;
  const dur = 0.08;

  const osc = ac.createOscillator();
  osc.type = 'square';
  osc.frequency.setValueAtTime(980, now);
  osc.frequency.linearRampToValueAtTime(180, now + dur);

  const gain = ac.createGain();
  gain.gain.setValueAtTime(0.5, now);
  gain.gain.linearRampToValueAtTime(0, now + dur);

  osc.connect(gain).connect(out);
  osc.start(now);
  osc.stop(now + dur);
}

/* ------------------------------------------------------------------ */
/*  Zap — armed kill (bullet or click)                                 */
/*  Square 320 -> 70 Hz 60 ms + band-passed noise burst 1400->300 Hz  */
/* ------------------------------------------------------------------ */

export function playZap(): void {
  const audio = ensureAudio();
  if (!audio) return;
  const { ac, out } = audio;

  const now = ac.currentTime;

  // Square component
  const osc = ac.createOscillator();
  osc.type = 'square';
  osc.frequency.setValueAtTime(320, now);
  osc.frequency.linearRampToValueAtTime(70, now + 0.06);

  const oscGain = ac.createGain();
  oscGain.gain.setValueAtTime(0.45, now);
  oscGain.gain.linearRampToValueAtTime(0, now + 0.06);

  osc.connect(oscGain).connect(out);
  osc.start(now);
  osc.stop(now + 0.06);

  // Noise burst component
  const bufLen = Math.ceil(ac.sampleRate * 0.07);
  const buf = ac.createBuffer(1, bufLen, ac.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < bufLen; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  const noise = ac.createBufferSource();
  noise.buffer = buf;

  const bp = ac.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.setValueAtTime(1400, now);
  bp.frequency.linearRampToValueAtTime(300, now + 0.07);
  bp.Q.value = 2;

  const noiseGain = ac.createGain();
  noiseGain.gain.setValueAtTime(0.4, now);
  noiseGain.gain.linearRampToValueAtTime(0, now + 0.07);

  noise.connect(bp).connect(noiseGain).connect(out);
  noise.start(now);
  noise.stop(now + 0.07);
}

/* ------------------------------------------------------------------ */
/*  Coin — idle/gate catch (INSERT COIN chirp)                         */
/*  Two square notes: B5 (988 Hz) 80 ms -> E6 (1319 Hz) 380 ms       */
/* ------------------------------------------------------------------ */

export function playCoin(): void {
  const audio = ensureAudio();
  if (!audio) return;
  const { ac, out } = audio;

  const now = ac.currentTime;

  // Note 1: B5 (988 Hz), 80 ms
  const osc1 = ac.createOscillator();
  osc1.type = 'square';
  osc1.frequency.value = 988;

  const gain1 = ac.createGain();
  gain1.gain.setValueAtTime(0.4, now);
  gain1.gain.setValueAtTime(0.4, now + 0.07);
  gain1.gain.linearRampToValueAtTime(0, now + 0.08);

  osc1.connect(gain1).connect(out);
  osc1.start(now);
  osc1.stop(now + 0.08);

  // Note 2: E6 (1319 Hz), starts at 80 ms, lasts 380 ms
  const osc2 = ac.createOscillator();
  osc2.type = 'square';
  osc2.frequency.value = 1319;

  const gain2 = ac.createGain();
  gain2.gain.setValueAtTime(0, now);
  gain2.gain.setValueAtTime(0.4, now + 0.08);
  gain2.gain.setValueAtTime(0.4, now + 0.38);
  gain2.gain.linearRampToValueAtTime(0, now + 0.46);

  osc2.connect(gain2).connect(out);
  osc2.start(now + 0.08);
  osc2.stop(now + 0.46);
}

/* ------------------------------------------------------------------ */
/*  Power-up — arm / fresh round                                       */
/*  Rising square arpeggio G4-C5-E5-G5 (392/523/659/784 Hz), 60 ms   */
/* ------------------------------------------------------------------ */

export function playPowerUp(): void {
  const audio = ensureAudio();
  if (!audio) return;
  scheduleNotes(audio.ac, audio.out, [392, 523, 659, 784], 0.06);
}

/* ------------------------------------------------------------------ */
/*  Fanfare — ceremony starts (tier >= 1)                              */
/*  C5-E5-G5 90 ms steps + C6 (1046 Hz) 220 ms                       */
/* ------------------------------------------------------------------ */

export function playFanfare(): void {
  const audio = ensureAudio();
  if (!audio) return;
  const { ac, out } = audio;

  const finalT = scheduleNotes(ac, out, [523, 659, 784], 0.09);

  // Final sustained C6
  const osc = ac.createOscillator();
  osc.type = 'square';
  osc.frequency.value = 1046;

  const gain = ac.createGain();
  gain.gain.setValueAtTime(0.45, finalT);
  gain.gain.setValueAtTime(0.45, finalT + 0.16);
  gain.gain.linearRampToValueAtTime(0, finalT + 0.22);

  osc.connect(gain).connect(out);
  osc.start(finalT);
  osc.stop(finalT + 0.22);
}
