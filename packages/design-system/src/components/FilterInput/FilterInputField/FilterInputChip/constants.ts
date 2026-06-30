/** Minimum input width in px */
export const MIN_INPUT_WIDTH = 4;

/**
 * Maximum input width in px. Caps the content-sized edit/search input so a long
 * value can't grow the input past the chip (`max-w-[320px]`) and spill its text
 * outside the chip border. Beyond this width the input scrolls its content
 * natively instead of widening.
 */
export const MAX_INPUT_WIDTH = 280;

/** Extra pixels added to measured width to prevent text clipping */
export const WIDTH_OFFSET = 1;

/** Approximate width of a single character in px (text-sm fallback) */
export const CHAR_WIDTH_PX = 8;
