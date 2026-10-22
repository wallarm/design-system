import { describe, expect, it } from '@rstest/core';
import { resolveColumnWidth } from './resolveColumnWidth';

describe('resolveColumnWidth', () => {
  it('caps wide steps at 32px', () => {
    // Figma: 5 steps over a 750px plot.
    expect(resolveColumnWidth(150)).toBe(32);
    // Figma: 7 steps over a 378px plot.
    expect(resolveColumnWidth(54)).toBe(32);
  });

  it('keeps a 22px gap between the bounds', () => {
    // Figma: 9 steps over a 378px plot → "20px adjusted width".
    expect(resolveColumnWidth(42)).toBe(20);
  });

  it('holds 16px once the gap would make the column narrower', () => {
    expect(resolveColumnWidth(30)).toBe(16);
  });

  it('rounds to whole pixels', () => {
    // A 428px card is a 426px box inside its border: 7 steps → a 53.7px band.
    expect(resolveColumnWidth(376 / 7)).toBe(32);
    expect(resolveColumnWidth(41.6)).toBe(20);
  });

  it('stays under the step, so recharts keeps the width instead of its 90% fallback', () => {
    expect(resolveColumnWidth(16)).toBe(15);
    expect(resolveColumnWidth(12)).toBe(11);
    expect(resolveColumnWidth(12.6)).toBe(12);
  });

  it('returns 0 for an empty or unmeasured band', () => {
    expect(resolveColumnWidth(1)).toBe(0);
    expect(resolveColumnWidth(0)).toBe(0);
    expect(resolveColumnWidth(Number.NaN)).toBe(0);
  });
});
