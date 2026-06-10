import { describe, expect, it } from 'vitest';
import {
  displayDateToIso,
  resolveDateRangeValue,
  resolveDateValue,
  resolveFieldValue,
  resolveMultiValues,
  resolveSingleValue,
} from '../hooks/useFilterInputAutocomplete/lib';
import { getInvalidValueIndices, isValidFieldValue, validateValueForField } from '../lib';
import type { Condition, FieldMetadata } from '../types';

const enumField: FieldMetadata = {
  name: 'status',
  label: 'Status',
  type: 'enum',
  values: [
    { value: 'active', label: 'Active' },
    { value: 'pending', label: 'Pending' },
  ],
};

const freeField: FieldMetadata = {
  name: 'ip',
  label: 'IP',
  type: 'string',
};

describe('valueCommitHelpers', () => {
  describe('isValidFieldValue', () => {
    it('returns true for matching value', () => {
      expect(isValidFieldValue(enumField.values!, 'active')).toBe(true);
    });

    it('matches case-insensitively', () => {
      expect(isValidFieldValue(enumField.values!, 'ACTIVE')).toBe(true);
    });

    it('returns false for non-matching value', () => {
      expect(isValidFieldValue(enumField.values!, 'unknown')).toBe(false);
    });
  });

  describe('getInvalidValueIndices', () => {
    it('returns empty for field without values', () => {
      expect(getInvalidValueIndices(freeField, ['anything'])).toEqual([]);
    });

    it('returns indices of invalid values', () => {
      expect(getInvalidValueIndices(enumField, ['active', 'bad', 'pending', 'worse'])).toEqual([
        1, 3,
      ]);
    });

    it('returns empty when all valid', () => {
      expect(getInvalidValueIndices(enumField, ['active', 'pending'])).toEqual([]);
    });

    it('flags invalid value when field uses static values', () => {
      const field: FieldMetadata = {
        name: 's',
        label: 'S',
        type: 'enum',
        values: [{ value: 'a', label: 'A' }],
      };
      expect(getInvalidValueIndices(field, ['a', 'b'])).toEqual([1]);
    });
  });

  describe('bypass for getSuggestions-backed fields', () => {
    const dynamicField: FieldMetadata = {
      name: 'code',
      label: 'Status code',
      type: 'integer',
      getSuggestions: t => [{ value: t, label: t }],
    };

    it('getInvalidValueIndices returns empty for dynamic field (bypass active)', () => {
      expect(getInvalidValueIndices(dynamicField, ['anything', '42'])).toEqual([]);
    });

    it('getInvalidValueIndices bypass applies even when getSuggestions returns []', () => {
      const emptyDynamic: FieldMetadata = {
        name: 'code',
        label: 'Status code',
        type: 'integer',
        getSuggestions: () => [],
      };
      expect(getInvalidValueIndices(emptyDynamic, ['anything', '42'])).toEqual([]);
    });

    it('getInvalidValueIndices bypass wins even when values is also defined', () => {
      const mixed: FieldMetadata = {
        name: 'code',
        label: 'Status code',
        type: 'integer',
        values: [{ value: '200', label: '200 OK' }],
        getSuggestions: () => [],
      };
      // With only `values`, '429' would be flagged; getSuggestions bypass flags nothing.
      expect(getInvalidValueIndices(mixed, ['429'])).toEqual([]);
    });

    it('resolveSingleValue: no error for dynamic field even without suggestion match', () => {
      const result = resolveSingleValue(dynamicField, '429');
      expect(result.resolved).toBe('429');
      expect(result.error).toBeUndefined();
    });

    it('resolveSingleValue: error remains for static-allowlist field without match', () => {
      const staticField: FieldMetadata = {
        name: 'code',
        label: 'Status code',
        type: 'enum',
        values: [{ value: '200', label: '200 OK' }],
      };
      const result = resolveSingleValue(staticField, '429');
      expect(result.resolved).toBe('429');
      expect(result.error).toBe(true);
    });

    it('validateValueForField returns false for dynamic field with any value', () => {
      expect(validateValueForField(dynamicField, 'anything')).toBe(false);
      expect(validateValueForField(dynamicField, ['42', 'whatever'])).toBe(false);
    });
  });

  describe('validateValueForField', () => {
    it('returns false for null value', () => {
      expect(validateValueForField(enumField, null)).toBe(false);
    });

    it('returns true when value is invalid', () => {
      expect(validateValueForField(enumField, 'unknown')).toBe(true);
    });

    it('returns false when value is valid', () => {
      expect(validateValueForField(enumField, 'active')).toBe(false);
    });

    it('validates array values', () => {
      expect(validateValueForField(enumField, ['active', 'unknown'])).toBe(true);
      expect(validateValueForField(enumField, ['active', 'pending'])).toBe(false);
    });
  });

  describe('freeform field type validation', () => {
    const intField: FieldMetadata = { name: 'port', label: 'Port', type: 'integer' };
    const floatField: FieldMetadata = { name: 'ratio', label: 'Ratio', type: 'float' };
    const boolField: FieldMetadata = { name: 'active', label: 'Active', type: 'boolean' };
    const dateField: FieldMetadata = { name: 'seen', label: 'Seen', type: 'date' };

    it('flags a non-integer value on a freeform integer field', () => {
      // e.g. "active" carried over from a previous string field after a field change
      expect(validateValueForField(intField, 'active')).toBe(true);
      expect(getInvalidValueIndices(intField, ['8080', 'oops', '443'])).toEqual([1]);
    });

    it('accepts integer-looking values on a freeform integer field', () => {
      expect(validateValueForField(intField, '8080')).toBe(false);
      expect(validateValueForField(intField, '-5')).toBe(false);
      expect(validateValueForField(intField, '5.5')).toBe(true);
    });

    it('validates freeform float fields', () => {
      expect(validateValueForField(floatField, '1.5')).toBe(false);
      expect(validateValueForField(floatField, '2')).toBe(false);
      expect(validateValueForField(floatField, 'NaNoid')).toBe(true);
    });

    it('validates freeform boolean fields', () => {
      expect(validateValueForField(boolField, 'true')).toBe(false);
      expect(validateValueForField(boolField, 'FALSE')).toBe(false);
      expect(validateValueForField(boolField, 'maybe')).toBe(true);
    });

    it('validates freeform date fields (preset or parseable date)', () => {
      expect(validateValueForField(dateField, '7d')).toBe(false); // relative preset
      expect(validateValueForField(dateField, '2026-03-05')).toBe(false); // absolute ISO
      // a host string carried into a date field after a field change
      expect(validateValueForField(dateField, 'example.com')).toBe(true);
      expect(validateValueForField(dateField, 'none')).toBe(true);
    });

    it('does not type-check freeform string fields', () => {
      expect(validateValueForField(freeField, 'anything')).toBe(false);
    });

    it('checks type first, then options, for an allowlisted typed field', () => {
      const priority: FieldMetadata = {
        name: 'priority',
        label: 'Priority',
        type: 'integer',
        values: [
          { value: 1, label: 'Low' },
          { value: 5, label: 'High' },
        ],
      };
      expect(validateValueForField(priority, '5')).toBe(false); // right type, in options
      expect(validateValueForField(priority, '3')).toBe(true); // right type, not an option
      expect(validateValueForField(priority, 'active')).toBe(true); // wrong type
    });

    it('still bypasses dynamic (getSuggestions) typed fields', () => {
      const dynamicInt: FieldMetadata = {
        name: 'code',
        label: 'Status code',
        type: 'integer',
        getSuggestions: t => [{ value: t, label: t }],
      };
      expect(validateValueForField(dynamicInt, 'not-a-number')).toBe(false);
    });
  });

  describe('resolveFieldValue', () => {
    it('resolves label to value', () => {
      expect(resolveFieldValue(enumField, 'Active')).toBe('active');
    });

    it('returns text as-is when no match', () => {
      expect(resolveFieldValue(enumField, 'unknown')).toBe('unknown');
    });

    it('returns text as-is for free-text field', () => {
      expect(resolveFieldValue(freeField, '1.2.3.4')).toBe('1.2.3.4');
    });
  });

  describe('resolveSingleValue', () => {
    it('resolves matching label', () => {
      const result = resolveSingleValue(enumField, 'Active');
      expect(result.resolved).toBe('active');
      expect(result.error).toBeUndefined();
    });

    it('returns error for unmatched value on enum field', () => {
      const result = resolveSingleValue(enumField, 'unknown');
      expect(result.resolved).toBe('unknown');
      expect(result.error).toBe(true);
    });

    it('no error for free-text field', () => {
      const result = resolveSingleValue(freeField, 'anything');
      expect(result.error).toBeUndefined();
    });
  });

  describe('resolveMultiValues', () => {
    it('resolves comma-separated values', () => {
      const result = resolveMultiValues(enumField, 'Active, Pending');
      expect(result.resolved).toEqual(['active', 'pending']);
      expect(result.error).toBeUndefined();
    });

    it('returns error when some values are invalid', () => {
      const result = resolveMultiValues(enumField, 'Active, Unknown');
      expect(result.resolved).toEqual(['active', 'Unknown']);
      expect(result.error).toBe(true);
    });

    it('filters empty parts', () => {
      const result = resolveMultiValues(freeField, 'a,,b');
      expect(result.resolved).toEqual(['a', 'b']);
    });
  });

  describe('displayDateToIso', () => {
    it('returns null for empty string', () => {
      expect(displayDateToIso('')).toBeNull();
    });

    it('returns null for short string', () => {
      expect(displayDateToIso('ab')).toBeNull();
    });

    it('passes through ISO format', () => {
      expect(displayDateToIso('2026-03-15')).toBe('2026-03-15');
    });

    it('converts display date to ISO', () => {
      expect(displayDateToIso('Mar 15, 2026')).toBe('2026-03-15');
    });

    it('returns null for invalid date string', () => {
      expect(displayDateToIso('not a date')).toBeNull();
    });
  });

  describe('resolveDateRangeValue', () => {
    it('parses display range into ISO tuple', () => {
      expect(resolveDateRangeValue('Mar 5, 2026 – Mar 15, 2026')).toEqual([
        '2026-03-05',
        '2026-03-15',
      ]);
    });

    it('handles ISO range', () => {
      expect(resolveDateRangeValue('2026-03-05 – 2026-03-15')).toEqual([
        '2026-03-05',
        '2026-03-15',
      ]);
    });

    it('returns null for single value', () => {
      expect(resolveDateRangeValue('Mar 5, 2026')).toBeNull();
    });

    it('returns null when a part is invalid', () => {
      expect(resolveDateRangeValue('Mar 5, 2026 – invalid')).toBeNull();
    });

    it('returns null for wrong separator', () => {
      expect(resolveDateRangeValue('Mar 5, 2026 - Mar 15, 2026')).toBeNull();
    });
  });

  describe('resolveDateValue', () => {
    const conditions: Condition[] = [
      {
        type: 'condition',
        field: 'date',
        operator: '=',
        value: '7d',
        dateOrigin: 'relative',
      },
    ];

    it('accepts valid preset', () => {
      const result = resolveDateValue('7d', null, []);
      expect(result.error).toBeUndefined();
    });

    it('accepts valid date string', () => {
      const result = resolveDateValue('Mar 5, 2026', null, []);
      expect(result.error).toBeUndefined();
    });

    it('rejects invalid text', () => {
      const result = resolveDateValue('not-a-date', null, []);
      expect(result.error).toBe(true);
    });

    it('rejects short strings that Date() parses loosely', () => {
      const result = resolveDateValue('2', null, []);
      expect(result.error).toBe(true);
    });

    it('preserves dateOrigin from editing condition', () => {
      const result = resolveDateValue('7d', 'chip-0', conditions);
      expect(result.dateOrigin).toBe('relative');
    });

    it('infers dateOrigin from old value when not set', () => {
      const conds: Condition[] = [{ type: 'condition', field: 'date', operator: '=', value: '1h' }];
      const result = resolveDateValue('1h', 'chip-0', conds);
      expect(result.dateOrigin).toBe('relative');
    });
  });
});
