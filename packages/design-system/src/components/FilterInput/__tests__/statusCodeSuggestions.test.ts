import { describe, expect, it } from 'vitest';
import { createStatusCodeSuggestions } from '../lib/statusCodeSuggestions';

describe('createStatusCodeSuggestions', () => {
  it('returns all available masks for empty input', () => {
    const suggest = createStatusCodeSuggestions({ codes: ['2', '3', '4', '5'] });
    const result = suggest('');
    expect(result.map(o => o.value)).toEqual(['2XX', '3XX', '4XX', '5XX']);
  });
});
