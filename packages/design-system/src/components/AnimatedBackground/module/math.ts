/** Shared easing and clamping helpers used across game modules. */

export function easeOut(t: number): number {
  return 1 - (1 - t) * (1 - t);
}

export function easeIn(t: number): number {
  return t * t;
}

export function clamp01(v: number): number {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}
