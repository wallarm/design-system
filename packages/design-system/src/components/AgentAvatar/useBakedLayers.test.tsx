import { afterEach, beforeEach, describe, expect, it } from '@rstest/core';
import { act, renderHook } from '@testing-library/react';

import { type BakeRunner, isRetained, retainedCount } from '../../lib/agent-characters/bake';
import { layerKey, useBakedLayers } from './useBakedLayers';

const layer = (d: string, col = '#3F63DB') => ({ d, col, mat: 'felt' as const, veil: false });
const tick = (ms = 0) => act(() => new Promise(r => setTimeout(r, ms)));
let urls = 0;
const proto = SVGElement.prototype as unknown as { getBBox?: () => DOMRect };
const img = HTMLImageElement.prototype as unknown as { decode?: () => Promise<void> };

const saved = { create: URL.createObjectURL, revoke: URL.revokeObjectURL };
beforeEach(() => {
  proto.getBBox = () => ({ x: 0, y: 0, width: 50, height: 40 }) as DOMRect;
  img.decode = () => Promise.resolve();
  URL.createObjectURL = () => `blob:test/${++urls}`;
  URL.revokeObjectURL = () => {};
});
afterEach(() => {
  delete proto.getBBox;
  URL.createObjectURL = saved.create;
  URL.revokeObjectURL = saved.revoke;
});

describe('useBakedLayers', () => {
  it('bakes each layer once decoded, at the page size for the DPR', async () => {
    const sizes: number[] = [];
    const run: BakeRunner = async j => {
      sizes.push(j.P);
      return new Blob(['x']);
    };
    const { result } = renderHook(() => useBakedLayers([layer('M1 1H40V30Z')], 72, run));
    expect(result.current).toEqual({});
    await tick(5);
    const got = result.current[layerKey(layer('M1 1H40V30Z'))];
    expect(got?.url).toMatch(/^blob:/);
    expect(got?.R).toBe(54); // ceil(max(50, 40) + 2 × 2)
    expect(sizes).toEqual([Math.ceil(54 * (72 / 136) * Math.min(2, window.devicePixelRatio || 1))]);
  });

  it('ignores bakes that finish after unmount and keeps nothing alive for them', async () => {
    let release: (b: Blob) => void = () => undefined;
    const run: BakeRunner = () => new Promise(r => (release = r));
    const l = layer('M2 2H40V30Z');
    const before = retainedCount();
    const { unmount } = renderHook(() => useBakedLayers([l], 72, run));
    unmount();
    release(new Blob(['x']));
    await tick(5);
    expect(retainedCount()).toBe(before);
  });

  it('keeps its layers retained while mounted and releases them on unmount', async () => {
    const run: BakeRunner = async () => new Blob(['x']);
    const l = layer('M5 5H40V30Z');
    const { result, unmount } = renderHook(() => useBakedLayers([l], 72, run));
    await tick(5);
    const key = result.current[layerKey(l)]?.key as string;
    expect(isRetained(key)).toBe(true);
    unmount();
    expect(isRetained(key)).toBe(false);
  });

  it('keeps the previous bake until the new size is decoded', async () => {
    let release: (b: Blob) => void = () => {};
    let n = 0;
    const run: BakeRunner = () =>
      ++n === 1 ? Promise.resolve(new Blob(['a'])) : new Promise(r => (release = r));
    const l = layer('M3 3H40V30Z');
    const { result, rerender } = renderHook(({ size }) => useBakedLayers([l], size, run), {
      initialProps: { size: 72 },
    });
    await tick(5);
    const first = result.current[layerKey(l)]?.url;
    rerender({ size: 120 });
    await tick(5);
    expect(result.current[layerKey(l)]?.url).toBe(first);
    release(new Blob(['b']));
    await tick(5);
    expect(result.current[layerKey(l)]?.url).not.toBe(first);
  });

  it('leaves a layer unbaked when its bake fails', async () => {
    const run: BakeRunner = () => Promise.reject(new Error('no canvas'));
    const { result } = renderHook(() => useBakedLayers([layer('M4 4H40V30Z')], 72, run));
    await tick(5);
    expect(result.current).toEqual({});
  });
});
