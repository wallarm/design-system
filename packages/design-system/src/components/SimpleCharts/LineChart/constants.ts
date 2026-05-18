export {
  CHART_PALETTE_FILL as LINE_STROKE_FILL,
  resolveChartColor as resolveSeriesColor,
} from '../lib/chartPalette';

export const LINE_STROKE_WIDTH = 2;
export const LINE_DASH_DASHARRAY = '6 4';

export const LINE_GRID_DASHARRAY = '4 4';
export const LINE_CURSOR_DASHARRAY = '4 2';

export const LINE_ANIMATION_DURATION = 400;
export const LINE_ANIMATION_BEGIN = 0;

export const LINE_INACTIVE_OPACITY = 0.3;

// Card sizing — Figma `7533-3334` (anatomy):
//   single-line:  card 196 = header 32 + plot 164
//   multi-line:   card 196 = header 32 + legend 24 + plot 140
export const LINE_CARD_HEIGHT = 196;
export const LINE_HEADER_HEIGHT = 32;
export const LINE_X_LABEL_HEIGHT = 16;
export const LINE_Y_LABEL_WIDTH = 38;

// Y-label width is owned by `<YAxis width>`, X-label height by `<XAxis>`;
// `margin` only handles the outer-right inset and zero top/bottom.
export const LINE_DEFAULT_BODY_MARGIN = { top: 0, right: 12, bottom: 0, left: 0 };

// First-frame fallback before recharts has measured the plot. Once measured,
// the popover snaps to the plot's vertical centre via `usePlotArea`.
export const HOVER_POPOVER_TOP = 8;

export const LINE_AXIS_TICK_TEXT_PROPS = {
  fill: 'var(--color-text-secondary)',
  fontSize: 10,
  fontFamily: 'var(--font-sans)',
  fontWeight: 400,
} as const;
