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

  it('enumerates the leaves of a partially-selected submenu group (no count)', () => {
    const tokens = collapseValues(field, ['sqli_union']);
    expect(tokens).toEqual([{ kind: 'leaf', value: 'sqli_union' }]);
  });

  it('collapses a fully-selected top-level section into its label', () => {
    // All four leaves of "Input-based attacks" (xss, rce, + both SQLi leaves).
    const tokens = collapseValues(field, ['xss', 'rce', 'sqli_union', 'sqli_time']);
    expect(tokens).toEqual([{ kind: 'group', label: 'Input-based attacks' }]);
  });

  it('enumerates leaves of a partially-selected top-level section', () => {
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
      { kind: 'leaf', value: 'sqli_union' },
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
