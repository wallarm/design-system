/**
 * Suffix tiers: [minAbsValue, divisor, suffix].
 * Sorted descending so the first match wins.
 *
 * Boundaries use "rounding-aware" thresholds:
 * 999,500 rounds to 1M (not 999.5k), 999,499 stays 999k.
 */
const tiers: [threshold: number, divisor: number, suffix: string][] = [
  [999_500_000_000, 1e12, 'T'],
  [999_500_000, 1e9, 'B'],
  [999_500, 1e6, 'M'],
  [1_000, 1e3, 'k'],
];

const fullFormatter = new Intl.NumberFormat('en-US');

/**
 * Abbreviate a number for table cells: `12042` → `"12k"`, `59614283` → `"59.6M"`.
 *
 * Rules (from the Number display & abbreviation guide):
 * - Suffixes: k (10³), M (10⁶), B (10⁹), T (10¹²) — k lowercase, rest uppercase, no space
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

/**
 * Format a percentage with boundary safety:
 * - Never show 100% when real value < 100 → ">99%" (or ">99.9%" etc.)
 * - Never show 0% when real value > 0 → "<1%" (or "<0.1%" etc.)
 * - `decimals` controls fractional precision (default 0)
 */
export const formatPercent = (value: number, decimals = 0): string => {
  if (value === 0) return '0%';
  if (value === 100) return '100%';

  const factor = 10 ** decimals;
  const rounded = Math.round(value * factor) / factor;

  // Boundary safety: value > 0 but rounds to 0
  if (value > 0 && rounded === 0) {
    const threshold = 1 / factor;
    return `<${threshold}%`;
  }

  // Boundary safety: value < 100 but rounds to 100
  if (value < 100 && rounded === 100) {
    const max = 100 - 1 / factor;
    return `>${decimals > 0 ? max.toFixed(decimals) : String(max)}%`;
  }

  return `${decimals > 0 ? rounded.toFixed(decimals) : String(rounded)}%`;
};

/**
 * Byte-formatting tiers: [minValue, divisor, suffix].
 * Uses decimal (SI) units: KB = 1000, MB = 1e6, etc.
 */
const byteTiers: [threshold: number, divisor: number, suffix: string][] = [
  [999_500_000_000, 1e12, 'TB'],
  [999_500_000, 1e9, 'GB'],
  [999_500, 1e6, 'MB'],
  [1_000, 1e3, 'KB'],
];

/**
 * Format bytes using decimal (SI) units: 512 B, 3.4 KB, 12.7 MB, 2.3 GB, 1.1 TB.
 * Same decimal precision rules as abbreviateNumber.
 * Returns `{ display, full }` where `full` = "2,345,678,901 bytes".
 */
export const formatBytes = (value: number): { display: string; full: string } => {
  const full = `${fullFormatter.format(value)} bytes`;

  if (value < 1_000) {
    return { display: `${value} B`, full };
  }

  const tier = byteTiers.find(([threshold]) => value >= threshold);

  if (!tier) {
    return { display: `${value} B`, full };
  }

  const [, divisor, suffix] = tier;
  const scaled = value / divisor;

  const precision = scaled >= 100 ? 0 : 1;
  const rounded = Math.round(scaled * 10 ** precision) / 10 ** precision;
  const formatted = rounded % 1 === 0 ? String(rounded) : rounded.toFixed(1);

  return { display: `${formatted} ${suffix}`, full };
};
