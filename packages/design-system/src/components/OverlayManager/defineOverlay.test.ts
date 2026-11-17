import { describe, expect, it, rs } from '@rstest/core';
import { defineOverlay, type InternalOverlayDefinition } from './defineOverlay';
import type { OverlayProps } from './types';

const Overlay = (_: OverlayProps<boolean>) => null;
const internal = (definition: unknown) => definition as InternalOverlayDefinition;

describe('defineOverlay', () => {
  it('loads the component once and caches it', async () => {
    const load = rs.fn(async () => Overlay);
    const definition = internal(defineOverlay(load));
    expect(await definition.load()).toBe(Overlay);
    expect(await definition.load()).toBe(Overlay);
    expect(load).toHaveBeenCalledTimes(1);
  });

  it('retries after a rejected load', async () => {
    const load = rs
      .fn<() => Promise<typeof Overlay>>()
      .mockRejectedValueOnce(new Error('chunk'))
      .mockResolvedValueOnce(Overlay);
    const definition = internal(defineOverlay(load));
    await expect(definition.load()).rejects.toThrow('chunk');
    expect(await definition.load()).toBe(Overlay);
    expect(load).toHaveBeenCalledTimes(2);
  });

  it('turns a loader that throws synchronously into a rejection', async () => {
    const load = rs
      .fn(() => Promise.resolve(Overlay))
      .mockImplementationOnce(() => {
        throw new Error('sync');
      });
    const definition = internal(defineOverlay(load));
    await expect(definition.preload()).resolves.toBeUndefined();
    await expect(definition.load()).resolves.toBe(Overlay);
    expect(load).toHaveBeenCalledTimes(2);
  });

  it('preload resolves undefined and never rejects', async () => {
    const load = rs.fn(async (): Promise<typeof Overlay> => {
      throw new Error('chunk');
    });
    const definition = internal(defineOverlay(load));
    await expect(definition.preload()).resolves.toBeUndefined();
  });

  it('preload warms the cache', async () => {
    const load = rs.fn(async () => Overlay);
    const definition = internal(defineOverlay(load));
    await definition.preload();
    expect(await definition.load()).toBe(Overlay);
    expect(load).toHaveBeenCalledTimes(1);
  });
});
