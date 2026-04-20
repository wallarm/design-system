import { describe, expect, it } from 'vitest';
import { applyFieldValueTransforms } from '../lib/applyFieldValueTransforms';
import { createStatusCodeSerializer } from '../lib/statusCode';
import type { ExprNode, FieldMetadata } from '../types';

const statusField: FieldMetadata = {
  name: 'status_code',
  label: 'Status',
  type: 'integer',
  serializeValue: createStatusCodeSerializer(),
};

const otherField: FieldMetadata = {
  name: 'country',
  label: 'Country',
  type: 'string',
};

describe('applyFieldValueTransforms', () => {
  it('returns null when expr is null', () => {
    expect(applyFieldValueTransforms(null, [statusField])).toBeNull();
  });

  it('returns the same reference when no field has serializeValue', () => {
    const expr: ExprNode = {
      type: 'condition',
      field: 'status_code',
      operator: '=',
      value: '2XX',
    };
    expect(applyFieldValueTransforms(expr, [otherField])).toBe(expr);
  });

  it('strips trailing X from a single-value status code', () => {
    const expr: ExprNode = {
      type: 'condition',
      field: 'status_code',
      operator: '=',
      value: '2XX',
    };
    const out = applyFieldValueTransforms(expr, [statusField]);
    expect(out).toEqual({
      type: 'condition',
      field: 'status_code',
      operator: '=',
      value: '2',
    });
  });

  it('strips trailing X per element in a multi-value status code', () => {
    const expr: ExprNode = {
      type: 'condition',
      field: 'status_code',
      operator: 'in',
      value: ['2XX', '40X', '401'],
    };
    const out = applyFieldValueTransforms(expr, [statusField]);
    expect(out).toEqual({
      type: 'condition',
      field: 'status_code',
      operator: 'in',
      value: ['2', '40', '401'],
    });
  });

  it('leaves non-status-code conditions untouched', () => {
    const expr: ExprNode = {
      type: 'group',
      operator: 'and',
      children: [
        { type: 'condition', field: 'country', operator: '=', value: 'US' },
        { type: 'condition', field: 'status_code', operator: '=', value: '4XX' },
      ],
    };
    const out = applyFieldValueTransforms(expr, [statusField, otherField]);
    expect(out).toEqual({
      type: 'group',
      operator: 'and',
      children: [
        { type: 'condition', field: 'country', operator: '=', value: 'US' },
        { type: 'condition', field: 'status_code', operator: '=', value: '4' },
      ],
    });
  });

  it('preserves reference identity on a group when every child is unchanged', () => {
    const expr: ExprNode = {
      type: 'group',
      operator: 'and',
      children: [{ type: 'condition', field: 'country', operator: '=', value: 'US' }],
    };
    expect(applyFieldValueTransforms(expr, [statusField, otherField])).toBe(expr);
  });

  it('ignores null values (no-value operators)', () => {
    const expr: ExprNode = {
      type: 'condition',
      field: 'status_code',
      operator: 'is_null',
      value: null,
    };
    expect(applyFieldValueTransforms(expr, [statusField])).toBe(expr);
  });

  it('recurses through nested groups and transforms only the matching leaf', () => {
    const innerUnchanged: ExprNode = {
      type: 'condition',
      field: 'country',
      operator: '=',
      value: 'US',
    };
    const innerStatus: ExprNode = {
      type: 'condition',
      field: 'status_code',
      operator: '=',
      value: '4XX',
    };
    const nestedGroup: ExprNode = {
      type: 'group',
      operator: 'or',
      children: [innerUnchanged, innerStatus],
    };
    const outer: ExprNode = {
      type: 'group',
      operator: 'and',
      children: [nestedGroup, { type: 'condition', field: 'country', operator: '=', value: 'DE' }],
    };
    const out = applyFieldValueTransforms(outer, [statusField, otherField]);
    expect(out).not.toBe(outer);
    // Outer group is a new reference (one descendant changed)
    if (out?.type !== 'group') throw new Error('expected group');
    expect(out.children[0]).not.toBe(nestedGroup); // inner group cloned (it changed)
    expect(out.children[1]).toBe(outer.children[1]); // sibling leaf identity preserved
    expect((out.children[0] as typeof nestedGroup).children[0]).toBe(innerUnchanged); // unchanged leaf identity preserved
    expect(out).toEqual({
      type: 'group',
      operator: 'and',
      children: [
        {
          type: 'group',
          operator: 'or',
          children: [
            { type: 'condition', field: 'country', operator: '=', value: 'US' },
            { type: 'condition', field: 'status_code', operator: '=', value: '4' },
          ],
        },
        { type: 'condition', field: 'country', operator: '=', value: 'DE' },
      ],
    });
  });

  it('preserves identity of nested groups when nothing inside changed', () => {
    const inner: ExprNode = {
      type: 'group',
      operator: 'or',
      children: [{ type: 'condition', field: 'country', operator: '=', value: 'US' }],
    };
    const outer: ExprNode = {
      type: 'group',
      operator: 'and',
      children: [inner],
    };
    expect(applyFieldValueTransforms(outer, [statusField, otherField])).toBe(outer);
  });
});

describe('createStatusCodeSerializer', () => {
  const serialize = createStatusCodeSerializer();

  it.each([
    ['2XX', '2'],
    ['22X', '22'],
    ['222', '222'],
    ['4XX', '4'],
    ['40X', '40'],
    ['401', '401'],
    ['4xx', '4'],
  ])('strips trailing X: "%s" → "%s"', (input, expected) => {
    expect(serialize(input)).toBe(expected);
  });

  it('returns non-string primitives unchanged', () => {
    expect(serialize(200)).toBe(200);
    expect(serialize(true)).toBe(true);
  });

  it('returns garbage strings unchanged so validate can still flag them', () => {
    expect(serialize('abc')).toBe('abc');
    expect(serialize('4040')).toBe('4040');
    expect(serialize('X42')).toBe('X42');
  });
});
