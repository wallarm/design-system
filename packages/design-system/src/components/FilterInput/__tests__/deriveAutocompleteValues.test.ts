import { describe, expect, it } from 'vitest';
import { deriveAutocompleteValues } from '../hooks/useFilterInputAutocomplete/lib';
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

const nestedField: FieldMetadata = {
  name: 'attack_type',
  label: 'Attack type',
  type: 'enum',
  values: [
    {
      label: 'Input-based attacks',
      children: [
        { value: 'xss', label: 'XSS' },
        {
          label: 'SQL injection',
          children: [
            { value: 'sqli_union', label: 'Union-based SQLi' },
            { value: 'sqli_time', label: 'Time-based blind SQLi' },
          ],
        },
      ],
    },
  ],
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

    it('lets a typed segmentFilterText replace the committed values', () => {
      const result = deriveAutocompleteValues({
        editingChipId: 'chip-0',
        selectedField: statusField,
        selectedOperator: 'in',
        conditions: makeConditions(),
        buildingMultiValue: undefined,
        dateRangeFromValue: undefined,
        segmentFilterText: 'Active',
      });

      // Typed text owns the selection: the label resolves to its value and the
      // value the user erased is gone. Set only once the user typed, so it never
      // loops back through the checked-set → segment-text mirror.
      expect(result.editingMultiValues).toEqual(['active']);
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
      });

      expect(result.editingMultiValues).toEqual(['1.1.1.1']);
    });

    it('takes typed text verbatim on a free-text field', () => {
      const result = deriveAutocompleteValues({
        editingChipId: 'chip-0',
        selectedField: freeTextField,
        selectedOperator: 'in',
        conditions: makeConditions({ field: 'ip', value: ['1.1.1.1'] }),
        buildingMultiValue: undefined,
        dateRangeFromValue: undefined,
        segmentFilterText: '2.2.2.2, 3.3.3.3',
      });

      expect(result.editingMultiValues).toEqual(['2.2.2.2', '3.3.3.3']);
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

    it('keeps valid nested leaf values when re-editing an errored nested condition (WDS-156)', () => {
      const result = deriveAutocompleteValues({
        editingChipId: 'chip-0',
        selectedField: nestedField,
        selectedOperator: 'in',
        conditions: [
          {
            type: 'condition',
            field: 'attack_type',
            operator: 'in',
            value: ['sqli_union', 'sqli_time', 'unknown'],
            error: true,
          },
        ],
        buildingMultiValue: undefined,
        dateRangeFromValue: undefined,
      });

      // The two nested SQLi leaves are valid and must survive; only the truly
      // unknown value is dropped. Before the leaf-flatten fix, the nested leaves
      // were absent from the top-level option list and got dropped too.
      expect(result.editingMultiValues).toEqual(['sqli_union', 'sqli_time']);
    });

    it('preserves all values for dynamic (getSuggestions) field even with error', () => {
      const dynamicField: FieldMetadata = {
        name: 'code',
        label: 'Status code',
        type: 'integer',
        getSuggestions: () => [{ value: '200', label: '200 OK' }],
      };
      const result = deriveAutocompleteValues({
        editingChipId: 'chip-0',
        selectedField: dynamicField,
        selectedOperator: 'in',
        conditions: [
          {
            type: 'condition',
            field: 'code',
            operator: 'in',
            value: ['429', 'anything'],
            error: true,
          },
        ],
        buildingMultiValue: undefined,
        dateRangeFromValue: undefined,
      });

      // Bypass: hasStaticAllowlist is false for dynamic fields, so filtering does not run.
      expect(result.editingMultiValues).toEqual(['429', 'anything']);
    });

    it('preserves all values for dynamic field even when values are also defined', () => {
      // getSuggestions wins; static values would have filtered out '429' but we skip that path.
      const mixedField: FieldMetadata = {
        name: 'code',
        label: 'Status code',
        type: 'integer',
        values: [{ value: '200', label: '200 OK' }],
        getSuggestions: () => [],
      };
      const result = deriveAutocompleteValues({
        editingChipId: 'chip-0',
        selectedField: mixedField,
        selectedOperator: 'in',
        conditions: [
          {
            type: 'condition',
            field: 'code',
            operator: 'in',
            value: ['200', '429'],
            error: true,
          },
        ],
        buildingMultiValue: undefined,
        dateRangeFromValue: undefined,
      });

      expect(result.editingMultiValues).toEqual(['200', '429']);
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

  describe('editingDateRange for between operator', () => {
    const dateField: FieldMetadata = {
      name: 'last_seen',
      label: 'Last seen',
      type: 'date',
    };

    const makeDateConditions = (overrides: Partial<Condition> = {}): Condition[] => [
      {
        type: 'condition',
        field: 'last_seen',
        operator: 'between',
        value: ['2026-03-05', '2026-03-15'],
        ...overrides,
      },
    ];

    it('derives date range from between condition', () => {
      const result = deriveAutocompleteValues({
        editingChipId: 'chip-0',
        selectedField: dateField,
        selectedOperator: 'between',
        conditions: makeDateConditions(),
        buildingMultiValue: undefined,
        dateRangeFromValue: undefined,
      });

      expect(result.editingDateRange).toEqual(['2026-03-05', '2026-03-15']);
    });

    it('returns undefined for non-between operator', () => {
      const result = deriveAutocompleteValues({
        editingChipId: 'chip-0',
        selectedField: dateField,
        selectedOperator: '=',
        conditions: makeDateConditions({ operator: '=', value: '2026-03-05' }),
        buildingMultiValue: undefined,
        dateRangeFromValue: undefined,
      });

      expect(result.editingDateRange).toBeUndefined();
    });

    it('returns undefined when value has fewer than 2 elements', () => {
      const result = deriveAutocompleteValues({
        editingChipId: 'chip-0',
        selectedField: dateField,
        selectedOperator: 'between',
        conditions: makeDateConditions({ value: ['2026-03-05'] }),
        buildingMultiValue: undefined,
        dateRangeFromValue: undefined,
      });

      expect(result.editingDateRange).toBeUndefined();
    });

    it('returns undefined for non-date field', () => {
      const result = deriveAutocompleteValues({
        editingChipId: 'chip-0',
        selectedField: statusField,
        selectedOperator: 'between',
        conditions: makeDateConditions(),
        buildingMultiValue: undefined,
        dateRangeFromValue: undefined,
      });

      expect(result.editingDateRange).toBeUndefined();
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

    // Building preview must surface the placeholder so the in-progress chip
    // looks complete (3 segments) for no-value operators — see also the
    // matching committed-chip case in buildChips.test.ts.
    it('fills value with placeholder for no-value operators', () => {
      const result = deriveAutocompleteValues({
        editingChipId: null,
        selectedField: statusField,
        selectedOperator: 'is_null',
        conditions: [],
        buildingMultiValue: undefined,
        dateRangeFromValue: undefined,
      });

      expect(result.buildingChipData).toEqual({
        attribute: 'Status',
        operator: 'is not set',
        value: '—',
      });
    });
  });
});
