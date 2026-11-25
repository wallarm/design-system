export {
  LINE_DEFAULT_BODY_MARGIN as BAR_DEFAULT_BODY_MARGIN,
  LINE_INACTIVE_OPACITY as BAR_INACTIVE_OPACITY,
  LINE_RESIZE_DEBOUNCE_MS as BAR_RESIZE_DEBOUNCE_MS,
  LINE_X_LABEL_HEIGHT as BAR_VALUE_LABEL_HEIGHT,
} from '../LineChart/constants';

// Not in Figma yet — mirrors `ColumnChart` turned on its side (see `docs/BarChart.md`).
// A bar is the column's 16px minimum thick, and every row keeps a fixed 12px between bars,
// so the plot grows with the number of categories instead of squeezing them.
export const BAR_THICKNESS = 16;
export const BAR_ROW_GAP = 12;
export const BAR_ROW_HEIGHT = BAR_THICKNESS + BAR_ROW_GAP;

/** Default width of the category label gutter on the left. Labels past it are truncated. */
export const BAR_CATEGORY_LABEL_WIDTH = 96;
/** Space between a category label and the axis line. */
export const BAR_CATEGORY_LABEL_GAP = 8;

/** 1px gap between the parts of a bar. */
export const BAR_PART_GAP = 1;

/** Right corners of the whole bar (the rightmost part), via recharts' `BarStack` clip-path. */
export const BAR_RADIUS: [number, number, number, number] = [0, 4, 4, 0];
