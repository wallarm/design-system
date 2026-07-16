import { describe, expect, it } from 'vitest';
import { buildFieldMenuSections } from '../lib/buildFieldMenuSections';
import type { FieldGroup, FieldMetadata } from '../types';

const f = (name: string, label = name): FieldMetadata => ({ name, label, type: 'string' });

const fields: FieldMetadata[] = [
  f('attack_type', 'Attack type'),
  f('host', 'Host'),
  f('path', 'Path'),
  f('country', 'Country'),
  f('orphan', 'Orphan'),
];

const groups: FieldGroup[] = [
  { label: 'Threat classification', fields: ['attack_type'] },
  { label: 'Request features', fields: ['host', 'path'] },
  { label: 'Source and identity', fields: ['country'] },
];

describe('buildFieldMenuSections', () => {
  it('returns one headerless section equal to the flat list when no groups', () => {
    const result = buildFieldMenuSections(fields, undefined, '');
    expect(result).toEqual([{ fields }]);
  });

  it('returns [] when no groups and filter matches nothing', () => {
    expect(buildFieldMenuSections(fields, undefined, 'zzz')).toEqual([]);
  });

  it('buckets fields into groups in group order, fields in listed order', () => {
    const result = buildFieldMenuSections(fields, groups, '');
    expect(result.map(s => s.label)).toEqual([
      'Threat classification',
      'Request features',
      'Source and identity',
      undefined, // trailing ungrouped
    ]);
    expect(result[1]!.fields.map(x => x.name)).toEqual(['host', 'path']);
  });

  it('places fields not in any group into a trailing headerless section', () => {
    const result = buildFieldMenuSections(fields, groups, '');
    const tail = result[result.length - 1]!;
    expect(tail.label).toBeUndefined();
    expect(tail.fields.map(x => x.name)).toEqual(['orphan']);
  });

  it('drops groups whose fields all filter out, keeps matching ones', () => {
    const result = buildFieldMenuSections(fields, groups, 'host');
    expect(result.map(s => s.label)).toEqual(['Request features']);
    expect(result[0]!.fields.map(x => x.name)).toEqual(['host']);
  });

  it('ignores unknown field names in a group', () => {
    const g: FieldGroup[] = [{ label: 'G', fields: ['host', 'nope'] }];
    const result = buildFieldMenuSections(fields, g, '');
    expect(result[0]!.fields.map(x => x.name)).toEqual(['host']);
  });

  it('resolves a field listed in two groups to its first group only', () => {
    const g: FieldGroup[] = [
      { label: 'A', fields: ['host'] },
      { label: 'B', fields: ['host', 'path'] },
    ];
    const result = buildFieldMenuSections(fields, g, '');
    expect(result.find(s => s.label === 'A')!.fields.map(x => x.name)).toEqual(['host']);
    expect(result.find(s => s.label === 'B')!.fields.map(x => x.name)).toEqual(['path']);
  });

  it('floats startsWith matches to the top within a group during search', () => {
    const many: FieldMetadata[] = [f('a_host', 'Backhost'), f('host', 'Host')];
    const g: FieldGroup[] = [{ label: 'G', fields: ['a_host', 'host'] }];
    const result = buildFieldMenuSections(many, g, 'host');
    // 'Host' startsWith wins over 'Backhost' (includes only)
    expect(result[0]!.fields.map(x => x.name)).toEqual(['host', 'a_host']);
  });
});
