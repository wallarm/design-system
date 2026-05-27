export interface CalculateVisibleCountParams {
  /** Width of each item in source order (px). */
  itemWidths: number[];
  /** Gap between flex children of the container (px). */
  gap: number;
  /** Available width of the container (px). */
  availableWidth: number;
  /** Measured width of the '+N' indicator (px); fallback — reserveSpace. */
  indicatorWidth: number;
}

/**
 * Pure arithmetic: how many leading items fit before an overflow indicator
 * is required. Does not touch the DOM — safe to call on every resize frame.
 */
export function calculateVisibleCount({
  itemWidths,
  gap,
  availableWidth,
  indicatorWidth,
}: CalculateVisibleCountParams): number {
  if (itemWidths.length === 0) return 0;
  if (availableWidth <= 0) return itemWidths.length;

  // First pass: do all items fit without an indicator?
  let total = 0;
  for (let i = 0; i < itemWidths.length; i++) {
    total += (itemWidths[i] ?? 0) + (i > 0 ? gap : 0);
  }
  if (total <= availableWidth) return itemWidths.length;

  // Second pass: reserve space for the indicator and count what fits.
  const maxWidth = availableWidth - indicatorWidth - gap;
  let accumulated = 0;
  let count = 0;
  for (let i = 0; i < itemWidths.length; i++) {
    const widthWithGap = (itemWidths[i] ?? 0) + (i > 0 ? gap : 0);
    if (accumulated + widthWithGap <= maxWidth || i === 0) {
      accumulated += widthWithGap;
      count++;
    } else {
      break;
    }
  }
  return Math.max(count, 1); // always show at least one item
}
