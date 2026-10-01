import { createElement, Fragment } from 'react';
import { describe, expect, it } from '@rstest/core';
import { CodeSnippetContent } from '../CodeSnippetContent';
import { CodeSnippetShowMoreButton } from '../CodeSnippetShowMoreButton';
import { getHiddenLineCount, hasExplicitShowMoreButton, isClamped } from './showMore';

describe('getHiddenLineCount', () => {
  it('returns rows beyond maxLines', () => {
    expect(getHiddenLineCount(10, 4)).toBe(6);
  });

  it('never goes negative', () => {
    expect(getHiddenLineCount(3, 7)).toBe(0);
  });

  it('returns 0 when maxLines is disabled', () => {
    expect(getHiddenLineCount(10, 0)).toBe(0);
    expect(getHiddenLineCount(10, -1)).toBe(0);
  });
});

describe('isClamped', () => {
  it('clamps when at least MIN_HIDDEN_LINES_THRESHOLD (3) rows are hidden and not expanded', () => {
    expect(isClamped(3, false)).toBe(true);
    expect(isClamped(6, false)).toBe(true);
  });

  it('does not clamp below the threshold', () => {
    expect(isClamped(2, false)).toBe(false);
    expect(isClamped(0, false)).toBe(false);
  });

  it('does not clamp when expanded', () => {
    expect(isClamped(6, true)).toBe(false);
  });
});

describe('hasExplicitShowMoreButton', () => {
  it('detects a direct CodeSnippetShowMoreButton child', () => {
    expect(
      hasExplicitShowMoreButton([
        createElement(CodeSnippetContent, { key: 'c' }),
        createElement(CodeSnippetShowMoreButton, { key: 's' }),
      ]),
    ).toBe(true);
  });

  it('ignores other children, strings and nested buttons', () => {
    expect(hasExplicitShowMoreButton(createElement(CodeSnippetContent))).toBe(false);
    expect(hasExplicitShowMoreButton('text')).toBe(false);
    expect(hasExplicitShowMoreButton(null)).toBe(false);
    expect(
      hasExplicitShowMoreButton(
        createElement('div', null, createElement(CodeSnippetShowMoreButton)),
      ),
    ).toBe(false);
  });

  it('matches the real component displayName', () => {
    expect(CodeSnippetShowMoreButton.displayName).toBe('CodeSnippetShowMoreButton');
    expect(hasExplicitShowMoreButton(createElement(Fragment))).toBe(false);
  });
});
