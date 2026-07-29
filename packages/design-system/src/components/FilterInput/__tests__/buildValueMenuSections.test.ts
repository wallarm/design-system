import { describe, expect, it } from 'vitest';
import { buildValueMenuSections } from '../lib/buildValueMenuSections';
import type { FieldValueOption } from '../types';

const flat: FieldValueOption[] = [
  { value: 'a', label: 'Alpha' },
  { value: 'b', label: 'Beta' },
];

const grouped: FieldValueOption[] = [
  {
    label: 'Input-based attacks',
    children: [
      { value: 'xss', label: 'Cross-site scripting (XSS)' },
      {
        label: 'SQL injection',
        children: [
          { value: 'sqli_union', label: 'Union-based SQLi' },
          { value: 'sqli_time', label: 'Time-based blind SQLi' },
        ],
      },
    ],
  },
  {
    label: 'GraphQL attacks',
    children: [{ value: 'graphql_aliases', label: 'GraphQL aliases' }],
  },
];

const sectioned: FieldValueOption[] = [
  { value: 'a', label: 'Alpha', section: 'Group 1' },
  { value: 'b', label: 'Beta', section: 'Group 2' },
  { value: 'c', label: 'Gamma', section: 'Group 1' },
  { value: 'd', label: 'Delta' },
];

describe('buildValueMenuSections', () => {
  it('returns a single headerless section for a flat list (unchanged behavior)', () => {
    const sections = buildValueMenuSections(flat, '');
    expect(sections).toHaveLength(1);
    expect(sections[0]!.label).toBeUndefined();
    expect(sections[0]!.rows.map(r => r.id)).toEqual(['leaf:a', 'leaf:b']);
    expect(sections[0]!.rows.every(r => !r.isGroup)).toBe(true);
  });

  it('turns top-level groups into sections and marks nested groups as group rows', () => {
    const sections = buildValueMenuSections(grouped, '');
    expect(sections.map(s => s.label)).toEqual(['Input-based attacks', 'GraphQL attacks']);
    const firstRows = sections[0]!.rows;
    // XSS leaf, then "SQL injection" group row.
    expect(firstRows.map(r => r.option.label)).toEqual([
      'Cross-site scripting (XSS)',
      'SQL injection',
    ]);
    expect(firstRows[0]!.isGroup).toBe(false);
    expect(firstRows[1]!.isGroup).toBe(true);
  });

  it('keeps a group row visible when a descendant leaf matches the query', () => {
    const sections = buildValueMenuSections(grouped, 'union');
    // Only the Input-based section survives; the SQL injection group stays
    // because its child "Union-based SQLi" matches.
    expect(sections.map(s => s.label)).toEqual(['Input-based attacks']);
    expect(sections[0]!.rows.map(r => r.option.label)).toContain('SQL injection');
  });

  it('drops sections whose rows all filter out', () => {
    const sections = buildValueMenuSections(grouped, 'graphql');
    expect(sections.map(s => s.label)).toEqual(['GraphQL attacks']);
  });

  it('buckets by the `section` field in first-appearance order, untagged leading', () => {
    const sections = buildValueMenuSections(sectioned, '');
    expect(sections.map(s => s.label)).toEqual([undefined, 'Group 1', 'Group 2']);
    expect(sections[1]!.rows.map(r => r.option.value)).toEqual(['a', 'c']);
  });
});
