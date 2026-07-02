import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  CHAR_WIDTH_PX,
  MAX_INPUT_WIDTH,
  MIN_INPUT_WIDTH,
  WIDTH_OFFSET,
} from '../FilterInputField/FilterInputChip/constants';
import { useSizerWidth } from '../FilterInputField/FilterInputChip/model/useSizerWidth';

// jsdom returns a 0-width rect, so the hook falls back to text.length * CHAR_WIDTH_PX.
const nullSizer = { current: null };

describe('useSizerWidth', () => {
  it('floors short text at the minimum width', () => {
    const { result } = renderHook(() => useSizerWidth({ sizerRef: nullSizer, text: '' }));
    expect(result.current).toBe(MIN_INPUT_WIDTH + WIDTH_OFFSET);
  });

  it('grows with content between the min and max bounds', () => {
    const text = 'abcdef'; // 6 * CHAR_WIDTH_PX = 48, within [min, max]
    const { result } = renderHook(() => useSizerWidth({ sizerRef: nullSizer, text }));
    expect(result.current).toBe(text.length * CHAR_WIDTH_PX + WIDTH_OFFSET);
  });

  it('caps a long value at the maximum width so it cannot overflow the chip (AS-1179)', () => {
    // 100 chars * CHAR_WIDTH_PX greatly exceeds MAX_INPUT_WIDTH.
    const { result } = renderHook(() =>
      useSizerWidth({ sizerRef: nullSizer, text: 'x'.repeat(100) }),
    );
    expect(result.current).toBe(MAX_INPUT_WIDTH + WIDTH_OFFSET);
  });
});
