const suffixes = ['', 'k', 'm', 'b', 't'] as const;

// Lower bounds for each suffix bucket.
// 999,500 rounds to 1m (not 999.5k), while 999,499 stays 999k.
const thresholds = [0, 1_000, 999_500, 999_500_000, 999_500_000_000];

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

  if (abs < 1000) return String(value);

  // Find the right suffix bucket
  let i = thresholds.length - 1;
  while (i > 0 && abs < thresholds[i]) {
    i--;
  }

  const divisor = 10 ** (i * 3);
  let scaled = abs / divisor;

  // Determine decimal precision based on the abbreviated value
  const precision = scaled >= 100 ? 0 : 1;

  // Round to the chosen precision
  const factor = 10 ** precision;
  scaled = Math.round(scaled * factor) / factor;

  // Drop trailing .0
  const formatted = scaled % 1 === 0 ? String(Math.round(scaled)) : scaled.toFixed(1);

  return `${sign}${formatted}${suffixes[i]}`;
};

/**
 * Format a number with thousand separators for tooltips: `59614283` → `"59,614,283"`.
 */
export const formatFullNumber = (value: number): string => fullFormatter.format(value);
