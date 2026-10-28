export {
  LINE_DEFAULT_BODY_MARGIN as COLUMN_DEFAULT_BODY_MARGIN,
  LINE_INACTIVE_OPACITY as COLUMN_INACTIVE_OPACITY,
} from '../LineChart/constants';

// Column width — Figma `12610-10640`: 32px at most, 16px at least, and in between a
// fixed 22px between columns (measured on the 7- and 9-step cards, `12624-4920` / `12624-5118`).
export const COLUMN_MAX_WIDTH = 32;
export const COLUMN_MIN_WIDTH = 16;
export const COLUMN_GAP = 22;

/** 1px gap between the parts of a column. */
export const COLUMN_PART_GAP = 1;

/** Top corners of the whole column (the topmost part), via recharts' `BarStack` clip-path. */
export const COLUMN_RADIUS: [number, number, number, number] = [4, 4, 0, 0];
