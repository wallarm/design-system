import { describe, expect, it } from '@rstest/core';
import {
  funnelSegmentPath,
  funnelStepFills,
  funnelThicknesses,
  sanitizeFunnelValue,
} from './funnelGeometry';

describe('funnelThicknesses', () => {
  it('scales to the largest value at 140px', () => {
    expect(funnelThicknesses([1000, 500, 250])).toEqual([140, 70, 35]);
  });
  it('floors tiny and zero steps at 4px', () => {
    expect(funnelThicknesses([1000, 100, 1])).toEqual([140, 14, 4]);
    expect(funnelThicknesses([1000, 0])).toEqual([140, 4]);
  });
  it('draws all-zero data at 4px without NaN', () => {
    expect(funnelThicknesses([0, 0])).toEqual([4, 4]);
  });
  it('treats negative and non-finite values as 0', () => {
    expect(funnelThicknesses([100, -5, Number.NaN, Infinity])).toEqual([140, 4, 4, 4]);
  });
  it('lets a later step be bigger', () => {
    expect(funnelThicknesses([50, 100])).toEqual([70, 140]);
  });
});

describe('funnelSegmentPath', () => {
  it('matches the Figma body for 140 → 17.5', () => {
    // Figma Step 1 body: top 16 → 77.25 (band-relative incl. 4px inset), flat tangents at 0.45 / 0.55
    expect(funnelSegmentPath(140, 17.5, 0)).toBe(
      'M0 16C0.45 16 0.55 77.25 1 77.25V94.75C0.55 94.75 0.45 156 0 156Z',
    );
  });
  it('grows halos symmetrically', () => {
    expect(funnelSegmentPath(140, 140, 12)).toBe(
      'M0 4C0.45 4 0.55 4 1 4V168C0.55 168 0.45 168 0 168Z',
    );
  });
});

describe('funnelStepFills', () => {
  it('tint ramps light to dark; dark theme mirrors the shade', () => {
    expect(funnelStepFills(3, 'blue', 'tint')).toEqual([
      'fill-blue-400 in-data-[theme=dark]:fill-blue-600',
      'fill-blue-500 in-data-[theme=dark]:fill-blue-500',
      'fill-blue-600 in-data-[theme=dark]:fill-blue-400',
    ]);
  });
  it('gray start: slate/300 first, the rest on {hue}-600', () => {
    expect(funnelStepFills(3, 'red', 'gray')).toEqual([
      'fill-slate-300 in-data-[theme=dark]:fill-slate-700',
      'fill-red-600 in-data-[theme=dark]:fill-red-400',
      'fill-red-600 in-data-[theme=dark]:fill-red-400',
    ]);
  });
  it('brand maps to w-orange; 6 steps reach 200', () => {
    expect(funnelStepFills(6, 'brand', 'tint')[0]).toBe(
      'fill-w-orange-200 in-data-[theme=dark]:fill-w-orange-800',
    );
  });
  it('out of range: 1 step is 600, extra steps stay on 700', () => {
    expect(funnelStepFills(1, 'blue', 'tint')).toEqual([
      'fill-blue-600 in-data-[theme=dark]:fill-blue-400',
    ]);
    expect(funnelStepFills(8, 'blue', 'tint').at(-1)).toBe(
      'fill-blue-700 in-data-[theme=dark]:fill-blue-300',
    );
  });
});

describe('sanitizeFunnelValue', () => {
  it('maps negative and non-finite to 0, keeps the rest', () => {
    expect(sanitizeFunnelValue(-5)).toBe(0);
    expect(sanitizeFunnelValue(Number.NaN)).toBe(0);
    expect(sanitizeFunnelValue(Infinity)).toBe(0);
    expect(sanitizeFunnelValue(7)).toBe(7);
    expect(sanitizeFunnelValue(0)).toBe(0);
  });
});
