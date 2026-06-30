import { describe, expect, it } from 'vitest';
import { computeColumnLayout } from '../computeColumnLayout';

const defs = [
  { columnId: 'a', pin: 'left' as const, width: 100 },
  { columnId: 'b', pin: 'left' as const, width: 60 },
  { columnId: 'c', width: 200 },
  { columnId: 'd', pin: 'right' as const, width: 48 },
];

describe('computeColumnLayout', () => {
  it('stacks left-pinned offsets and flags the last left-pinned', () => {
    const { resolved } = computeColumnLayout(defs);
    expect(resolved.a.stickyStyle).toEqual({ position: 'sticky', left: '0px' });
    expect(resolved.b.stickyStyle).toEqual({ position: 'sticky', left: '100px' });
    expect(resolved.a.lastPinnedLeft).toBe(false);
    expect(resolved.b.lastPinnedLeft).toBe(true);
    expect(resolved.c.stickyStyle).toEqual({});
  });

  it('computes right-pinned offset from the right edge and flags first-right', () => {
    const { resolved } = computeColumnLayout(defs);
    expect(resolved.d.stickyStyle).toEqual({ position: 'sticky', right: '0px' });
    expect(resolved.d.firstPinnedRight).toBe(true);
  });

  it('drops hidden columns from order and from offset math', () => {
    const { resolved, order } = computeColumnLayout(defs, { visibility: { b: false } });
    expect(order).toEqual(['a', 'c', 'd']);
    expect(resolved.b.hidden).toBe(true);
    expect(resolved.a.lastPinnedLeft).toBe(true);
  });

  it('applies sizing-state width over the declared width', () => {
    const { resolved } = computeColumnLayout(defs, { sizing: { a: 140 } });
    expect(resolved.a.width).toBe(140);
    expect(resolved.b.stickyStyle.left).toBe('140px');
  });

  it('applies a pinning-state override over the declared pin', () => {
    const { resolved } = computeColumnLayout(defs, { pinning: { left: ['c'] } });
    expect(resolved.c.pin).toBe('left');
    expect(resolved.c.stickyStyle.position).toBe('sticky');
  });
});
