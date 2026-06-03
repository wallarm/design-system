import { describe, expect, it } from 'vitest';
import { getRowKey } from '../getRowKey';

describe('getRowKey', () => {
  const rows = [{ id: 'a' }, { id: 'b' }];

  it('returns the row id at the index', () => {
    expect(getRowKey(rows, 1)).toBe('b');
  });

  it('falls back to the index when the row is missing', () => {
    expect(getRowKey(rows, 5)).toBe(5);
  });
});
