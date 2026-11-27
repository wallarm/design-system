export {
  LINE_INACTIVE_OPACITY as BAR_INACTIVE_OPACITY,
  LINE_RESIZE_DEBOUNCE_MS as BAR_RESIZE_DEBOUNCE_MS,
  LINE_X_LABEL_HEIGHT as BAR_VALUE_LABEL_HEIGHT,
} from '../LineChart/constants';

// Not in Figma yet — rows follow `BarList` (see `docs/BarChart.md`): a 32px row with a 16px
// bar in the middle, so the plot grows with the number of categories instead of squeezing them.
export const BAR_THICKNESS = 16;
export const BAR_ROW_GAP = 16;
export const BAR_ROW_HEIGHT = BAR_THICKNESS + BAR_ROW_GAP;

/** Default width of the category label column on the left. Labels past it are truncated. */
export const BAR_CATEGORY_LABEL_WIDTH = 144;
/** Space between a category label and the bar. */
export const BAR_CATEGORY_LABEL_GAP = 12;

/** Row padding on both sides — the `BarList` row inset. */
export const BAR_ROW_INSET = 12;
/** Width of the row total column on the right. */
export const BAR_TOTAL_WIDTH = 56;

/** Row text — the `BarList` label / value style (12px mono, primary). */
export const BAR_ROW_TEXT_PROPS = {
  fill: 'var(--color-text-primary)',
  fontSize: 12,
  fontFamily: 'var(--font-mono)',
} as const;

/** 1px gap between the parts of a bar. */
export const BAR_PART_GAP = 1;

/** Right corners of the whole bar (the rightmost part), via recharts' `BarStack` clip-path. */
export const BAR_RADIUS: [number, number, number, number] = [4, 4, 4, 4];

/** Space under the last row — the body's `pb-8`. The empty frame adds it to match the height. */
export const BAR_BODY_BOTTOM_PADDING = 8;
