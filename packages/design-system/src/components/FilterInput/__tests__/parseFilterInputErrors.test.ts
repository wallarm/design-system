import { describe, expect, it } from 'vitest';
import { parseFilterInputErrors } from '../FilterInputErrors/parseFilterInputErrors';
import type { Condition, FieldMetadata } from '../types';

const staticField: FieldMetadata = {
  name: 'status',
  label: 'Status',
  type: 'enum',
  values: [
    { value: 'active', label: 'Active' },
    { value: 'pending', label: 'Pending' },
  ],
};

const dynamicField: FieldMetadata = {
  name: 'code',
  label: 'Status code',
  type: 'integer',
  getSuggestions: () => [{ value: '200', label: '200 OK' }],
};

describe('parseFilterInputErrors', () => {
  it('returns empty array when no conditions have errors', () => {
    const conditions: Condition[] = [
      { type: 'condition', field: 'status', operator: '=', value: 'active' },
    ];
    expect(parseFilterInputErrors(conditions, [staticField])).toEqual([]);
  });

  it('reports unknown field for attribute error', () => {
    const conditions: Condition[] = [
      { type: 'condition', field: 'unknown', operator: '=', value: 'x', error: 'attribute' },
    ];
    expect(parseFilterInputErrors(conditions, [staticField])).toEqual(['Unknown field unknown']);
  });

  it('lists invalid values for static-allowlist field', () => {
    const conditions: Condition[] = [
      {
        type: 'condition',
        field: 'status',
        operator: 'in',
        value: ['active', 'bogus'],
        error: 'value',
      },
    ];
    expect(parseFilterInputErrors(conditions, [staticField])).toEqual([
      'Invalid value for Status: bogus',
    ]);
  });

  it('emits generic message for dynamic (getSuggestions) field — no specific list', () => {
    const conditions: Condition[] = [
      {
        type: 'condition',
        field: 'code',
        operator: 'in',
        value: ['bogus'],
        error: 'value',
      },
    ];
    expect(parseFilterInputErrors(conditions, [dynamicField])).toEqual([
      'Invalid value for Status code',
    ]);
  });

  it('emits generic message for dynamic field even when static values are present', () => {
    // hasStaticAllowlist returns false because getSuggestions wins; no specific list is emitted.
    const mixed: FieldMetadata = {
      ...dynamicField,
      values: [{ value: '200', label: '200 OK' }],
    };
    const conditions: Condition[] = [
      {
        type: 'condition',
        field: 'code',
        operator: 'in',
        value: ['bogus'],
        error: 'value',
      },
    ];
    expect(parseFilterInputErrors(conditions, [mixed])).toEqual(['Invalid value for Status code']);
  });

  it('falls back to generic message when value is not an array', () => {
    const conditions: Condition[] = [
      {
        type: 'condition',
        field: 'status',
        operator: '=',
        value: 'bogus',
        error: 'value',
      },
    ];
    expect(parseFilterInputErrors(conditions, [staticField])).toEqual(['Invalid value for Status']);
  });

  it('lists multiple invalid values joined by comma', () => {
    const conditions: Condition[] = [
      {
        type: 'condition',
        field: 'status',
        operator: 'in',
        value: ['active', 'bogus', 'nope'],
        error: 'value',
      },
    ];
    expect(parseFilterInputErrors(conditions, [staticField])).toEqual([
      'Invalid value for Status: bogus, nope',
    ]);
  });

  describe('paired field (AS-1160)', () => {
    const pairedField: FieldMetadata = { name: 'ctx_value', label: 'Value', type: 'string' };
    const ctxField: FieldMetadata = {
      name: 'ctx_param',
      label: 'Context Param',
      type: 'string',
      pairedField,
    };

    it('requires the second value when pair is missing', () => {
      const conditions: Condition[] = [
        { type: 'condition', field: 'ctx_param', operator: '=', value: 'xxx' },
      ];
      expect(parseFilterInputErrors(conditions, [ctxField])).toEqual(['Value is required']);
    });

    it('requires the second value when pair value is empty', () => {
      const conditions: Condition[] = [
        {
          type: 'condition',
          field: 'ctx_param',
          operator: '=',
          value: 'xxx',
          pair: { operator: '=', value: '' },
        },
      ];
      expect(parseFilterInputErrors(conditions, [ctxField])).toEqual(['Value is required']);
    });

    it('passes when both values are present', () => {
      const conditions: Condition[] = [
        {
          type: 'condition',
          field: 'ctx_param',
          operator: '=',
          value: 'xxx',
          pair: { operator: '=', value: 'yyy' },
        },
      ];
      expect(parseFilterInputErrors(conditions, [ctxField])).toEqual([]);
    });
  });
});
