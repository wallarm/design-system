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
});
