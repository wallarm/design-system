import { formatChartDateTime } from '../../lib/timeFormatters';
import type { LineChartZoomRange } from '../LineChartContext';

/**
 * Default range text for the zoom popover. Renders as `from → to` using the
 * shared {@link formatChartDateTime} helper for numeric (timestamp) X values,
 * which respects the app-level `order` / `hourCycle` defaults from the
 * `DateFormatProvider`. Falls back to `String(value)` for non-numeric X values.
 * Consumers override via the `formatRange` prop on `<LineChartZoomBrush>`.
 */
export const formatRange = (range: LineChartZoomRange): string => {
  const from = formatChartDateTime(range.from) || String(range.from);
  const to = formatChartDateTime(range.to) || String(range.to);
  return `${from} → ${to}`;
};
