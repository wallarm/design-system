import { describe, expect, it } from 'vitest';
import {
  buildExpression,
  expressionToConditions,
} from '../hooks/useFilterInputExpression/expression';
import type { Condition, FieldMetadata, Group } from '../types';

const pairedField: FieldMetadata = { name: 'ctx_value', label: 'Value', type: 'string' };
const fields: FieldMetadata[] = [
  { name: 'ctx_param', label: 'Context Param', type: 'string', pairedField },
];

const pairedCondition: Condition = {
  type: 'condition',
  field: 'ctx_param',
  operator: '=',
  value: 'xxx',
  pair: { operator: '=', value: 'yyy' },
};

describe('expression — paired serialize/parse (AS-1160)', () => {
  it('buildExpression expands a paired condition into AND of two conditions', () => {
    const expr = buildExpression([pairedCondition], [], fields) as Group;
    expect(expr.type).toBe('group');
    expect(expr.operator).toBe('and');
    expect(expr.children).toEqual([
      { type: 'condition', field: 'ctx_param', operator: '=', value: 'xxx' },
      { type: 'condition', field: 'ctx_value', operator: '=', value: 'yyy' },
    ]);
  });

  it('buildExpression leaves the pair intact when fields are omitted', () => {
    const expr = buildExpression([pairedCondition], []) as Condition;
    expect(expr.type).toBe('condition');
    expect(expr.pair).toEqual({ operator: '=', value: 'yyy' });
  });

  it('expressionToConditions re-pairs AND-adjacent conditions into one paired condition', () => {
    const group: Group = {
      type: 'group',
      operator: 'and',
      children: [
        { type: 'condition', field: 'ctx_param', operator: '=', value: 'xxx' },
        { type: 'condition', field: 'ctx_value', operator: '=', value: 'yyy' },
      ],
    };
    const { conditions, connectors } = expressionToConditions(group, fields);
    expect(conditions).toHaveLength(1);
    expect(connectors).toEqual([]);
    expect(conditions[0]).toMatchObject({
      field: 'ctx_param',
      value: 'xxx',
      pair: { operator: '=', value: 'yyy' },
    });
  });

  it('round-trips a paired condition losslessly', () => {
    const expr = buildExpression([pairedCondition], [], fields);
    const { conditions } = expressionToConditions(expr, fields);
    expect(conditions).toHaveLength(1);
    expect(conditions[0]).toMatchObject({
      field: 'ctx_param',
      value: 'xxx',
      pair: { operator: '=', value: 'yyy' },
    });
  });

  it('does not re-pair unrelated AND conditions', () => {
    const group: Group = {
      type: 'group',
      operator: 'and',
      children: [
        { type: 'condition', field: 'ctx_param', operator: '=', value: 'xxx' },
        { type: 'condition', field: 'other', operator: '=', value: 'zzz' },
      ],
    };
    const { conditions } = expressionToConditions(group, fields);
    expect(conditions).toHaveLength(2);
    expect(conditions[0]!.pair).toBeUndefined();
  });
});
