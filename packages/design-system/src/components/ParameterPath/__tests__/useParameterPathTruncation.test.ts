import { describe, expect, it } from 'vitest';
import { computeTruncation } from '../useParameterPathTruncation';

describe('computeTruncation', () => {
  it('keeps everything visible when total width fits', () => {
    expect(
      computeTruncation({
        containerWidth: 500,
        methodWidth: 50,
        encodingWidth: 0,
        segmentWidths: [40, 60, 80],
        jointWidth: 16,
      }),
    ).toEqual({ isTruncated: false, visibleSegmentIndices: [0, 1, 2] });
  });

  it('collapses middle segments when overflowing', () => {
    expect(
      computeTruncation({
        containerWidth: 200,
        methodWidth: 50,
        encodingWidth: 0,
        segmentWidths: [40, 200, 200, 200, 80],
        jointWidth: 16,
      }),
    ).toEqual({ isTruncated: true, visibleSegmentIndices: [0, 4] });
  });

  it('does not truncate when there are only two segments (no middle to hide)', () => {
    expect(
      computeTruncation({
        containerWidth: 50,
        methodWidth: 50,
        encodingWidth: 0,
        segmentWidths: [200, 200],
        jointWidth: 16,
      }),
    ).toEqual({ isTruncated: false, visibleSegmentIndices: [0, 1] });
  });

  it('keeps method and encoding visible even when truncating', () => {
    const result = computeTruncation({
      containerWidth: 250,
      methodWidth: 50,
      encodingWidth: 80,
      segmentWidths: [40, 100, 100, 100, 60],
      jointWidth: 16,
    });
    expect(result.isTruncated).toBe(true);
    expect(result.visibleSegmentIndices).toEqual([0, 4]);
  });

  it('returns single-segment array unchanged', () => {
    expect(
      computeTruncation({
        containerWidth: 30,
        methodWidth: 0,
        encodingWidth: 0,
        segmentWidths: [500],
        jointWidth: 16,
      }),
    ).toEqual({ isTruncated: false, visibleSegmentIndices: [0] });
  });

  it('handles empty segments array', () => {
    expect(
      computeTruncation({
        containerWidth: 100,
        methodWidth: 50,
        encodingWidth: 0,
        segmentWidths: [],
        jointWidth: 16,
      }),
    ).toEqual({ isTruncated: false, visibleSegmentIndices: [] });
  });
});
