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
  it('ramps 3 blue steps 400 → 600 and flips them in dark', () => {
    expect(funnelStepFills(3, 'blue', 'tint')).toEqual([
      { light: 'var(--color-blue-400)', dark: 'var(--color-blue-600)' },
      { light: 'var(--color-blue-500)', dark: 'var(--color-blue-500)' },
      { light: 'var(--color-blue-600)', dark: 'var(--color-blue-400)' },
    ]);
  });
  it('starts gray: slate-300 then hue-600', () => {
    expect(funnelStepFills(3, 'red', 'gray')).toEqual([
      { light: 'var(--color-slate-300)', dark: 'var(--color-slate-700)' },
      { light: 'var(--color-red-600)', dark: 'var(--color-red-400)' },
      { light: 'var(--color-red-600)', dark: 'var(--color-red-400)' },
    ]);
  });
  it('maps brand to w-orange and ramps 6 steps from 200', () => {
    expect(funnelStepFills(6, 'brand', 'tint')[0]).toEqual({
      light: 'var(--color-w-orange-200)',
      dark: 'var(--color-w-orange-800)',
    });
  });
  it('clamps counts outside 2–6 to the nearest ramp', () => {
    expect(funnelStepFills(1, 'blue', 'tint')).toEqual([
      { light: 'var(--color-blue-600)', dark: 'var(--color-blue-400)' },
    ]);
    expect(funnelStepFills(8, 'blue', 'tint').at(-1)).toEqual({
      light: 'var(--color-blue-700)',
      dark: 'var(--color-blue-300)',
    });
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
