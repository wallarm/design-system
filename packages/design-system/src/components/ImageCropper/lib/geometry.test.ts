import { describe, expect, it } from '@rstest/core';
import { getCropperGeometry, validateOutputSize } from './geometry';

describe('ImageCropper geometry', () => {
  it('covers a square frame with an undistorted landscape image', () => {
    expect(getCropperGeometry({ width: 400, height: 200 }, { width: 100, height: 100 })).toEqual({
      viewport: { width: 200, height: 100 },
      crop: { x: 50, y: 0, width: 100, height: 100 },
    });
  });

  it('covers a square frame with an undistorted portrait image', () => {
    expect(getCropperGeometry({ width: 200, height: 400 }, { width: 100, height: 100 })).toEqual({
      viewport: { width: 100, height: 200 },
      crop: { x: 0, y: 50, width: 100, height: 100 },
    });
  });

  it('covers a rectangular frame without changing the source aspect ratio', () => {
    const geometry = getCropperGeometry({ width: 300, height: 300 }, { width: 200, height: 100 });
    expect(geometry).toEqual({
      viewport: { width: 200, height: 200 },
      crop: { x: 0, y: 50, width: 200, height: 100 },
    });
  });

  it.each([0, -1, Number.NaN, Number.POSITIVE_INFINITY, 1.5])(
    'rejects invalid output dimensions: %s',
    value => {
      expect(() => validateOutputSize({ width: value, height: 256 })).toThrow(RangeError);
      expect(() => validateOutputSize({ width: 256, height: value })).toThrow(RangeError);
    },
  );

  it('accepts integer output dimensions independently from the display size', () => {
    expect(() => validateOutputSize({ width: 1024, height: 512 })).not.toThrow();
  });
});
