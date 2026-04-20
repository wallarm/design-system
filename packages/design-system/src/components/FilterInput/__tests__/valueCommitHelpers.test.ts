import { describe, expect, it } from 'vitest';
import {
  displayDateToIso,
  getInvalidValueIndices,
  isValidFieldValue,
  resolveDateRangeValue,
  resolveDateValue,
  resolveFieldValue,
  resolveMultiValues,
  resolveSingleValue,
  validateValueForField,
} from '../hooks/useFilterInputAutocomplete/valueCommitHelpers';
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
