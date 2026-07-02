import { describe, expect, it } from 'vitest';
import { computeTruncation } from '../useParameterPathTruncation';

const defaults = { jointWidth: 16, ellipsisWidth: 16 };

describe('computeTruncation', () => {
  it('keeps everything visible when total width fits', () => {
    expect(
      computeTruncation({
        ...defaults,
        containerWidth: 500,
        methodWidth: 50,
        encodingWidth: 0,
        segmentWidths: [40, 60, 80],
        jointsWidth: 64,
      }),
    ).toEqual({ isTruncated: false, visibleSegmentIndices: [0, 1, 2] });
  });

  it('collapses middle segments when overflowing', () => {
    expect(
      computeTruncation({
        ...defaults,
        containerWidth: 200,
        methodWidth: 50,
        encodingWidth: 0,
        segmentWidths: [40, 200, 200, 200, 80],
        jointsWidth: 64,
      }),
    ).toEqual({ isTruncated: true, visibleSegmentIndices: [0, 4] });
  });

  it('does not truncate when there are only two segments (no middle to hide)', () => {
    expect(
      computeTruncation({
        ...defaults,
        containerWidth: 50,
        methodWidth: 50,
        encodingWidth: 0,
        segmentWidths: [200, 200],
        jointsWidth: 64,
      }),
    ).toEqual({ isTruncated: false, visibleSegmentIndices: [0, 1] });
  });

  it('keeps method and encoding visible even when truncating', () => {
    const result = computeTruncation({
      ...defaults,
      containerWidth: 250,
      methodWidth: 50,
      encodingWidth: 80,
      segmentWidths: [40, 100, 100, 100, 60],
      jointsWidth: 64,
    });
    expect(result.isTruncated).toBe(true);
    expect(result.visibleSegmentIndices).toEqual([0, 4]);
  });

  it('returns single-segment array unchanged', () => {
    expect(
      computeTruncation({
        ...defaults,
        containerWidth: 30,
        methodWidth: 0,
        encodingWidth: 0,
        segmentWidths: [500],
        jointsWidth: 64,
      }),
    ).toEqual({ isTruncated: false, visibleSegmentIndices: [0] });
  });

  it('handles empty segments array', () => {
    expect(
      computeTruncation({
        ...defaults,
        containerWidth: 100,
        methodWidth: 50,
        encodingWidth: 0,
        segmentWidths: [],
        jointsWidth: 64,
      }),
    ).toEqual({ isTruncated: false, visibleSegmentIndices: [] });
  });

  // AS-1205: ["header", "J", "htmljs"] — the single-letter middle segment is
  // narrower than the ellipsis pill, so collapsing would WIDEN the row.
  it('does not truncate when collapsing would not make the row narrower', () => {
    expect(
      computeTruncation({
        ...defaults,
        containerWidth: 130,
        methodWidth: 0,
        encodingWidth: 0,
        segmentWidths: [45, 7.4, 54.2],
        jointsWidth: 32,
      }),
    ).toEqual({ isTruncated: false, visibleSegmentIndices: [0, 1, 2] });
  });

  // AS-1205: ResizeObserver reports a device-pixel-snapped width that can be a
  // fraction of a pixel under the getBoundingClientRect sum for a path that
  // exactly fits — that must not count as overflow.
  it('tolerates a sub-pixel container shortfall', () => {
    expect(
      computeTruncation({
        ...defaults,
        containerWidth: 170.609375,
        methodWidth: 0,
        encodingWidth: 0,
        segmentWidths: [44.9921875, 40, 53.625],
        jointsWidth: 32,
      }),
    ).toEqual({ isTruncated: false, visibleSegmentIndices: [0, 1, 2] });
  });
});
