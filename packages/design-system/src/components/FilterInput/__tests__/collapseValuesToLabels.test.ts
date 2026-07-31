import { describe, expect, it } from 'vitest';
import { collapseValues } from '../lib/collapseValuesToLabels';
import type { FieldMetadata } from '../types';

const field: FieldMetadata = {
  name: 'attack_type',
  label: 'Attack type',
  type: 'enum',
  values: [
    {
      label: 'Input-based attacks',
      children: [
        { value: 'xss', label: 'XSS' },
        { value: 'rce', label: 'RCE' },
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

const flatField: FieldMetadata = {
  name: 'status',
  label: 'Status',
  type: 'enum',
  values: [
    { value: 'active', label: 'Active' },
    { value: 'blocked', label: 'Blocked' },
  ],
};

describe('collapseValues', () => {
  it('collapses a fully-selected group into one group token', () => {
    const tokens = collapseValues(field, ['sqli_union', 'sqli_time']);
    expect(tokens).toEqual([{ kind: 'group', label: 'SQL injection' }]);
  });

  it('collapses a partially-selected submenu group to a label with a count', () => {
    const tokens = collapseValues(field, ['sqli_union']);
    expect(tokens).toEqual([{ kind: 'group', label: 'SQL injection', count: 1 }]);
  });

  it('counts every selected leaf of a partially-selected group', () => {
    const tokens = collapseValues(field, ['sqli_time']);
    expect(tokens).toEqual([{ kind: 'group', label: 'SQL injection', count: 1 }]);
  });

  it('does not collapse a top-level section group — its leaves show individually', () => {
    // 'xss' and 'rce' are direct leaves of the "Input-based attacks" section.
    const tokens = collapseValues(field, ['xss', 'rce']);
    expect(tokens).toEqual([
      { kind: 'leaf', value: 'xss' },
      { kind: 'leaf', value: 'rce' },
    ]);
  });

  it('mixes a section leaf with a partially-selected submenu group', () => {
    const tokens = collapseValues(field, ['xss', 'sqli_union']);
    expect(tokens).toEqual([
      { kind: 'leaf', value: 'xss' },
      { kind: 'group', label: 'SQL injection', count: 1 },
    ]);
  });

  it('mixes a fully-selected group with sibling leaves', () => {
    const tokens = collapseValues(field, ['xss', 'sqli_union', 'sqli_time']);
    expect(tokens).toEqual([
      { kind: 'leaf', value: 'xss' },
      { kind: 'group', label: 'SQL injection' },
    ]);
  });

  it('trails freeform values not present in the config, in committed order', () => {
    const tokens = collapseValues(field, ['sqli_union', 'sqli_time', 'mystery']);
    expect(tokens).toEqual([
      { kind: 'group', label: 'SQL injection' },
      { kind: 'leaf', value: 'mystery' },
    ]);
  });

  it('returns leaf tokens in committed order for a field with no groups', () => {
    const tokens = collapseValues(flatField, ['blocked', 'active']);
    expect(tokens).toEqual([
      { kind: 'leaf', value: 'blocked' },
      { kind: 'leaf', value: 'active' },
    ]);
  });
});
