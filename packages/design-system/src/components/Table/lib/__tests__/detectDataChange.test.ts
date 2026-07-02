import { describe, expect, it } from 'vitest';
import { detectDataChange } from '../detectDataChange';

const rows = (...ids: string[]) => ids.map(id => ({ id }));

describe('detectDataChange', () => {
  it('returns "none" on first render (no previous first id)', () => {
    expect(detectDataChange(undefined, rows('a', 'b'))).toBe('none');
  });

  it('returns "none" when the first row is unchanged', () => {
    expect(detectDataChange('a', rows('a', 'b', 'c'))).toBe('none');
  });

  it('returns "prepend" when the first id changed but is still present', () => {
    expect(detectDataChange('b', rows('a', 'b', 'c'))).toBe('prepend');
  });

  it('returns "replace" when the previous first id is gone', () => {
    expect(detectDataChange('x', rows('a', 'b', 'c'))).toBe('replace');
  });

  it('returns "replace" when rows became empty', () => {
    expect(detectDataChange('a', rows())).toBe('replace');
  });

  it('returns "prepend" when the old first id moved down and the tail is intact', () => {
    expect(detectDataChange('b', rows('a', 'b', 'c'), 'c')).toBe('prepend');
  });

  it('returns "replace" when the old first id survived but the tail changed (filter reset)', () => {
    expect(detectDataChange('b', rows('a', 'b', 'c', 'd'), 'c')).toBe('replace');
  });
});
