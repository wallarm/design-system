import { describe, expect, it } from 'vitest';
import { buildChips } from '../hooks/useFilterInputExpression/buildChips';
import type { Condition, FieldMetadata } from '../types';

const fields: FieldMetadata[] = [
  {
    name: 'priority',
    label: 'Priority',
    type: 'integer',
    values: [
      { value: 1, label: 'Low' },
      { value: 5, label: 'Medium' },
      { value: 10, label: 'High' },
    ],
  },
  {
    name: 'tag',
    label: 'Tag',
    type: 'string',
    values: [
      { value: 'urgent', label: 'Urgent' },
      { value: 'review', label: 'Review' },
    ],
  },
];

const findChip = (chips: ReturnType<typeof buildChips>) => chips.find(c => c.variant === 'chip');

describe('buildChips — loose-match label resolution (AS-882)', () => {
  describe('single-value condition', () => {
    it('resolves label when value is the canonical type (number)', () => {
      const conditions: Condition[] = [
        { type: 'condition', field: 'priority', operator: '=', value: 5 },
      ];
      expect(findChip(buildChips(conditions, [], fields, false))?.value).toBe('Medium');
    });

    it('resolves label when value is a stringified number (post-parser round-trip)', () => {
      const conditions: Condition[] = [
        { type: 'condition', field: 'priority', operator: '=', value: '5' },
      ];
      expect(findChip(buildChips(conditions, [], fields, false))?.value).toBe('Medium');
    });

    it('falls back to raw value when no option matches', () => {
      const conditions: Condition[] = [
        { type: 'condition', field: 'priority', operator: '=', value: 999 },
      ];
      expect(findChip(buildChips(conditions, [], fields, false))?.value).toBe('999');
    });

    it('preserves canonical-type match for string fields', () => {
      const conditions: Condition[] = [
        { type: 'condition', field: 'tag', operator: '=', value: 'urgent' },
      ];
      expect(findChip(buildChips(conditions, [], fields, false))?.value).toBe('Urgent');
    });
  });

  describe('multi-value condition', () => {
    it('resolves all labels when values are canonical numbers', () => {
      const conditions: Condition[] = [
        { type: 'condition', field: 'priority', operator: 'in', value: [1, 5] },
      ];
      const chip = findChip(buildChips(conditions, [], fields, false));
      expect(chip?.value).toBe('Low, Medium');
      expect(chip?.valueParts).toEqual(['Low', 'Medium']);
    });

    it('resolves all labels when values are stringified numbers', () => {
      const conditions: Condition[] = [
        { type: 'condition', field: 'priority', operator: 'in', value: ['1', '5'] },
      ];
      const chip = findChip(buildChips(conditions, [], fields, false));
      expect(chip?.value).toBe('Low, Medium');
      expect(chip?.valueParts).toEqual(['Low', 'Medium']);
    });

    it('mixes resolved labels and raw fallbacks for unknown values', () => {
      const conditions: Condition[] = [
        { type: 'condition', field: 'priority', operator: 'in', value: ['1', '99'] },
      ];
      const chip = findChip(buildChips(conditions, [], fields, false));
      expect(chip?.valueParts).toEqual(['Low', '99']);
    });
  });
});
