/** Minimum input width in px */
export const MIN_INPUT_WIDTH = 4;

/** Maximum measured content width in px before the edit input stops growing
 *  (the rendered width is this + WIDTH_OFFSET); caps a long value so it can't
 *  grow past the chip, beyond which it scrolls content natively. */
export const MAX_INPUT_WIDTH = 280;

/** Extra pixels added to measured width: caret room so the edit input sits at
 *  the entered text width + 4px (prevents clipping and the caret hugging the edge). */
export const WIDTH_OFFSET = 4;

/** Approximate width of a single character in px (text-sm fallback) */
export const CHAR_WIDTH_PX = 8;
