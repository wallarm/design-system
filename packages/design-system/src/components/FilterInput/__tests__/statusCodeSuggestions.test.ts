import { describe, expect, it } from 'vitest';
import { createStatusCodeSuggestions } from '../lib/statusCodeSuggestions';

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

  it('returns empty when input has three or more digits', () => {
    const suggest = createStatusCodeSuggestions({ codes: ['2', '3', '4', '5'] });
    expect(suggest('401')).toEqual([]);
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
      '1XX': 'var(--color-bg-light-success)',
      '2XX': 'var(--color-bg-success)',
      '3XX': 'var(--color-bg-info)',
      '4XX': 'var(--color-bg-warning)',
      '5XX': 'var(--color-bg-danger)',
    });
  });

  it('preserves leading-digit color on 2-digit masks', () => {
    const suggest = createStatusCodeSuggestions({ codes: ['4'] });
    const [mask] = suggest('40');
    expect(mask.value).toBe('40X');
    expect(mask.badge?.color).toBe('var(--color-bg-warning)');
    expect(mask.badge?.text).toBe('40X');
  });
});
