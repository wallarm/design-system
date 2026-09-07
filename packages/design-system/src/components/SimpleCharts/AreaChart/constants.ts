export {
  LINE_CARD_HEIGHT as AREA_CARD_HEIGHT,
  LINE_DEFAULT_BODY_MARGIN as AREA_DEFAULT_BODY_MARGIN,
  LINE_HEADER_HEIGHT as AREA_HEADER_HEIGHT,
  LINE_INACTIVE_OPACITY as AREA_INACTIVE_OPACITY,
} from '../LineChart/constants';

/** 1.5px stroke per Figma spec — thinner than LineChart's 2px. */
export const AREA_STROKE_WIDTH = 1.5;
export {
  CHART_PALETTE_FILL as AREA_STROKE_FILL,
  resolveChartColor as resolveSeriesColor,
} from '../lib/chartPalette';

/** 20% fill opacity per Figma spec — semi-transparent bands. */
export const AREA_FILL_OPACITY = 0.2;
