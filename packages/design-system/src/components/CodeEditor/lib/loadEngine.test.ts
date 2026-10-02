import { describe, expect, it } from '@rstest/core';
import { loadEngine } from './loadEngine';

describe('loadEngine', () => {
  it('returns one cached promise for every caller', () => {
    expect(loadEngine()).toBe(loadEngine());
  });

  it('resolves to the engine module', async () => {
    const engine = await loadEngine();
    expect(typeof engine.createEditor).toBe('function');
  });
});
