import { describe, expect, it } from '@rstest/core';
import { funnelColumnPath, funnelThicknesses } from './funnelGeometry';

describe('funnelThicknesses', () => {
  it('scales every step to the largest value (140 at most)', () => {
    expect(funnelThicknesses([1000, 500, 250])).toEqual([140, 70, 35]);
  });

  it('never draws a step thinner than the 1px hairline', () => {
    expect(funnelThicknesses([100000, 100, 1])).toEqual([140, 1, 1]);
  });

  it('draws a zero as the minimum line', () => {
    expect(funnelThicknesses([200, 0])).toEqual([140, 1]);
  });

  it('lets a later step be the largest', () => {
    expect(funnelThicknesses([50, 100])).toEqual([70, 140]);
  });

  it('falls back to the minimum when no value is positive or finite', () => {
    expect(funnelThicknesses([0, 0])).toEqual([1, 1]);
    expect(funnelThicknesses([Number.NaN, -5, Number.POSITIVE_INFINITY])).toEqual([1, 1, 1]);
  });
});

describe('funnelColumnPath', () => {
  it('runs from its own thickness to the next one, centered in the 172 band', () => {
    expect(funnelColumnPath(140, 70)).toBe(
      'M0 16 C45 16 55 51 100 51 L100 121 C55 121 45 156 0 156 Z',
    );
  });

  it('is flat when both edges are the same thickness', () => {
    expect(funnelColumnPath(4, 4)).toBe('M0 84 C45 84 55 84 100 84 L100 88 C55 88 45 88 0 88 Z');
  });

  it('grows on top and bottom for the halos', () => {
    expect(funnelColumnPath(140, 70, 12)).toBe(
      'M0 4 C45 4 55 39 100 39 L100 133 C55 133 45 168 0 168 Z',
    );
  });
});
