import type { CSSProperties } from 'react';
import { describe, expect, it } from 'vitest';
import { cssPropertiesToString } from './lines';

/** Consumer styles may carry custom properties and loose values that `CSSProperties` does not model. */
const looseStyle = (value: Record<string, unknown>): CSSProperties => value as CSSProperties;

describe('cssPropertiesToString', () => {
  it('returns an empty string for undefined or empty styles', () => {
    expect(cssPropertiesToString(undefined)).toBe('');
    expect(cssPropertiesToString({})).toBe('');
  });

  it('converts camelCase properties to kebab-case', () => {
    expect(cssPropertiesToString({ backgroundColor: 'red', textDecorationLine: 'underline' })).toBe(
      'background-color: red; text-decoration-line: underline',
    );
  });

  it('adds px to numbers except unitless properties and zero', () => {
    expect(
      cssPropertiesToString({ paddingLeft: 4, opacity: 0.5, lineHeight: 2, zIndex: 3, margin: 0 }),
    ).toBe('padding-left: 4px; opacity: 0.5; line-height: 2; z-index: 3; margin: 0');
  });

  it('keeps custom properties verbatim and never adds px to them', () => {
    expect(
      cssPropertiesToString(looseStyle({ '--line-accent': 3, '--line-color': ' blue ' })),
    ).toBe('--line-accent: 3; --line-color: blue');
  });

  it('prefixes vendor properties like react-dom does', () => {
    expect(cssPropertiesToString({ WebkitLineClamp: 2, msTransform: 'none' })).toBe(
      '-webkit-line-clamp: 2; -ms-transform: none',
    );
  });

  it('skips undefined, null, boolean and empty-string values', () => {
    expect(
      cssPropertiesToString(
        looseStyle({
          color: undefined,
          fontStyle: '',
          outline: null,
          display: false,
          fontWeight: 600,
        }),
      ),
    ).toBe('font-weight: 600');
  });
});
