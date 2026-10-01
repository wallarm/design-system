import { SearchQuery } from '@codemirror/search';
import { EditorState } from '@codemirror/state';
import { describe, expect, it } from '@rstest/core';
import { countMatches, MATCH_COUNT_LIMIT, matchCountMessage } from './searchMatches';

describe('countMatches', () => {
  const state = EditorState.create({ doc: 'foo bar foo\nFOO food' });

  it('counts case-insensitive matches by default', () => {
    expect(countMatches(state, new SearchQuery({ search: 'foo' }))).toBe(4);
  });

  it('respects caseSensitive and wholeWord', () => {
    expect(countMatches(state, new SearchQuery({ search: 'foo', caseSensitive: true }))).toBe(3);
    expect(countMatches(state, new SearchQuery({ search: 'foo', wholeWord: true }))).toBe(3);
  });

  it('returns 0 for an empty or invalid query', () => {
    expect(countMatches(state, new SearchQuery({ search: '' }))).toBe(0);
    expect(countMatches(state, new SearchQuery({ search: '(', regexp: true }))).toBe(0);
  });

  it('stops counting after the limit', () => {
    const big = EditorState.create({ doc: 'a'.repeat(MATCH_COUNT_LIMIT + 50) });
    expect(countMatches(big, new SearchQuery({ search: 'a' }))).toBe(MATCH_COUNT_LIMIT + 1);
  });
});

describe('matchCountMessage', () => {
  it('formats counts for screen readers', () => {
    expect(matchCountMessage(0)).toBe('No matches');
    expect(matchCountMessage(1)).toBe('1 match');
    expect(matchCountMessage(3)).toBe('3 matches');
    expect(matchCountMessage(MATCH_COUNT_LIMIT + 1)).toBe('1000+ matches');
  });
});
