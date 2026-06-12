import { describe, expect, it } from 'vitest';
import { applyExternalErrors } from '../hooks/useFilterInputExpression/applyExternalErrors';
import type { Condition } from '../types';

const cond = (field: string, extra: Partial<Condition> = {}): Condition => ({
  type: 'condition',
  field,
  operator: '=',
  value: 'x',
  ...extra,
});

describe('applyExternalErrors', () => {
  it('marks matching conditions with a value error', () => {
    const result = applyExternalErrors([cond('host'), cond('path')], ['host']);
    expect(result[0]!.error).toBe('value');
    expect(result[1]!.error).toBeUndefined();
  });

  it('does not override an existing client-side error', () => {
    const result = applyExternalErrors([cond('host', { error: 'attribute' })], ['host']);
    expect(result[0]!.error).toBe('attribute');
  });

  it('skips disabled conditions', () => {
    const result = applyExternalErrors([cond('host', { disabled: true })], ['host']);
    expect(result[0]!.error).toBeUndefined();
  });

  it('returns the same array when no external errors', () => {
    const conditions = [cond('host')];
    expect(applyExternalErrors(conditions, undefined)).toBe(conditions);
    expect(applyExternalErrors(conditions, [])).toBe(conditions);
  });
});
