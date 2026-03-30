import type { RefObject } from 'react';
import { useEffect, useState } from 'react';
import { CHAR_WIDTH_PX, MIN_INPUT_WIDTH, WIDTH_OFFSET } from '../constants';

interface UseSizerWidthOptions {
  /** Ref to the hidden sizer span */
  sizerRef: RefObject<HTMLSpanElement | null>;
  /** Current text to measure */
  text: string;
  /** Minimum width floor (defaults to MIN_INPUT_WIDTH) */
  minWidth?: number;
}

/**
 * Measures input width from a hidden sizer span.
 * Falls back to character count * CHAR_WIDTH_PX when the DOM element is unavailable.
 * Returns the measured width + WIDTH_OFFSET to prevent text clipping.
 */
export const useSizerWidth = ({
  sizerRef,
  text,
  minWidth = MIN_INPUT_WIDTH,
}: UseSizerWidthOptions): number => {
  const [width, setWidth] = useState(minWidth);

  useEffect(() => {
    const sizerWidth =
      sizerRef.current?.getBoundingClientRect().width ?? text.length * CHAR_WIDTH_PX;
    setWidth(Math.max(minWidth, sizerWidth));
  }, [text, minWidth]);

  return width + WIDTH_OFFSET;
};
