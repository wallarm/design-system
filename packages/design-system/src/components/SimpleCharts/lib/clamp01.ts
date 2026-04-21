export const clamp01 = (n: number): number => {
  if (n < 0) return 0;
  if (n > 1) return 1;
  return n;
};
