import { describe, expect, it } from 'vitest';
import {
  createStatusCodeInputFilter,
  createStatusCodeNormalizer,
  createStatusCodeSuggestions,
  createStatusCodeValidator,
} from '../lib/statusCode';

describe('createStatusCodeSuggestions', () => {
  it('returns all available masks for empty input', () => {
    const suggest = createStatusCodeSuggestions({ codes: ['2', '3', '4', '5'] });
    const result = suggest('');
    expect(result.map(o => o.value)).toEqual(['2XX', '3XX', '4XX', '5XX']);
  });

  it('returns the matching 1-digit mask when the digit is a known root', () => {
    const suggest = createStatusCodeSuggestions({ codes: ['2', '3', '4', '5'] });
    expect(suggest('4').map(o => o.value)).toEqual(['4XX']);
    expect(suggest('2').map(o => o.value)).toEqual(['2XX']);
  });

  it('returns empty when a 1-digit input is not in maskRoots', () => {
    const suggest = createStatusCodeSuggestions({ codes: ['2', '3', '4', '5'] });
    expect(suggest('1')).toEqual([]);
    expect(suggest('6')).toEqual([]);
  });

  it('returns the narrowed 2-digit mask when the leading digit is a known root', () => {
    const suggest = createStatusCodeSuggestions({ codes: ['2', '3', '4', '5'] });
    expect(suggest('40').map(o => o.value)).toEqual(['40X']);
    expect(suggest('20').map(o => o.value)).toEqual(['20X']);
  });

  it('returns empty for a 2-digit input whose leading digit is not a known root', () => {
    const suggest = createStatusCodeSuggestions({ codes: ['2', '3', '4', '5'] });
    expect(suggest('70')).toEqual([]);
    expect(suggest('10')).toEqual([]);
  });

  it('returns the typed 3-digit code as a selectable option when its class is known', () => {
    const suggest = createStatusCodeSuggestions({ codes: ['2', '3', '4', '5'] });
    const [option] = suggest('401');
    expect(option.value).toBe('401');
    expect(option.label).toBe('401');
    expect(option.badge?.color).toBe('amber');
    expect(option.badge?.text).toBe('401');
  });

  it('returns empty for a 3-digit input whose class is not in maskRoots', () => {
    const suggest = createStatusCodeSuggestions({ codes: ['2', '3', '4', '5'] });
    expect(suggest('101')).toEqual([]);
    expect(suggest('601')).toEqual([]);
  });

  it('returns empty when input has four or more digits', () => {
    const suggest = createStatusCodeSuggestions({ codes: ['2', '3', '4', '5'] });
    expect(suggest('4040')).toEqual([]);
  });

  it('returns empty when input contains non-digit characters', () => {
    const suggest = createStatusCodeSuggestions({ codes: ['2', '3', '4', '5'] });
    expect(suggest('4a')).toEqual([]);
    expect(suggest('abc')).toEqual([]);
    expect(suggest('4.')).toEqual([]);
  });

  it('trims surrounding whitespace before matching', () => {
    const suggest = createStatusCodeSuggestions({ codes: ['2', '3', '4', '5'] });
    expect(suggest('  4  ').map(o => o.value)).toEqual(['4XX']);
    expect(suggest('  ').map(o => o.value)).toEqual(['2XX', '3XX', '4XX', '5XX']);
  });

  describe('with X as placeholder in the typed input', () => {
    const suggest = createStatusCodeSuggestions({ codes: ['1', '2', '3', '4', '5'] });

    it.each([
      ['3X', '3XX'],
      ['3x', '3XX'],
      ['3XX', '3XX'],
      ['3xx', '3XX'],
      ['4X', '4XX'],
      ['1XX', '1XX'],
      ['30X', '30X'],
      ['30x', '30X'],
    ])('expands "%s" to mask "%s"', (input, mask) => {
      const [option] = suggest(input);
      expect(option.value).toBe(mask);
    });

    it('rejects inputs where X appears before a digit', () => {
      expect(suggest('3X0')).toEqual([]);
      expect(suggest('X30')).toEqual([]);
    });
  });

  it('ignores 3-char entries and other lengths in codes', () => {
    const suggest = createStatusCodeSuggestions({
      codes: ['2', '3', '4', '5', '200', '201', '40', '4040', '', '404'],
    });
    expect(suggest('').map(o => o.value)).toEqual(['2XX', '3XX', '4XX', '5XX']);
  });

  it('ignores 1-char entries outside the valid HTTP range', () => {
    const suggest = createStatusCodeSuggestions({
      codes: ['0', '2', '4', '6', '9', 'a'],
    });
    expect(suggest('').map(o => o.value)).toEqual(['2XX', '4XX']);
  });

  it('returns empty when codes is undefined', () => {
    const suggest = createStatusCodeSuggestions();
    expect(suggest('')).toEqual([]);
    expect(suggest('4')).toEqual([]);
    expect(suggest('40')).toEqual([]);
  });

  it('returns empty when codes is an empty array', () => {
    const suggest = createStatusCodeSuggestions({ codes: [] });
    expect(suggest('')).toEqual([]);
    expect(suggest('4')).toEqual([]);
  });

  it('accepts the full backend example and shows only available masks', () => {
    const suggest = createStatusCodeSuggestions({
      codes: [
        '2',
        '3',
        '4',
        '5',
        '200',
        '201',
        '301',
        '302',
        '400',
        '401',
        '403',
        '404',
        '500',
        '502',
        '503',
      ],
    });
    expect(suggest('').map(o => o.value)).toEqual(['2XX', '3XX', '4XX', '5XX']);
    expect(suggest('4').map(o => o.value)).toEqual(['4XX']);
    expect(suggest('40').map(o => o.value)).toEqual(['40X']);
    expect(suggest('401').map(o => o.value)).toEqual(['401']);
    expect(suggest('1')).toEqual([]);
  });

  it('attaches a badge with the mask string as text', () => {
    const suggest = createStatusCodeSuggestions({ codes: ['4'] });
    const [mask] = suggest('');
    expect(mask.badge).toBeDefined();
    expect(mask.badge?.text).toBe('4XX');
  });

  it('derives badge color from the leading digit', () => {
    const suggest = createStatusCodeSuggestions({ codes: ['1', '2', '3', '4', '5'] });
    const byValue = Object.fromEntries(suggest('').map(o => [o.value, o.badge?.color]));
    expect(byValue).toEqual({
      '1XX': 'slate',
      '2XX': 'green',
      '3XX': 'blue',
      '4XX': 'amber',
      '5XX': 'red',
    });
  });

  it('preserves leading-digit color on 2-digit masks', () => {
    const suggest = createStatusCodeSuggestions({ codes: ['4'] });
    const [mask] = suggest('40');
    expect(mask.value).toBe('40X');
    expect(mask.badge?.color).toBe('amber');
    expect(mask.badge?.text).toBe('40X');
  });

  describe('selectedValues context', () => {
    it('prepends committed values as badged options ahead of masks', () => {
      const suggest = createStatusCodeSuggestions({ codes: ['1', '2', '3', '4', '5'] });
      const result = suggest('', { selectedValues: ['234'] });
      expect(result.map(o => o.value)).toEqual(['234', '1XX', '2XX', '3XX', '4XX', '5XX']);
      const [selected] = result;
      expect(selected.badge).toEqual({ color: 'green', text: '234' });
    });

    it('does not duplicate an entry when the committed value matches the primary', () => {
      const suggest = createStatusCodeSuggestions({ codes: ['2', '3', '4', '5'] });
      const result = suggest('401', { selectedValues: ['401'] });
      expect(result.map(o => o.value)).toEqual(['401']);
    });

    it('filters out committed values whose class is outside maskRoots', () => {
      // maskRoots derived from codes = {2,3,4,5}. '180' starts with '1' → dropped.
      // '567' starts with '5' → kept as a badged selected option.
      const suggest = createStatusCodeSuggestions({ codes: ['2', '3', '4', '5'] });
      const result = suggest('', { selectedValues: ['180', '567'] });
      expect(result.map(o => o.value)).toEqual(['567', '2XX', '3XX', '4XX', '5XX']);
    });

    it('keeps committed values visible even when the input is invalid', () => {
      const suggest = createStatusCodeSuggestions({ codes: ['2', '3', '4', '5'] });
      const result = suggest('abc', { selectedValues: ['234'] });
      expect(result.map(o => o.value)).toEqual(['234']);
    });

    it('resolves committed mask strings with their badge', () => {
      const suggest = createStatusCodeSuggestions({ codes: ['2', '3', '4', '5'] });
      const result = suggest('', { selectedValues: ['2XX'] });
      const [first] = result;
      expect(first.value).toBe('2XX');
      expect(first.badge?.color).toBe('green');
    });
  });
});

describe('createStatusCodeValidator', () => {
  const isInvalid = createStatusCodeValidator();

  it.each([
    ['101', false],
    ['200', false],
    ['301', false],
    ['404', false],
    ['503', false],
    ['1XX', false],
    ['2XX', false],
    ['3XX', false],
    ['4XX', false],
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
    ['abc', 'letters only'],
    ['XXX', 'no digit anchor'],
    ['601', 'class 6 outside [1..5]'],
    ['001', 'class 0 outside [1..5]'],
    ['901', 'class 9 outside [1..5]'],
    ['4X0', 'mask with digit after X'],
  ])('rejects invalid input %s (%s)', value => {
    expect(isInvalid(value)).toBe(true);
  });

  it('ignores codes option — validity is tied to the static [1..5] class range', () => {
    const bound = createStatusCodeValidator({ codes: ['2', '3', '4', '5'] });
    // "1" is not in the provided codes, but 1xx is still a valid HTTP class.
    expect(bound('101')).toBe(false);
    expect(bound('1XX')).toBe(false);
  });
});

describe('createStatusCodeInputFilter', () => {
  const accept = createStatusCodeInputFilter();

  it.each(['0', '1', '9', 'x', 'X'])('accepts %s', c => {
    expect(accept(c)).toBe(true);
  });

  it.each(['a', 'Z', '-', '.', ' ', '/', '5x'])('rejects %s', c => {
    expect(accept(c)).toBe(false);
  });
});

describe('createStatusCodeNormalizer', () => {
  const normalize = createStatusCodeNormalizer();

  it.each([
    ['2', '2XX'],
    ['5', '5XX'],
    ['22', '22X'],
    ['40', '40X'],
    ['222', '222'],
    ['4XX', '4XX'],
    ['40X', '40X'],
    ['2x', '2XX'],
    ['4xx', '4XX'],
    ['40x', '40X'],
  ])('pads "%s" to "%s"', (input, expected) => {
    expect(normalize(input)).toBe(expected);
  });

  it('leaves unrecognised input untouched so validate can flag it', () => {
    expect(normalize('abc')).toBe('abc');
    expect(normalize('X20')).toBe('X20');
    expect(normalize('4040')).toBe('4040');
    expect(normalize('')).toBe('');
  });

  it('passes through non-string primitives unchanged', () => {
    expect(normalize(true)).toBe(true);
    expect(normalize(false)).toBe(false);
  });

  it('normalizes numeric shorthand', () => {
    expect(normalize(4)).toBe('4XX');
    expect(normalize(40)).toBe('40X');
    expect(normalize(401)).toBe('401');
  });
});
