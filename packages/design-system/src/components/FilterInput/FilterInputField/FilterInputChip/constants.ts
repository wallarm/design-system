/** Minimum input width in px */
export const MIN_INPUT_WIDTH = 4;

/** Maximum input width in px — caps the content-sized input so a long value
 *  can't grow it past the chip; beyond this it scrolls content natively. */
export const MAX_INPUT_WIDTH = 280;

/** Extra pixels added to measured width to prevent text clipping */
export const WIDTH_OFFSET = 1;

/** Approximate width of a single character in px (text-sm fallback) */
export const CHAR_WIDTH_PX = 8;
