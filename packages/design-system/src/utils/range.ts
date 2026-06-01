// Zero-based index sequence [0, 1, …, length - 1]; non-positive lengths yield [].
export const range = (length: number): number[] =>
  Array.from({ length: Math.max(0, length) }, (_, i) => i);
