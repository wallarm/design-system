import { describe, expect, it } from 'vitest';
import { areItemsShallowEqual, resolveVisibleItems } from '../OverflowList.helpers';

describe('areItemsShallowEqual', () => {
  it('returns false when the previous list is null', () => {
    expect(areItemsShallowEqual(null, ['a'])).toBe(false);
  });

  it('returns false when lengths differ', () => {
    expect(areItemsShallowEqual(['a'], ['a', 'b'])).toBe(false);
  });

  it('returns false when an item differs', () => {
    expect(areItemsShallowEqual(['a', 'b'], ['a', 'c'])).toBe(false);
  });

  it('returns true for equal contents in a fresh array identity', () => {
    expect(areItemsShallowEqual(['a', 'b'], ['a', 'b'])).toBe(true);
  });

  it('returns true for two empty lists', () => {
    expect(areItemsShallowEqual([], [])).toBe(true);
  });
});

describe('resolveVisibleItems', () => {
  const items = ['a', 'b', 'c', 'd'];

  it("returns the engine's split untouched when the floor is satisfied", () => {
    const result = resolveVisibleItems({
      items,
      visibleItems: ['a', 'b'],
      hiddenItems: ['c', 'd'],
      minVisibleItems: 2,
    });
    expect(result).toEqual({ visibleItems: ['a', 'b'], hiddenItems: ['c', 'd'] });
  });

  it('forces the first minVisibleItems visible when the engine collapses below the floor', () => {
    const result = resolveVisibleItems({
      items,
      visibleItems: ['a'],
      hiddenItems: ['b', 'c', 'd'],
      minVisibleItems: 3,
    });
    expect(result).toEqual({ visibleItems: ['a', 'b', 'c'], hiddenItems: ['d'] });
  });

  it('does not expand beyond the available items', () => {
    const result = resolveVisibleItems({
      items: ['a', 'b'],
      visibleItems: [],
      hiddenItems: ['a', 'b'],
      minVisibleItems: 5,
    });
    // List is shorter than the floor → engine split is kept as-is.
    expect(result).toEqual({ visibleItems: [], hiddenItems: ['a', 'b'] });
  });

  it('is a no-op when minVisibleItems is 0', () => {
    const result = resolveVisibleItems({
      items,
      visibleItems: ['a'],
      hiddenItems: ['b', 'c', 'd'],
      minVisibleItems: 0,
    });
    expect(result).toEqual({ visibleItems: ['a'], hiddenItems: ['b', 'c', 'd'] });
  });
});
