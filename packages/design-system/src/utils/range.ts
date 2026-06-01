/**
 * Returns a zero-based index sequence `[0, 1, …, length - 1]`.
 * `range(0)` is `[]`; negative lengths are treated as `0`.
 */
export const range = (length: number): number[] =>
  Array.from({ length: Math.max(0, length) }, (_, i) => i);
