import { describe, expect, it, vi } from 'vitest';
import { applyKnownFieldHelpers } from '../lib/applyKnownFieldHelpers';
import type { FieldMetadata } from '../types';

describe('applyKnownFieldHelpers', () => {
  it('leaves unknown fields untouched', () => {
    const fields: FieldMetadata[] = [
      { name: 'country', label: 'Country', type: 'string' },
      { name: 'priority', label: 'Priority', type: 'integer' },
    ];
    expect(applyKnownFieldHelpers(fields)).toBe(fields);
  });

  it('wires all four helpers for a field named status_code', () => {
    const [field] = applyKnownFieldHelpers([
      { name: 'status_code', label: 'Status', type: 'integer' },
    ]);
    expect(typeof field.acceptChar).toBe('function');
    expect(typeof field.normalize).toBe('function');
    expect(typeof field.getSuggestions).toBe('function');
    expect(typeof field.validate).toBe('function');
  });

  it('produces status-code suggestions on empty input', () => {
    const [field] = applyKnownFieldHelpers([
      { name: 'status_code', label: 'Status', type: 'integer' },
    ]);
    expect(field.getSuggestions?.('').map(o => o.value)).toEqual([
      '1XX',
      '2XX',
      '3XX',
      '4XX',
      '5XX',
    ]);
  });

  it('lets a consumer-supplied callback win over the auto-wired helper', () => {
    const customValidate = vi.fn(() => false);
    const [field] = applyKnownFieldHelpers([
      {
        name: 'status_code',
        label: 'Status',
        type: 'integer',
        validate: customValidate,
      },
    ]);
    expect(field.validate).toBe(customValidate);
    // The non-overridden slots must still be the helper-supplied behavior,
    // not merely "any function" — verify via observable behavior that would
    // only come from createStatusCodeSuggestions / createStatusCodeInputFilter /
    // createStatusCodeNormalizer.
    expect(field.getSuggestions?.('').map(o => o.value)).toEqual([
      '1XX',
      '2XX',
      '3XX',
      '4XX',
      '5XX',
    ]);
    expect(field.acceptChar?.('4')).toBe(true);
    expect(field.acceptChar?.('a')).toBe(false);
    expect(field.normalize?.('4')).toBe('4XX');
  });

  it('does not wire helpers for fields with a different name', () => {
    const [field] = applyKnownFieldHelpers([
      { name: 'response_code', label: 'Response', type: 'integer' },
    ]);
    expect(field.acceptChar).toBeUndefined();
    expect(field.normalize).toBeUndefined();
    expect(field.getSuggestions).toBeUndefined();
    expect(field.validate).toBeUndefined();
  });
});
