import { describe, expect, it } from 'vitest';
import { buildValueMenuSections } from '../lib/buildValueMenuSections';
import type { ValueGroup } from '../types';

interface Option {
  value: string | number | boolean;
  label: string;
}

const opt = (value: string | number | boolean, label = String(value)): Option => ({ value, label });

const labels = (sections: Array<{ label?: string; values: Option[] }>) =>
  sections.map(s => [s.label, s.values.map(v => v.value)] as const);

describe('buildValueMenuSections', () => {
  describe('without groups', () => {
    it('returns a single headerless section preserving order', () => {
      const values = [opt('b'), opt('a'), opt('c')];

      expect(buildValueMenuSections(values, undefined)).toEqual([{ values }]);
    });

    it('returns no sections for an empty list', () => {
      expect(buildValueMenuSections([], undefined)).toEqual([]);
    });

    it('treats an empty group array as ungrouped', () => {
      const values = [opt('a')];

      expect(buildValueMenuSections(values, [])).toEqual([{ values }]);
    });
  });

  describe('with groups', () => {
    const groups: ValueGroup[] = [
      { label: 'Second', values: ['c', 'd'] },
      { label: 'First', values: ['a', 'b'] },
    ];

    it('renders groups in array order, not value order', () => {
      const sections = buildValueMenuSections([opt('a'), opt('b'), opt('c'), opt('d')], groups);

      expect(labels(sections)).toEqual([
        ['Second', ['c', 'd']],
        ['First', ['a', 'b']],
      ]);
    });

    it('orders values within a group by the group listing, not the input order', () => {
      const sections = buildValueMenuSections(
        [opt('b'), opt('a')],
        [{ label: 'G', values: ['a', 'b'] }],
      );

      expect(labels(sections)).toEqual([['G', ['a', 'b']]]);
    });

    it('puts values claimed by no group in a trailing headerless section', () => {
      const sections = buildValueMenuSections(
        [opt('a'), opt('z'), opt('c'), opt('y')],
        [{ label: 'G', values: ['a', 'c'] }],
      );

      expect(labels(sections)).toEqual([
        ['G', ['a', 'c']],
        [undefined, ['z', 'y']],
      ]);
    });

    it('ignores group members absent from the value list', () => {
      const sections = buildValueMenuSections(
        [opt('a')],
        [{ label: 'G', values: ['a', 'missing'] }],
      );

      expect(labels(sections)).toEqual([['G', ['a']]]);
    });

    it('drops groups whose members are all absent', () => {
      const sections = buildValueMenuSections(
        [opt('a')],
        [
          { label: 'Empty', values: ['nope'] },
          { label: 'G', values: ['a'] },
        ],
      );

      expect(labels(sections)).toEqual([['G', ['a']]]);
    });

    it('resolves a value listed in two groups to the first group', () => {
      const sections = buildValueMenuSections(
        [opt('a'), opt('b')],
        [
          { label: 'One', values: ['a', 'b'] },
          { label: 'Two', values: ['b'] },
        ],
      );

      expect(labels(sections)).toEqual([['One', ['a', 'b']]]);
    });

    it('matches loosely so a stringified primitive still finds its group', () => {
      const sections = buildValueMenuSections([opt(5, 'Five')], [{ label: 'G', values: ['5'] }]);

      expect(labels(sections)).toEqual([['G', [5]]]);
    });

    it('returns no sections when the filtered value list is empty', () => {
      expect(buildValueMenuSections([], [{ label: 'G', values: ['a'] }])).toEqual([]);
    });
  });
});
