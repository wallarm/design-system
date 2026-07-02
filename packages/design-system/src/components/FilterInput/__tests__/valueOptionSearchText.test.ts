import { describe, expect, it } from 'vitest';
import { valueOptionSearchText } from '../FilterInputMenu/FilterInputValueMenu/valueOptionSearchText';

describe('valueOptionSearchText', () => {
  it('includes the label and stringified value', () => {
    expect(valueOptionSearchText({ value: 'header', label: 'Header' })).toEqual([
      'Header',
      'header',
    ]);
  });

  it('stringifies non-string values', () => {
    expect(valueOptionSearchText({ value: 200, label: 'OK' })).toEqual(['OK', '200']);
  });

  it('includes the description so paths are searchable', () => {
    expect(
      valueOptionSearchText({
        value: 'request-id',
        label: 'request-id',
        description: 'requests->headers->request-id',
      }),
    ).toEqual(['request-id', 'request-id', 'requests->headers->request-id']);
  });

  it('omits the description entry when absent', () => {
    const text = valueOptionSearchText({ value: 'body', label: 'Body' });
    expect(text).not.toContain('');
    expect(text).toHaveLength(2);
  });
});
