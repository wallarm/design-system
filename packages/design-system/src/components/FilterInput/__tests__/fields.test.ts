import { describe, expect, it, vi } from 'vitest';
import {
  findValueLabelInFields,
  getFieldValues,
  hasFieldValues,
  hasStaticAllowlist,
} from '../lib/fields';
import type { FieldMetadata } from '../types';

const baseField = (overrides: Partial<FieldMetadata> = {}): FieldMetadata => ({
  name: 'status',
  label: 'Status',
  type: 'enum',
  ...overrides,
});

describe('fields.ts helpers', () => {
  describe('hasStaticAllowlist', () => {
    it('returns true for field with non-empty values', () => {
      const field = baseField({ values: [{ value: 'a', label: 'A' }] });
      expect(hasStaticAllowlist(field)).toBe(true);
    });

    it('returns true for field with non-empty options', () => {
      const field = baseField({ options: ['a'] });
      expect(hasStaticAllowlist(field)).toBe(true);
    });

    it('returns false when both values and options are empty', () => {
      const field = baseField({ values: [], options: [] });
      expect(hasStaticAllowlist(field)).toBe(false);
    });

    it('returns false when neither values nor options is set', () => {
      const field = baseField({ type: 'string' });
      expect(hasStaticAllowlist(field)).toBe(false);
    });

    it('returns false when getSuggestions is defined (even with empty returns)', () => {
      const field = baseField({ getSuggestions: () => [] });
      expect(hasStaticAllowlist(field)).toBe(false);
    });

    it('returns false when getSuggestions is defined alongside non-empty values', () => {
      const field = baseField({
        values: [{ value: 'a', label: 'A' }],
        getSuggestions: () => [],
      });
      expect(hasStaticAllowlist(field)).toBe(false);
    });

    it('returns false when getSuggestions is defined alongside non-empty options', () => {
      const field = baseField({
        options: ['a'],
        getSuggestions: () => [],
      });
      expect(hasStaticAllowlist(field)).toBe(false);
    });
  });

  describe('hasStaticAllowlist — strictValues', () => {
    it('returns false when strictValues is false even if options are present', () => {
      const field = baseField({
        name: 'host',
        label: 'Host',
        type: 'string',
        options: ['a.com'],
        strictValues: false,
      });
      expect(hasStaticAllowlist(field)).toBe(false);
    });

    it('returns false when strictValues is false with values present', () => {
      const field = baseField({
        values: [{ value: 'Blocked', label: 'Blocked' }],
        strictValues: false,
      });
      expect(hasStaticAllowlist(field)).toBe(false);
    });

    it('keeps allowlist behavior by default (strictValues undefined)', () => {
      const field = baseField({ name: 'host', label: 'Host', type: 'string', options: ['a.com'] });
      expect(hasStaticAllowlist(field)).toBe(true);
    });

    it('keeps allowlist behavior when strictValues is explicitly true', () => {
      const field = baseField({ options: ['a'], strictValues: true });
      expect(hasStaticAllowlist(field)).toBe(true);
    });
  });

  describe('hasFieldValues', () => {
    it('returns true when getSuggestions is defined (empty list is still a list)', () => {
      const field = baseField({ getSuggestions: () => [] });
      expect(hasFieldValues(field)).toBe(true);
    });

    it('returns true for non-empty values', () => {
      const field = baseField({ values: [{ value: 'a', label: 'A' }] });
      expect(hasFieldValues(field)).toBe(true);
    });

    it('returns true for non-empty options', () => {
      const field = baseField({ options: ['a'] });
      expect(hasFieldValues(field)).toBe(true);
    });

    it('returns false when all sources are empty/absent', () => {
      const field = baseField({ values: [], options: [] });
      expect(hasFieldValues(field)).toBe(false);
    });
  });

  describe('getFieldValues', () => {
    it('returns values when only values is defined', () => {
      const values = [
        { value: 'a', label: 'A' },
        { value: 'b', label: 'B' },
      ];
      const field = baseField({ values });
      expect(getFieldValues(field)).toEqual(values);
    });

    it('converts options to {value, label} when only options is defined', () => {
      const field = baseField({ options: ['a', 'b'] });
      expect(getFieldValues(field)).toEqual([
        { value: 'a', label: 'a' },
        { value: 'b', label: 'b' },
      ]);
    });

    it('returns empty array when neither is defined', () => {
      const field = baseField({ type: 'string' });
      expect(getFieldValues(field)).toEqual([]);
    });

    it('invokes getSuggestions with empty string by default', () => {
      const spy = vi.fn(() => [{ value: 'x', label: 'X' }]);
      const field = baseField({ getSuggestions: spy });
      const result = getFieldValues(field);
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith('', undefined);
      expect(result).toEqual([{ value: 'x', label: 'X' }]);
    });

    it('passes inputText to getSuggestions', () => {
      const spy = vi.fn((t: string) => [{ value: `${t}XX`, label: `${t}XX` }]);
      const field = baseField({ getSuggestions: spy });
      const result = getFieldValues(field, '4');
      expect(spy).toHaveBeenCalledWith('4', undefined);
      expect(result).toEqual([{ value: '4XX', label: '4XX' }]);
    });

    it('forwards context.selectedValues to getSuggestions', () => {
      const spy = vi.fn(() => [{ value: 'x', label: 'X' }]);
      const field = baseField({ getSuggestions: spy });
      getFieldValues(field, '4', { selectedValues: ['234'] });
      expect(spy).toHaveBeenCalledWith('4', { selectedValues: ['234'] });
    });

    it('prefers getSuggestions over values when both are defined', () => {
      const values = [{ value: 'fromValues', label: 'From Values' }];
      const spy = vi.fn(() => [{ value: 'fromCallback', label: 'From Callback' }]);
      const field = baseField({ values, getSuggestions: spy });
      expect(getFieldValues(field)).toEqual([{ value: 'fromCallback', label: 'From Callback' }]);
      expect(spy).toHaveBeenCalledWith('', undefined);
    });

    it('prefers getSuggestions over options when both are defined', () => {
      const spy = vi.fn(() => [{ value: 'fromCallback', label: 'From Callback' }]);
      const field = baseField({ options: ['fromOptions'], getSuggestions: spy });
      expect(getFieldValues(field)).toEqual([{ value: 'fromCallback', label: 'From Callback' }]);
    });

    it('returns getSuggestions empty result as-is (does not fall back to values)', () => {
      const values = [{ value: 'fromValues', label: 'From Values' }];
      const field = baseField({ values, getSuggestions: () => [] });
      expect(getFieldValues(field, 'anything')).toEqual([]);
    });
  });

  describe('findValueLabelInFields', () => {
    const allFields: FieldMetadata[] = [
      baseField({
        name: 'attack_subtype',
        label: 'Attack Subtype',
        values: [{ value: 'xss', label: 'XSS' }],
      }),
      baseField({
        name: 'legacy',
        label: 'Legacy',
        values: [{ value: '__none__', label: 'None' }],
      }),
    ];

    it('finds a value label defined on another field', () => {
      expect(findValueLabelInFields('__none__', allFields)).toBe('None');
    });

    it('matches loosely on stringified value', () => {
      const fields = [baseField({ values: [{ value: 5, label: 'Five' }] })];
      expect(findValueLabelInFields('5', fields)).toBe('Five');
    });

    it('returns undefined when no field defines the value', () => {
      expect(findValueLabelInFields('mystery', allFields)).toBeUndefined();
    });

    it('returns undefined for null/undefined value', () => {
      expect(findValueLabelInFields(null, allFields)).toBeUndefined();
      expect(findValueLabelInFields(undefined, allFields)).toBeUndefined();
    });
  });
});
