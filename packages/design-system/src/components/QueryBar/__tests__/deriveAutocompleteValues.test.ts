import { describe, expect, it } from 'vitest';
import { deriveAutocompleteValues } from '../hooks/useQueryBarAutocomplete/deriveAutocompleteValues';
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
  describe('editingMultiValues from segment text', () => {
    it('derives checked values from comma-separated segment text', () => {
      const result = deriveAutocompleteValues({
        editingChipId: 'chip-0',
        selectedField: statusField,
        selectedOperator: 'in',
        conditions: makeConditions(),
        buildingMultiValue: undefined,
        dateRangeFromValue: undefined,
        segmentFilterText: 'Active, Pending',
      });

      expect(result.editingMultiValues).toEqual(['active', 'pending']);
    });

    it('unchecks values removed from segment text', () => {
      const result = deriveAutocompleteValues({
        editingChipId: 'chip-0',
        selectedField: statusField,
        selectedOperator: 'in',
        conditions: makeConditions(),
        buildingMultiValue: undefined,
        dateRangeFromValue: undefined,
        segmentFilterText: 'Active',
      });

      expect(result.editingMultiValues).toEqual(['active']);
    });

    it('returns empty when all values removed from segment text', () => {
      const result = deriveAutocompleteValues({
        editingChipId: 'chip-0',
        selectedField: statusField,
        selectedOperator: 'in',
        conditions: makeConditions(),
        buildingMultiValue: undefined,
        dateRangeFromValue: undefined,
        segmentFilterText: '',
      });

      expect(result.editingMultiValues).toEqual([]);
    });

    it('matches by value (case-insensitive) when label does not match', () => {
      const result = deriveAutocompleteValues({
        editingChipId: 'chip-0',
        selectedField: statusField,
        selectedOperator: 'in',
        conditions: makeConditions(),
        buildingMultiValue: undefined,
        dateRangeFromValue: undefined,
        segmentFilterText: 'ACTIVE, blocked',
      });

      expect(result.editingMultiValues).toEqual(['active', 'blocked']);
    });

    it('ignores unknown tokens in segment text', () => {
      const result = deriveAutocompleteValues({
        editingChipId: 'chip-0',
        selectedField: statusField,
        selectedOperator: 'in',
        conditions: makeConditions(),
        buildingMultiValue: undefined,
        dateRangeFromValue: undefined,
        segmentFilterText: 'Active, unknown',
      });

      expect(result.editingMultiValues).toEqual(['active']);
    });

    it('falls back to condition values when segmentFilterText is undefined', () => {
      const result = deriveAutocompleteValues({
        editingChipId: 'chip-0',
        selectedField: statusField,
        selectedOperator: 'in',
        conditions: makeConditions(),
        buildingMultiValue: undefined,
        dateRangeFromValue: undefined,
        segmentFilterText: undefined,
      });

      expect(result.editingMultiValues).toEqual(['active', 'pending']);
    });

    it('falls back to condition values for free-text fields even with segment text', () => {
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
