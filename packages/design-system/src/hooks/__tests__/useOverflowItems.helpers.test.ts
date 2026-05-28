import { describe, expect, it } from 'vitest';
import { calculateVisibleCount } from '../useOverflowItems.helpers';

describe('calculateVisibleCount', () => {
  it('returns all items when everything fits without an indicator', () => {
    const count = calculateVisibleCount({
      itemWidths: [50, 50, 50],
      gap: 10,
      availableWidth: 1000,
      indicatorWidth: 40,
    });
    expect(count).toBe(3);
  });

  it('reserves indicator space and counts only what fits when overflowing', () => {
    // widths+gaps: 50, +10+50=110, +10+50=170; indicator 40 + gap 10 reserved.
    // availableWidth 130 → maxWidth 80 → fits item0 (50) and item1 (50+10=60 -> 110 > 80) => 1
    const count = calculateVisibleCount({
      itemWidths: [50, 50, 50],
      gap: 10,
      availableWidth: 130,
      indicatorWidth: 40,
    });
    expect(count).toBe(1);
  });

  it('always shows at least one item even if it does not fit', () => {
    const count = calculateVisibleCount({
      itemWidths: [500, 500],
      gap: 0,
      availableWidth: 100,
      indicatorWidth: 40,
    });
    expect(count).toBe(1);
  });

  it('returns all items when availableWidth is not measurable (<= 0)', () => {
    const count = calculateVisibleCount({
      itemWidths: [50, 50],
      gap: 0,
      availableWidth: 0,
      indicatorWidth: 40,
    });
    expect(count).toBe(2);
  });

  it('returns 0 for an empty list', () => {
    const count = calculateVisibleCount({
      itemWidths: [],
      gap: 8,
      availableWidth: 500,
      indicatorWidth: 40,
    });
    expect(count).toBe(0);
  });
});
