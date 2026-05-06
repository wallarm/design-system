import { useEffect } from 'react';
import type { LineChartDatum, LineChartSeries } from '../LineChartContext';
import { warnLineChart } from '../lib/warn';

const compareX = (a: unknown, b: unknown): number => {
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  if (typeof a === 'string' && typeof b === 'string') return a < b ? -1 : a > b ? 1 : 0;
  return 0;
};

/**
 * Dev-only sanity checks. Surfaces three classes of caller mistake as
 * `console.warn` so the chart fails loudly in development instead of silently
 * rendering a broken plot:
 *
 * - `xKey` missing on datums (Recharts would draw gaps or break ordering)
 * - `data` not sorted ascending by `xKey` (Recharts assumes an ordered domain)
 * - `series[].key` not present on any datum (line renders empty)
 *
 * Production builds short-circuit before any iteration to avoid the per-render
 * cost on large datasets.
 */
export const useLineChartDataWarnings = ({
  data,
  series,
  xKey,
}: {
  data: LineChartDatum[];
  series: LineChartSeries[];
  xKey: string;
}): void => {
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') return;
    if (data.length === 0) return;

    let xKeyMissingCount = 0;
    for (const d of data) {
      const v = d[xKey];
      if (v === undefined || v === null) xKeyMissingCount++;
    }
    if (xKeyMissingCount > 0) {
      warnLineChart(
        `\`xKey="${xKey}"\` is missing on ${xKeyMissingCount} of ${data.length} datums. ` +
          'Recharts uses this key for the X axis; missing values will produce gaps or break ordering. ' +
          'Provide the key on every datum or pass a different `xKey`.',
      );
    }

    let unsortedAt: number | null = null;
    for (let i = 1; i < data.length; i++) {
      const prev = data[i - 1]?.[xKey];
      const curr = data[i]?.[xKey];
      if (prev === undefined || curr === undefined || prev === null || curr === null) continue;
      if (compareX(prev, curr) > 0) {
        unsortedAt = i;
        break;
      }
    }
    if (unsortedAt !== null) {
      warnLineChart(
        `\`data\` is not sorted ascending by \`xKey="${xKey}"\` (first inversion at index ${unsortedAt}). ` +
          'Recharts assumes an ordered X domain — unsorted data will draw the line backwards. Sort upstream.',
      );
    }

    const seenKeys = new Set<string>();
    for (const d of data) {
      for (const s of series) {
        if (seenKeys.has(s.key)) continue;
        const v = d[s.key];
        if (v !== undefined && v !== null) seenKeys.add(s.key);
      }
      if (seenKeys.size === series.length) break;
    }
    const missingSeries = series.filter(s => !seenKeys.has(s.key)).map(s => s.key);
    if (missingSeries.length > 0) {
      warnLineChart(
        `series whose \`key\` does not appear on any datum: ${missingSeries
          .map(k => `"${k}"`)
          .join(', ')}. ` +
          'These lines will render empty. Drop the series or check the key spelling.',
      );
    }
  }, [data, series, xKey]);
};
