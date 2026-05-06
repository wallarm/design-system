export { CHART_PALETTE_FILL as PIE_SLICE_FILL } from '../lib/chartPalette';

// Donut geometry — Figma 7490-122167. The SVG is `PIE_DONUT_SIZE` square; the
// wrapper adds 24px horizontal + 8px vertical padding (in `pieChartDonutClasses`)
// so the slice ends don't kiss the card border. Inner radius is ~73% of outer
// so the ring reads as a thin band and the centre slot has plenty of room for
// the value + label.
export const PIE_DONUT_SIZE = 120;
export const PIE_DONUT_OUTER_RADIUS = 60;
export const PIE_DONUT_INNER_RADIUS = 48;
export const PIE_DONUT_CORNER_RADIUS = 2;
export const PIE_DONUT_PADDING_ANGLE = 2;

// Mount animation. 400 ms is the sweet spot for entrance: fast enough to feel
// snappy in a dashboard that re-renders on every tick, slow enough that the
// sweep reads as a deliberate reveal. Begin offset is 0 so the user sees motion
// the instant the chart mounts (recharts' default 400 ms delay just looks like lag).
export const PIE_DONUT_ANIMATION_DURATION = 400;
export const PIE_DONUT_ANIMATION_BEGIN = 0;
