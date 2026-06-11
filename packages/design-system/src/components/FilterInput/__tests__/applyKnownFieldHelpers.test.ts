import { describe, expect, it, vi } from 'vitest';
import { applyKnownFieldHelpers, getKnownFieldSerializer } from '../lib/applyKnownFieldHelpers';
import { getInvalidValueIndices } from '../lib/validation';
import type { FieldMetadata } from '../types';

describe('applyKnownFieldHelpers', () => {
  it('leaves unknown fields untouched', () => {
    const fields: FieldMetadata[] = [
      { name: 'region', label: 'Region', type: 'string' },
      { name: 'priority', label: 'Priority', type: 'integer' },
    ];
    expect(applyKnownFieldHelpers(fields)).toBe(fields);
  });

  describe('country', () => {
    it('injects the bundled country allowlist, overriding backend options', () => {
      const [field] = applyKnownFieldHelpers([
        {
          name: 'country',
          label: 'Country',
          type: 'string',
          options: ['only-one-from-backend'],
        },
      ]);
      expect(Array.isArray(field.values)).toBe(true);
      expect(field.values!.length).toBeGreaterThan(200);
      expect(field.values).toContainEqual({ value: 'US', label: 'United States' });
      // No dynamic suggestions/validator — the static allowlist drives both.
      expect(field.getSuggestions).toBeUndefined();
    });

    it('validates values against the bundled country allowlist', () => {
      const [field] = applyKnownFieldHelpers([
        { name: 'country', label: 'Country', type: 'string' },
      ]);
      expect(getInvalidValueIndices(field, ['US', 'DE'])).toEqual([]);
      expect(getInvalidValueIndices(field, ['US', 'ZZ'])).toEqual([1]);
    });
  });

  it('wires all five helpers for a field named status_code', () => {
    const [field] = applyKnownFieldHelpers([
      { name: 'status_code', label: 'Status', type: 'integer' },
    ]);
    expect(typeof field.acceptChar).toBe('function');
    expect(typeof field.normalize).toBe('function');
    expect(typeof field.getSuggestions).toBe('function');
    expect(typeof field.validate).toBe('function');
    expect(typeof field.serializeValue).toBe('function');
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

  it('overrides consumer-supplied callbacks for reserved names', () => {
    const customValidate = vi.fn(() => false);
    const customSuggestions = vi.fn(() => [{ value: '200', label: '200' }]);
    const [field] = applyKnownFieldHelpers([
      {
        name: 'status_code',
        label: 'Status',
        type: 'integer',
        validate: customValidate,
        getSuggestions: customSuggestions,
      },
    ]);
    // DS-supplied callbacks win; the consumer's are discarded so the canonical
    // mask UX (acceptChar / normalize / getSuggestions / validate) and the
    // backend serialization are not fightable from the outside.
    expect(field.validate).not.toBe(customValidate);
    expect(field.getSuggestions).not.toBe(customSuggestions);
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

  it('exposes the reserved-field serializer by name', () => {
    const serialize = getKnownFieldSerializer('status_code');
    expect(serialize?.('2XX')).toBe('2');
    expect(serialize?.('22X')).toBe('22');
    expect(serialize?.('222')).toBe('222');
    expect(getKnownFieldSerializer('country')).toBeUndefined();
  });

  it('does not wire helpers for fields with a different name', () => {
    const [field] = applyKnownFieldHelpers([
      { name: 'response_code', label: 'Response', type: 'integer' },
    ]);
    expect(field.acceptChar).toBeUndefined();
    expect(field.normalize).toBeUndefined();
    expect(field.getSuggestions).toBeUndefined();
    expect(field.validate).toBeUndefined();
    expect(field.serializeValue).toBeUndefined();
  });

  it('strips trailing X on the wired serializeValue', () => {
    const [field] = applyKnownFieldHelpers([
      { name: 'status_code', label: 'Status', type: 'integer' },
    ]);
    expect(field.serializeValue?.('2XX')).toBe('2');
    expect(field.serializeValue?.('22X')).toBe('22');
    expect(field.serializeValue?.('222')).toBe('222');
  });
});
