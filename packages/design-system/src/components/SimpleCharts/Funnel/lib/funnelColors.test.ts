import { describe, expect, it } from '@rstest/core';
import { funnelFillClasses } from '../classes';
import { funnelTintShades, resolveFunnelFills } from './funnelColors';

describe('funnel colors', () => {
  it('follows the tint ramp for 2 to 6 steps', () => {
    expect(funnelTintShades(2)).toEqual([500, 600]);
    expect(funnelTintShades(3)).toEqual([400, 500, 600]);
    expect(funnelTintShades(4)).toEqual([400, 500, 600, 700]);
    expect(funnelTintShades(5)).toEqual([300, 400, 500, 600, 700]);
    expect(funnelTintShades(6)).toEqual([200, 300, 400, 500, 600, 700]);
  });

  it('handles counts outside the supported range', () => {
    expect(funnelTintShades(0)).toEqual([]);
    expect(funnelTintShades(1)).toEqual([600]);
    expect(funnelTintShades(8)).toEqual([200, 300, 400, 500, 600, 700, 700, 700]);
  });

  it('resolves tint fills to palette classes that flip on the dark theme', () => {
    expect(resolveFunnelFills('blue', 3)).toEqual([
      'fill-blue-400 [[data-theme=dark]_&]:fill-blue-600',
      'fill-blue-500 [[data-theme=dark]_&]:fill-blue-500',
      'fill-blue-600 [[data-theme=dark]_&]:fill-blue-400',
    ]);
  });

  it('maps brand to the orange palette', () => {
    expect(resolveFunnelFills('brand', 2)[1]).toBe(
      'fill-w-orange-600 [[data-theme=dark]_&]:fill-w-orange-400',
    );
  });

  it('starts gray: slate 300 first, then the hue on 600', () => {
    expect(resolveFunnelFills('red', 3, 'gray')).toEqual([
      'fill-slate-300 [[data-theme=dark]_&]:fill-slate-700',
      'fill-red-600 [[data-theme=dark]_&]:fill-red-400',
      'fill-red-600 [[data-theme=dark]_&]:fill-red-400',
    ]);
  });

  it('has a class for every hue on every shade, flipped to 1000 minus it', () => {
    for (const [hue, shades] of Object.entries(funnelFillClasses)) {
      const prefix = hue === 'brand' ? 'w-orange' : hue;
      for (const [shade, classes] of Object.entries(shades)) {
        expect(classes).toBe(
          `fill-${prefix}-${shade} [[data-theme=dark]_&]:fill-${prefix}-${1000 - Number(shade)}`,
        );
      }
    }
  });
});
