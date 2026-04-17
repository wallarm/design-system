import { describe, expect, it, vi } from 'vitest';
import { getFieldValues, hasFieldValues, hasStaticAllowlist } from '../lib/fields';
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
      expect(spy).toHaveBeenCalledWith('');
      expect(result).toEqual([{ value: 'x', label: 'X' }]);
    });

    it('passes inputText to getSuggestions', () => {
      const spy = vi.fn((t: string) => [{ value: `${t}XX`, label: `${t}XX` }]);
      const field = baseField({ getSuggestions: spy });
      const result = getFieldValues(field, '4');
      expect(spy).toHaveBeenCalledWith('4');
      expect(result).toEqual([{ value: '4XX', label: '4XX' }]);
    });

    it('prefers getSuggestions over values when both are defined', () => {
      const values = [{ value: 'fromValues', label: 'From Values' }];
      const spy = vi.fn(() => [{ value: 'fromCallback', label: 'From Callback' }]);
      const field = baseField({ values, getSuggestions: spy });
      expect(getFieldValues(field)).toEqual([{ value: 'fromCallback', label: 'From Callback' }]);
      expect(spy).toHaveBeenCalledWith('');
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
});
