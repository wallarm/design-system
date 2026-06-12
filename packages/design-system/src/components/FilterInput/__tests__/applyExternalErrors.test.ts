import { describe, expect, it } from 'vitest';
import { applyExternalErrors } from '../hooks/useFilterInputExpression/applyExternalErrors';
import { buildChips } from '../hooks/useFilterInputExpression/buildChips';
import type { Condition, FieldMetadata } from '../types';

const fields: FieldMetadata[] = [
  { name: 'host', label: 'Host', type: 'string' },
  { name: 'path', label: 'Path', type: 'string' },
  {
    name: 'status',
    label: 'Status',
    type: 'enum',
    values: [{ value: 'active', label: 'Active' }],
  },
];

const cond = (field: string, extra: Partial<Condition> = {}): Condition => ({
  type: 'condition',
  field,
  operator: '=',
  value: 'x',
  ...extra,
});

const chipsFor = (conditions: Condition[], connectors: Array<'and' | 'or'> = []) =>
  buildChips(conditions, connectors, fields, false);

describe('applyExternalErrors', () => {
  it('marks the chip of a matching condition with a value error', () => {
    const conditions = [cond('host'), cond('path')];
    const result = applyExternalErrors(chipsFor(conditions, ['and']), conditions, ['host']);
    expect(result[0]!.error).toBe('value');
    expect(result[2]!.error).toBeUndefined();
  });

  it('does not override an existing chip error', () => {
    const conditions = [cond('host', { error: 'attribute' })];
    const result = applyExternalErrors(chipsFor(conditions), conditions, ['host']);
    expect(result[0]!.error).toBe('attribute');
  });

  it('skips disabled chips', () => {
    const conditions = [cond('host', { disabled: true })];
    const result = applyExternalErrors(chipsFor(conditions), conditions, ['host']);
    expect(result[0]!.error).toBeUndefined();
  });

  it('returns the same array when no external errors', () => {
    const conditions = [cond('host')];
    const chips = chipsFor(conditions);
    expect(applyExternalErrors(chips, conditions, undefined)).toBe(chips);
    expect(applyExternalErrors(chips, conditions, [])).toBe(chips);
  });

  it('keeps positional mapping intact across connector chips', () => {
    const conditions = [cond('host'), cond('path')];
    // chips = [chip-0, connector, chip-1] — the connector must not shift the
    // chip→condition index correspondence.
    const result = applyExternalErrors(chipsFor(conditions, ['and']), conditions, ['path']);
    expect(result[0]!.variant).toBe('chip');
    expect(result[0]!.error).toBeUndefined();
    expect(result[1]!.variant).toBe('and');
    expect(result[2]!.variant).toBe('chip');
    expect(result[2]!.error).toBe('value');
  });

  it('keeps a freeform raw value raw even when it matches another field option (no cross-field label)', () => {
    // 'active' is the status field's option value (label 'Active'); the host
    // field is freeform. An external error must not trigger buildChips'
    // cross-field label borrowing — the chip keeps showing the raw value.
    const conditions = [cond('host', { value: 'active' })];
    const result = applyExternalErrors(chipsFor(conditions), conditions, ['host']);
    expect(result[0]!.error).toBe('value');
    expect(result[0]!.value).toBe('active');
  });
});
