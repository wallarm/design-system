import { describe, expect, it } from 'vitest';
import { deriveAutocompleteValues } from '../hooks/useFilterInputAutocomplete/deriveAutocompleteValues';
import type { Condition, FieldMetadata } from '../types';

const statusField: FieldMetadata = {
  name: 'status',
  label: 'Status',
  type: 'enum',
  values: [
    { value: 'active', label: 'Active' },
    { value: 'pending', label: 'Pending' },
    { value: 'blocked', label: 'Blocked' },
  ],
};

const freeTextField: FieldMetadata = {
  name: 'ip',
  label: 'IP Address',
  type: 'string',
};

const makeConditions = (overrides: Partial<Condition> = {}): Condition[] => [
  {
    type: 'condition',
    field: 'status',
    operator: 'in',
    value: ['active', 'pending'],
    ...overrides,
  },
];

describe('deriveAutocompleteValues', () => {
  describe('editingMultiValues from committed condition values', () => {
    it('derives checked values from condition value array', () => {
      const result = deriveAutocompleteValues({
        editingChipId: 'chip-0',
        selectedField: statusField,
        selectedOperator: 'in',
        conditions: makeConditions(),
        buildingMultiValue: undefined,
        dateRangeFromValue: undefined,
      });

      expect(result.editingMultiValues).toEqual(['active', 'pending']);
    });

    it('ignores segmentFilterText (derives from condition values only)', () => {
      const result = deriveAutocompleteValues({
        editingChipId: 'chip-0',
        selectedField: statusField,
        selectedOperator: 'in',
        conditions: makeConditions(),
        buildingMultiValue: undefined,
        dateRangeFromValue: undefined,
        segmentFilterText: 'Active',
      });

      // segmentFilterText is intentionally NOT used to avoid circular dependency
      expect(result.editingMultiValues).toEqual(['active', 'pending']);
    });

    it('returns empty array when condition has no value', () => {
      const result = deriveAutocompleteValues({
        editingChipId: 'chip-0',
        selectedField: statusField,
        selectedOperator: 'in',
        conditions: makeConditions({ value: [] }),
        buildingMultiValue: undefined,
        dateRangeFromValue: undefined,
      });

      expect(result.editingMultiValues).toEqual([]);
    });

    it('wraps single value in array', () => {
      const result = deriveAutocompleteValues({
        editingChipId: 'chip-0',
        selectedField: statusField,
        selectedOperator: 'in',
        conditions: makeConditions({ value: 'active' as unknown as string[] }),
        buildingMultiValue: undefined,
        dateRangeFromValue: undefined,
      });

      expect(result.editingMultiValues).toEqual(['active']);
    });

    it('returns condition values for free-text fields', () => {
      const result = deriveAutocompleteValues({
        editingChipId: 'chip-0',
        selectedField: freeTextField,
        selectedOperator: 'in',
        conditions: makeConditions({ field: 'ip', value: ['1.1.1.1'] }),
        buildingMultiValue: undefined,
        dateRangeFromValue: undefined,
        segmentFilterText: 'something',
      });

      expect(result.editingMultiValues).toEqual(['1.1.1.1']);
    });
  });

  describe('editingMultiValues with error conditions', () => {
    it('filters out invalid values when condition has error', () => {
      const result = deriveAutocompleteValues({
        editingChipId: 'chip-0',
        selectedField: statusField,
        selectedOperator: 'in',
        conditions: makeConditions({ value: ['active', 'unknown'], error: true }),
        buildingMultiValue: undefined,
        dateRangeFromValue: undefined,
      });

      expect(result.editingMultiValues).toEqual(['active']);
    });
  });

  describe('non-multi-select returns empty', () => {
    it('returns empty array for single-select operator', () => {
      const result = deriveAutocompleteValues({
        editingChipId: 'chip-0',
        selectedField: statusField,
        selectedOperator: '=',
        conditions: makeConditions({ operator: '=', value: 'active' }),
        buildingMultiValue: undefined,
        dateRangeFromValue: undefined,
        segmentFilterText: 'Active',
      });

      expect(result.editingMultiValues).toEqual([]);
    });
  });

  describe('buildingChipData', () => {
    it('returns buildingChipData when field selected and not editing', () => {
      const result = deriveAutocompleteValues({
        editingChipId: null,
        selectedField: statusField,
        selectedOperator: '=',
        conditions: [],
        buildingMultiValue: undefined,
        dateRangeFromValue: undefined,
      });

      expect(result.isBuilding).toBe(true);
      expect(result.buildingChipData).toEqual({
        attribute: 'Status',
        operator: 'is',
        value: undefined,
      });
    });

    it('returns null buildingChipData when editing existing chip', () => {
      const result = deriveAutocompleteValues({
        editingChipId: 'chip-0',
        selectedField: statusField,
        selectedOperator: '=',
        conditions: makeConditions({ operator: '=', value: 'active' }),
        buildingMultiValue: undefined,
        dateRangeFromValue: undefined,
      });

      expect(result.isBuilding).toBe(false);
      expect(result.buildingChipData).toBeNull();
    });
  });
});
