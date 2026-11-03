import { afterEach, describe, expect, it } from '@rstest/core';

import { getRuntime, RUNTIME_KEY } from '../../../lib/agent-characters/runtime';
import { subscribeFrames } from './subscribeFrames';

afterEach(() => {
  delete (globalThis as Record<symbol, unknown>)[RUNTIME_KEY];
});

describe('subscribeFrames (story-only frame meter)', () => {
  it('feeds every meter and leaves the hook empty when they unmount out of order', () => {
    const rt = getRuntime();
    const a: number[] = [];
    const b: number[] = [];
    const offA = subscribeFrames(ms => {
      a.push(ms);
    });
    const offB = subscribeFrames(ms => {
      b.push(ms);
    });
    rt.onFrame?.(0.5);
    expect([a, b]).toEqual([[0.5], [0.5]]);
    offA(); // the first one goes first
    rt.onFrame?.(0.7);
    expect([a, b]).toEqual([[0.5], [0.5, 0.7]]);
    offB();
    expect(rt.onFrame).toBeUndefined();
  });
});
