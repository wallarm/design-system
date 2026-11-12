import { describe, expect, it } from '@rstest/core';
import { getOverlayBottom } from './OverlayBoundaryContext';

describe('getOverlayBottom', () => {
  it('pins to the viewport without a boundary', () => {
    expect(getOverlayBottom(null)).toBe(window.innerHeight);
    expect(getOverlayBottom({ current: null })).toBe(window.innerHeight);
  });

  it('pins to the boundary bottom when one is provided', () => {
    const el = document.createElement('div');
    el.getBoundingClientRect = () => DOMRect.fromRect({ x: 0, y: 100, width: 800, height: 500 });
    expect(getOverlayBottom({ current: el })).toBe(600);
  });
});
