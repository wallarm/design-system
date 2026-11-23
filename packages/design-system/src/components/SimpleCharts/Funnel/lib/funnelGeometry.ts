import { FUNNEL_BAND_HEIGHT, FUNNEL_BODY_MAX, FUNNEL_BODY_MIN } from '../constants';

/**
 * Width of one column in its own SVG coordinate space. The SVG stretches horizontally
 * to the real column width (`preserveAspectRatio='none'`), so only the ratio matters.
 */
export const FUNNEL_COLUMN_UNITS = 100;

const CENTER_Y = FUNNEL_BAND_HEIGHT / 2;
// Control points at 45% and 55% of the column width.
const CONTROL_START = 45;
const CONTROL_END = 55;

const round = (n: number): number => Math.round(n * 100) / 100;

/**
 * Body thickness of every step: `value / largest value × 140`, never thinner than 4.
 * A zero, negative or non-finite value draws the minimum; so does every step when
 * no value is positive.
 */
export const funnelThicknesses = (values: readonly number[]): number[] => {
  const usable = values.map(value => (Number.isFinite(value) && value > 0 ? value : 0));
  const max = Math.max(0, ...usable);

  return usable.map(value =>
    max > 0 ? Math.max(FUNNEL_BODY_MIN, (value / max) * FUNNEL_BODY_MAX) : FUNNEL_BODY_MIN,
  );
};

/**
 * The shape of one column: `from` thick at the left edge, `to` thick at the right
 * edge, centered in the band. The edges are cubic curves with flat tangents (control
 * points at 45% and 55% of the width), so a column meets its neighbors without a kink.
 * `grow` widens the shape on top and bottom — that is how the halos are drawn.
 */
export const funnelColumnPath = (from: number, to: number, grow = 0): string => {
  const left = from / 2 + grow;
  const right = to / 2 + grow;

  const topLeft = round(CENTER_Y - left);
  const topRight = round(CENTER_Y - right);
  const bottomLeft = round(CENTER_Y + left);
  const bottomRight = round(CENTER_Y + right);

  return [
    `M0 ${topLeft}`,
    `C${CONTROL_START} ${topLeft} ${CONTROL_END} ${topRight} ${FUNNEL_COLUMN_UNITS} ${topRight}`,
    `L${FUNNEL_COLUMN_UNITS} ${bottomRight}`,
    `C${CONTROL_END} ${bottomRight} ${CONTROL_START} ${bottomLeft} 0 ${bottomLeft}`,
    'Z',
  ].join(' ');
};
