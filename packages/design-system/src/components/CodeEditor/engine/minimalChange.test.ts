import { EditorState } from '@codemirror/state';
import { describe, expect, it } from '@rstest/core';
import { minimalChange } from './index';

const apply = (from: string, to: string): string => {
  const changes = minimalChange(from, to);
  if (!changes) return from;
  return EditorState.create({ doc: from }).update({ changes }).state.doc.toString();
};

describe('minimalChange', () => {
  it('returns null for equal strings', () => {
    expect(minimalChange('same', 'same')).toBeNull();
    expect(minimalChange('', '')).toBeNull();
  });

  it('replaces only the differing middle', () => {
    expect(minimalChange('hello world', 'hello brave world')).toEqual({
      from: 6,
      to: 6,
      insert: 'brave ',
    });
    expect(minimalChange('abcdef', 'abXYef')).toEqual({ from: 2, to: 4, insert: 'XY' });
  });

  it('handles pure insertions and deletions at both ends', () => {
    expect(minimalChange('abc', 'abcd')).toEqual({ from: 3, to: 3, insert: 'd' });
    expect(minimalChange('abc', 'zabc')).toEqual({ from: 0, to: 0, insert: 'z' });
    expect(minimalChange('abcd', 'abc')).toEqual({ from: 3, to: 4, insert: '' });
    expect(minimalChange('', 'new')).toEqual({ from: 0, to: 0, insert: 'new' });
    expect(minimalChange('old', '')).toEqual({ from: 0, to: 3, insert: '' });
  });

  it('does not let prefix and suffix overlap on repeated characters', () => {
    expect(minimalChange('aaa', 'aaaa')).toEqual({ from: 3, to: 3, insert: 'a' });
    expect(apply('aaa', 'aaaa')).toBe('aaaa');
    expect(apply('abab', 'ab')).toBe('ab');
  });

  it('never splits a surrogate pair', () => {
    const grinning = String.fromCodePoint(0x1f600); // D83D DE00
    const beaming = String.fromCodePoint(0x1f601); // D83D DE01 — same high surrogate
    const squared = String.fromCodePoint(0x1f200); // D83C DE00 — same low surrogate

    expect(minimalChange(`a${grinning}b`, `a${beaming}b`)).toEqual({
      from: 1,
      to: 3,
      insert: beaming,
    });
    expect(minimalChange(`${squared}y`, `${grinning}y`)).toEqual({
      from: 0,
      to: 2,
      insert: grinning,
    });
  });

  it('always produces the target document', () => {
    const pairs: [string, string][] = [
      ['GET / HTTP/1.1\nHost: a', 'POST / HTTP/1.1\nHost: a'],
      ['{\n  "a": 1\n}', '{\n  "a": 12,\n  "b": 2\n}'],
      ['line1\nline2\nline3', 'line1\nline3'],
    ];
    for (const [from, to] of pairs) expect(apply(from, to)).toBe(to);
  });
});
