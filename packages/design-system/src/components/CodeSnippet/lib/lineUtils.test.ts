import { describe, expect, it } from 'vitest';
import type { Token } from '../adapters/types';
import { LINE_COLOR_STYLES, LINE_TEXT_STYLE_CLASSES } from './lineStyles';
import { getLineTextStyles, splitTextByRanges, splitTokensByRanges } from './lineUtils';

describe('splitTextByRanges', () => {
  it('splits text at range boundaries', () => {
    const result = splitTextByRanges('Accept: application/json', [{ start: 8, end: 24 }]);

    expect(result).toEqual([
      { content: 'Accept: ' },
      { content: 'application/json', rangeColor: undefined },
    ]);
  });

  it('handles empty ranges array', () => {
    const result = splitTextByRanges('hello world', []);

    expect(result).toEqual([{ content: 'hello world' }]);
  });

  it('handles out-of-bounds ranges', () => {
    const result = splitTextByRanges('short', [{ start: 10, end: 20 }]);

    // Range is entirely past text length — skipped, remaining text emitted
    expect(result).toEqual([{ content: 'short' }]);
  });

  it('handles overlapping ranges', () => {
    const result = splitTextByRanges('abcdefgh', [
      { start: 0, end: 4, color: 'danger' },
      { start: 2, end: 6, color: 'info' },
    ]);

    // Sorted by start: danger [0,4), info [2,6)
    // danger covers chars 0-3, info covers chars 2-5 (overlap at 2-3 re-emitted)
    expect(result).toEqual([
      { content: 'abcd', rangeColor: LINE_COLOR_STYLES.danger.text },
      { content: 'cdef', rangeColor: LINE_COLOR_STYLES.info.text },
      { content: 'gh' },
    ]);
  });

  it('applies line color as fallback when no range color', () => {
    const result = splitTextByRanges('hello world', [{ start: 0, end: 5 }], 'success');

    expect(result).toEqual([
      { content: 'hello', rangeColor: LINE_COLOR_STYLES.success.text },
      { content: ' world' },
    ]);
  });
});

describe('splitTokensByRanges', () => {
  it('splits tokens across range boundaries', () => {
    // Single token "Accept: application/json", range highlights "application/json"
    const tokens: Token[] = [{ content: 'Accept: application/json', type: 'plain' }];
    const result = splitTokensByRanges(tokens, [{ start: 8, end: 24, color: 'danger' }]);

    expect(result).toEqual([
      { content: 'Accept: ', type: 'plain' },
      { content: 'application/json', type: 'plain', rangeColor: LINE_COLOR_STYLES.danger.text },
    ]);
  });

  it('handles multi-token ranges', () => {
    // Range spans across two tokens: "const " (keyword) + "x" (plain) + " = 42" (plain)
    const tokens: Token[] = [
      { content: 'const ', type: 'keyword' },
      { content: 'x', type: 'variable' },
      { content: ' = ', type: 'operator' },
      { content: '42', type: 'number' },
    ];
    // Range [0, 8) covers "const " (6) + "x" (1) + " " (1 of " = ")
    const result = splitTokensByRanges(tokens, [{ start: 0, end: 8, color: 'info' }]);

    expect(result).toEqual([
      { content: 'const ', type: 'keyword', rangeColor: LINE_COLOR_STYLES.info.text },
      { content: 'x', type: 'variable', rangeColor: LINE_COLOR_STYLES.info.text },
      { content: ' ', type: 'operator', rangeColor: LINE_COLOR_STYLES.info.text },
      { content: '= ', type: 'operator' },
      { content: '42', type: 'number' },
    ]);
  });

  it('preserves token types through splits', () => {
    const tokens: Token[] = [{ content: 'hello', type: 'string', className: 'custom-class' }];
    // Range highlights middle portion "ell"
    const result = splitTokensByRanges(tokens, [{ start: 1, end: 4, color: 'success' }]);

    expect(result).toEqual([
      { content: 'h', type: 'string', className: 'custom-class' },
      {
        content: 'ell',
        type: 'string',
        className: 'custom-class',
        rangeColor: LINE_COLOR_STYLES.success.text,
      },
      { content: 'o', type: 'string', className: 'custom-class' },
    ]);
  });
});

describe('getLineTextStyles', () => {
  it('returns correct classes for color and textStyle', () => {
    const result = getLineTextStyles({ color: 'danger', textStyle: 'italic' });

    expect(result).toEqual({
      colorClass: LINE_COLOR_STYLES.danger.text,
      textStyleClass: LINE_TEXT_STYLE_CLASSES.italic,
      className: undefined,
      style: undefined,
    });
  });

  it('suppresses color class when ranges are present', () => {
    const result = getLineTextStyles({
      color: 'info',
      ranges: [{ start: 0, end: 5 }],
    });

    expect(result).toEqual({
      colorClass: undefined,
      textStyleClass: undefined,
      className: undefined,
      style: undefined,
    });
  });

  it('merges custom className and style', () => {
    const customStyle = { fontWeight: 'bold' as const };
    const result = getLineTextStyles({
      color: 'success',
      textStyle: 'medium',
      className: 'my-custom-class',
      style: customStyle,
    });

    expect(result).toEqual({
      colorClass: LINE_COLOR_STYLES.success.text,
      textStyleClass: LINE_TEXT_STYLE_CLASSES.medium,
      className: 'my-custom-class',
      style: customStyle,
    });
  });
});
