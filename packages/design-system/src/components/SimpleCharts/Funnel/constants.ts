/** Height of the ribbon band under the step titles. */
export const FUNNEL_BAND_HEIGHT = 172;

/** Body thickness of the largest step. The rest of the band is room for the halos. */
export const FUNNEL_BODY_MAX = 140;

/** Thinnest body a step can draw: a hairline, so `1000 → 100 → 1` (and a `0`) still shows. */
export const FUNNEL_BODY_MIN = 1;

/**
 * Halos: copies of the body grown on top and bottom, drawn under it in the step color.
 * Listed outermost first — that is also the paint order.
 */
export const FUNNEL_HALOS = [
  { grow: 12, opacity: 0.16 },
  { grow: 6, opacity: 0.32 },
] as const;

/** The supported range of steps. Outside it the funnel still draws, with a dev warning. */
export const FUNNEL_MIN_STEPS = 2;
export const FUNNEL_MAX_STEPS = 6;

/** Palette shades a funnel step can take on the light theme. */
export type FunnelShade = 200 | 300 | 400 | 500 | 600 | 700;

/** Every hue is anchored on 600; the dark end of a ramp never goes past 700. */
export const FUNNEL_ANCHOR_SHADE: FunnelShade = 600;

/**
 * Tint ramp: one palette step per stage, light to dark, 600 always included.
 * Keyed by the number of steps. This intentionally differs from `CHART_PALETTE_FILL`
 * (every hue on 500) — the funnel is a ramp, not a categorical palette.
 */
export const FUNNEL_TINT_RAMP: Record<number, readonly FunnelShade[]> = {
  1: [600],
  2: [500, 600],
  3: [400, 500, 600],
  4: [400, 500, 600, 700],
  5: [300, 400, 500, 600, 700],
  6: [200, 300, 400, 500, 600, 700],
};

/** Gray start: the first step is slate at this shade, every other step is the hue at 600. */
export const FUNNEL_GRAY_START_SHADE: FunnelShade = 300;
