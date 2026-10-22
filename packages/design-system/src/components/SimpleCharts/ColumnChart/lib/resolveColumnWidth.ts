import { COLUMN_GAP, COLUMN_MAX_WIDTH, COLUMN_MIN_WIDTH } from '../constants';

/**
 * Column width for a step of `band` px: the band minus the 22px gap, clamped to 16–32px and
 * rounded to whole pixels so column edges stay crisp. Kept strictly under the band: recharts
 * ignores a `barSize` that fills the band and draws 90% of it instead. Under 16px per step the
 * columns shrink to leave 1px or less between them — Figma leaves that case open (see
 * `docs/ColumnChart.md` → Open questions).
 */
export const resolveColumnWidth = (band: number): number => {
  if (!(band > 1)) return 0;
  const width = Math.min(COLUMN_MAX_WIDTH, Math.max(COLUMN_MIN_WIDTH, band - COLUMN_GAP));
  // The epsilon absorbs float noise between `plotArea.width / steps` and recharts' own band.
  return Math.min(Math.ceil(band - 1e-6) - 1, Math.round(width));
};
