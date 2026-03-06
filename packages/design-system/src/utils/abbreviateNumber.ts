/**
 * Suffix tiers: [minAbsValue, divisor, suffix].
 * Sorted descending so the first match wins.
 *
 * Boundaries use "rounding-aware" thresholds:
 * 999,500 rounds to 1m (not 999.5k), 999,499 stays 999k.
 */
const tiers: [threshold: number, divisor: number, suffix: string][] = [
  [999_500_000_000, 1e12, 't'],
  [999_500_000, 1e9, 'b'],
  [999_500, 1e6, 'm'],
  [1_000, 1e3, 'k'],
];

const fullFormatter = new Intl.NumberFormat('en-US');

/**
 * Abbreviate a number for table cells: `12042` → `"12k"`, `59614283` → `"59.6m"`.
 *
 * Rules (from the Number display & abbreviation guide):
 * - Suffixes: k (10³), m (10⁶), b (10⁹), t (10¹²) — lowercase, no space
 * - Boundary: moves to next suffix when rounding would reach 1000×
 * - Precision: ≥100 → 0 decimals; 10–99 → 1 decimal (drop .0); 1–9.9 → 1 decimal
 * - Negative numbers supported
 */
export const abbreviateNumber = (value: number): string => {
  if (value === 0) return '0';

  const sign = value < 0 ? '-' : '';
  const abs = Math.abs(value);

  if (abs < 1_000) return String(value);

  const tier = tiers.find(([threshold]) => abs >= threshold);

  if (!tier) return String(value);

  const [, divisor, suffix] = tier;
  const scaled = abs / divisor;

  // ≥100 → 0 decimals; <100 → 1 decimal (drop trailing .0)
  const precision = scaled >= 100 ? 0 : 1;
  const rounded = Math.round(scaled * 10 ** precision) / 10 ** precision;
  const formatted = rounded % 1 === 0 ? String(rounded) : rounded.toFixed(1);

  return `${sign}${formatted}${suffix}`;
};

/**
 * Format a number with thousand separators for tooltips: `59614283` → `"59,614,283"`.
 */
export const formatFullNumber = (value: number): string => fullFormatter.format(value);
