import type { RefObject } from 'react';
import { useEffect, useState } from 'react';
import { CHAR_WIDTH_PX, MAX_INPUT_WIDTH, MIN_INPUT_WIDTH, WIDTH_OFFSET } from '../constants';

interface UseSizerWidthOptions {
  /** Ref to the hidden sizer span */
  sizerRef: RefObject<HTMLSpanElement | null>;
  /** Current text to measure */
  text: string;
  /** Minimum width floor (defaults to MIN_INPUT_WIDTH) */
  minWidth?: number;
  /** Maximum width ceiling (defaults to MAX_INPUT_WIDTH) */
  maxWidth?: number;
}

/**
 * Measures input width from a hidden sizer span.
 * Falls back to character count * CHAR_WIDTH_PX when the DOM element is unavailable.
 * Returns the measured width + WIDTH_OFFSET to prevent text clipping, clamped to
 * [minWidth, maxWidth] so a long value can't widen the input past the chip.
 */
export const useSizerWidth = ({
  sizerRef,
  text,
  minWidth = MIN_INPUT_WIDTH,
  maxWidth = MAX_INPUT_WIDTH,
}: UseSizerWidthOptions): number => {
  const [width, setWidth] = useState(minWidth);

  useEffect(() => {
    const sizerWidth =
      sizerRef.current?.getBoundingClientRect().width ?? text.length * CHAR_WIDTH_PX;
    setWidth(Math.min(maxWidth, Math.max(minWidth, sizerWidth)));
  }, [text, minWidth, maxWidth]);

  return width + WIDTH_OFFSET;
};
