import { describe, expect, it } from 'vitest';
import {
  createStatusCodeInputFilter,
  createStatusCodeNormalizer,
  createStatusCodeSuggestions,
  createStatusCodeValidator,
} from '../lib/statusCode';

describe('createStatusCodeSuggestions', () => {
  const suggest = createStatusCodeSuggestions();

  it('returns all five HTTP class masks for empty input', () => {
    expect(suggest('').map(o => o.value)).toEqual(['1XX', '2XX', '3XX', '4XX', '5XX']);
  });

  it.each([
    ['1', '1XX'],
    ['2', '2XX'],
    ['5', '5XX'],
  ])('returns the matching class mask for single digit %s', (input, mask) => {
    expect(suggest(input).map(o => o.value)).toEqual([mask]);
  });

  it.each([['0'], ['6'], ['9']])('returns empty for a single digit outside [1..5]: %s', input => {
    expect(suggest(input)).toEqual([]);
  });

  it.each([
    ['40', '40X'],
    ['20', '20X'],
    ['12', '12X'],
  ])('returns the narrowed 2-digit mask %s → [%s]', (input, mask) => {
    expect(suggest(input).map(o => o.value)).toEqual([mask]);
  });

  it('returns empty for a 2-digit input whose leading digit is out of range', () => {
    expect(suggest('70')).toEqual([]);
  });

  it('returns the typed 3-digit code as a selectable option', () => {
    const [option] = suggest('401');
    expect(option.value).toBe('401');
    expect(option.badge?.color).toBe('amber');
  });

  it('returns empty for a 3-digit input whose class is out of range', () => {
    expect(suggest('601')).toEqual([]);
  });

  it('returns empty when input has four or more digits', () => {
    expect(suggest('4040')).toEqual([]);
  });

  it('returns empty when input contains non-digit characters', () => {
    expect(suggest('4a')).toEqual([]);
    expect(suggest('abc')).toEqual([]);
  });

  it('trims surrounding whitespace before matching', () => {
    expect(suggest('  4  ').map(o => o.value)).toEqual(['4XX']);
    expect(suggest('  ').map(o => o.value)).toEqual(['1XX', '2XX', '3XX', '4XX', '5XX']);
  });

  describe('with X as placeholder in the typed input', () => {
    it.each([
      ['3X', '3XX'],
      ['3x', '3XX'],
      ['3XX', '3XX'],
      ['3xx', '3XX'],
      ['1XX', '1XX'],
      ['30X', '30X'],
      ['30x', '30X'],
    ])('expands "%s" to mask "%s"', (input, mask) => {
      expect(suggest(input).map(o => o.value)).toEqual([mask]);
    });

    it('rejects inputs where X appears before a digit', () => {
      expect(suggest('3X0')).toEqual([]);
      expect(suggest('X30')).toEqual([]);
    });
  });

  it('derives badge color from the leading digit', () => {
    const byValue = Object.fromEntries(suggest('').map(o => [o.value, o.badge?.color]));
    expect(byValue).toEqual({
      '1XX': 'slate',
      '2XX': 'green',
      '3XX': 'blue',
      '4XX': 'amber',
      '5XX': 'red',
    });
  });

  describe('selectedValues context', () => {
    it('prepends committed values as badged options ahead of masks', () => {
      const result = suggest('', { selectedValues: ['234'] });
      expect(result.map(o => o.value)).toEqual(['234', '1XX', '2XX', '3XX', '4XX', '5XX']);
      expect(result[0].badge).toEqual({ color: 'green', text: '234' });
    });

    it('does not duplicate an entry when the committed value matches the primary', () => {
      const result = suggest('401', { selectedValues: ['401'] });
      expect(result.map(o => o.value)).toEqual(['401']);
    });

    it('filters out committed values whose class is outside [1..5]', () => {
      const result = suggest('', { selectedValues: ['601', '234'] });
      expect(result.map(o => o.value)).toEqual(['234', '1XX', '2XX', '3XX', '4XX', '5XX']);
    });

    it('keeps committed values visible even when the input is invalid', () => {
      const result = suggest('abc', { selectedValues: ['234'] });
      expect(result.map(o => o.value)).toEqual(['234']);
    });
  });
});

describe('createStatusCodeValidator', () => {
  const isInvalid = createStatusCodeValidator();

  it.each([
    ['101', false],
    ['200', false],
    ['404', false],
    ['1XX', false],
    ['5XX', false],
    ['40X', false],
  ])('accepts valid status code or mask %s', (value, expected) => {
    expect(isInvalid(value)).toBe(expected);
  });

  it.each([
    ['4040', 'four digits'],
    ['40', 'two digits'],
    ['4', 'single digit'],
    ['', 'empty'],
    ['4a', 'non-digit chars'],
    ['XXX', 'no digit anchor'],
    ['601', 'class 6 outside [1..5]'],
    ['001', 'class 0 outside [1..5]'],
    ['4X0', 'mask with digit after X'],
  ])('rejects invalid input %s (%s)', value => {
    expect(isInvalid(value)).toBe(true);
  });
});

describe('createStatusCodeInputFilter', () => {
  const accept = createStatusCodeInputFilter();

  it.each(['0', '1', '9', 'x', 'X'])('accepts %s', c => {
    expect(accept(c)).toBe(true);
  });

  it.each(['a', '-', '.', ' '])('rejects %s', c => {
    expect(accept(c)).toBe(false);
  });
});

describe('createStatusCodeNormalizer', () => {
  const normalize = createStatusCodeNormalizer();

  it.each([
    ['2', '2XX'],
    ['22', '22X'],
    ['222', '222'],
    ['4XX', '4XX'],
    ['40X', '40X'],
    ['2x', '2XX'],
    ['4xx', '4XX'],
  ])('pads "%s" to "%s"', (input, expected) => {
    expect(normalize(input)).toBe(expected);
  });

  it('leaves unrecognised input untouched', () => {
    expect(normalize('abc')).toBe('abc');
    expect(normalize('4040')).toBe('4040');
    expect(normalize('')).toBe('');
  });

  it('normalizes numeric shorthand', () => {
    expect(normalize(4)).toBe('4XX');
    expect(normalize(40)).toBe('40X');
    expect(normalize(401)).toBe('401');
  });
});
