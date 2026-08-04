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

  it('buckets by the `section` field in first-appearance order, untagged leading', () => {
    const sections = buildValueMenuSections(sectioned, '');
    expect(sections.map(s => s.label)).toEqual([undefined, 'Group 1', 'Group 2']);
    expect(sections[1]!.rows.map(r => r.option.value)).toEqual(['a', 'c']);
  });

  describe('multi-select "All {group}" bulk-select row', () => {
    it('prefixes each labeled group section with a select-all row spanning its full scope', () => {
      const sections = buildValueMenuSections(grouped, '', true);
      const first = sections[0]!;
      const selectAll = first.rows[0]!;
      expect(selectAll.isSelectAll).toBe(true);
      expect(selectAll.isGroup).toBe(true);
      expect(selectAll.id).toBe('select-all:Input-based attacks');
      expect(selectAll.option.label).toBe('All Input-based attacks');
      // The remaining rows are the section's normal contents.
      expect(first.rows.slice(1).map(r => r.option.label)).toEqual([
        'Cross-site scripting (XSS)',
        'SQL injection',
      ]);
    });

    it('prefixes `section`-sugar sections too, spanning the whole bucket', () => {
      const sections = buildValueMenuSections(sectioned, '', true);
      // Headerless (untagged) section gets no select-all row.
      expect(sections[0]!.label).toBeUndefined();
      expect(sections[0]!.rows.some(r => r.isSelectAll)).toBe(false);
      // Labeled buckets are prefixed.
      const group1 = sections[1]!;
      expect(group1.rows[0]!.isSelectAll).toBe(true);
      expect(group1.rows[0]!.option.label).toBe('All Group 1');
      expect(group1.rows.slice(1).map(r => r.option.value)).toEqual(['a', 'c']);
    });

    it('omits the select-all row for flat lists (no header to bulk-select under)', () => {
      const sections = buildValueMenuSections(flat, '', true);
      expect(sections).toHaveLength(1);
      expect(sections[0]!.rows.every(r => !r.isSelectAll)).toBe(true);
    });

    it('never injects the row in single-select mode', () => {
      const sections = buildValueMenuSections(grouped, '', false);
      expect(sections.every(s => s.rows.every(r => !r.isSelectAll))).toBe(true);
    });
  });

  describe('flattened search (non-empty query)', () => {
    it('flattens a grouped tree into a single headerless section of leaf matches at any depth', () => {
      const sections = buildValueMenuSections(grouped, 'union');
      expect(sections).toHaveLength(1);
      expect(sections[0]!.label).toBeUndefined();
      // The deep leaf surfaces directly (no submenu needed).
      expect(sections[0]!.rows.map(r => r.option.label)).toEqual(['Union-based SQLi']);
      expect(sections[0]!.rows[0]!.isGroup).toBe(false);
    });

    it('carries ancestry as the row description (muted path line)', () => {
      const sections = buildValueMenuSections(grouped, 'union');
      expect(sections[0]!.rows[0]!.option.description).toBe('Input-based attacks › SQL injection');
    });

    it('matches leaves by own label and carries the top-level group as path', () => {
      const sections = buildValueMenuSections(grouped, 'graphql');
      expect(sections[0]!.rows.map(r => r.option.label)).toEqual(['GraphQL aliases']);
      expect(sections[0]!.rows[0]!.option.description).toBe('GraphQL attacks');
    });

    it('adds an "All {name}" shortcut when a group/type name matches (multi-select)', () => {
      const sections = buildValueMenuSections(grouped, 'graphql', true);
      const rows = sections[0]!.rows;
      // Shortcut leads, then the matching leaves.
      expect(rows[0]!.isSelectAll).toBe(true);
      expect(rows[0]!.option.label).toBe('All GraphQL attacks');
      expect(rows[0]!.option.children).toBe(grouped[1]!.children);
      expect(rows.slice(1).map(r => r.option.label)).toEqual(['GraphQL aliases']);
    });

    it('omits shortcuts in single-select (bulk selection is meaningless)', () => {
      const sections = buildValueMenuSections(grouped, 'graphql', false);
      expect(sections[0]!.rows.every(r => !r.isSelectAll)).toBe(true);
    });

    it('offers a deep-type shortcut carrying its own ancestry path', () => {
      const sections = buildValueMenuSections(grouped, 'sql injection', true);
      const shortcut = sections[0]!.rows.find(r => r.isSelectAll)!;
      expect(shortcut.option.label).toBe('All SQL injection');
      expect(shortcut.option.description).toBe('Input-based attacks');
    });

    it('returns an empty list when nothing matches (→ menu empty state)', () => {
      expect(buildValueMenuSections(grouped, 'zzz', true)).toEqual([]);
    });

    it('uses the `section` bucket as the path for sugar leaves', () => {
      const sections = buildValueMenuSections(sectioned, 'gamma');
      expect(sections[0]!.rows.map(r => r.option.value)).toEqual(['c']);
      expect(sections[0]!.rows[0]!.option.description).toBe('Group 1');
    });
  });
});
