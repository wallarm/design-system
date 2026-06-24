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

  // After a field change the value may no longer match the new field, but its
  // label still lives on the field it came from — an errored chip keeps showing
  // the label rather than reverting to the raw value (AS-1085).
  describe('cross-field label fallback for errored chip', () => {
    it('resolves a single value via another field when the current field lacks it', () => {
      const conditions: Condition[] = [
        { type: 'condition', field: 'priority', operator: '=', value: 'urgent', error: 'value' },
      ];
      // 'urgent' is not a priority option, but Tag defines it as "Urgent".
      expect(findChip(buildChips(conditions, [], fields, false))?.value).toBe('Urgent');
    });

    it('resolves multi values via another field when the current field lacks them', () => {
      const conditions: Condition[] = [
        {
          type: 'condition',
          field: 'priority',
          operator: 'in',
          value: ['urgent', 'review'],
          error: 'value',
        },
      ];
      const chip = findChip(buildChips(conditions, [], fields, false));
      expect(chip?.valueParts).toEqual(['Urgent', 'Review']);
    });

    it('still falls back to the raw value when no field defines it', () => {
      const conditions: Condition[] = [
        { type: 'condition', field: 'priority', operator: '=', value: 'mystery', error: 'value' },
      ];
      expect(findChip(buildChips(conditions, [], fields, false))?.value).toBe('mystery');
    });

    // Changing a chip's field carries the value over even across data types and
    // onto freeform fields; with strictValues:false the chip is no longer
    // errored, but the value's label still lives on its origin field and is shown
    // rather than the raw value (AS-1134). Trade-off: a value typed into a
    // freeform field that happens to equal another field's option value is shown
    // with that option's label.
    it('borrows the label for a non-errored value carried onto a freeform field', () => {
      const withFreeform: FieldMetadata[] = [
        ...fields,
        { name: 'note', label: 'Note', type: 'string' }, // freeform, no options
      ];
      const conditions: Condition[] = [
        // value equals Tag's "review" option value → shows its label
        { type: 'condition', field: 'note', operator: '=', value: 'review' },
      ];
      expect(findChip(buildChips(conditions, [], withFreeform, false))?.value).toBe('Review');
    });

    it('keeps the raw value when no field defines it', () => {
      const withFreeform: FieldMetadata[] = [
        ...fields,
        { name: 'note', label: 'Note', type: 'string' },
      ];
      const conditions: Condition[] = [
        { type: 'condition', field: 'note', operator: '=', value: 'freeform text' },
      ];
      expect(findChip(buildChips(conditions, [], withFreeform, false))?.value).toBe(
        'freeform text',
      );
    });

    it('borrows the label for a non-errored value when the current field has its own values', () => {
      const conditions: Condition[] = [
        // 'urgent' is not a Priority option, but Tag defines it as "Urgent".
        { type: 'condition', field: 'priority', operator: '=', value: 'urgent' },
      ];
      expect(findChip(buildChips(conditions, [], fields, false))?.value).toBe('Urgent');
    });

    it('borrows labels for non-errored multi values when the current field has its own values', () => {
      const conditions: Condition[] = [
        { type: 'condition', field: 'priority', operator: 'in', value: ['urgent', 'review'] },
      ];
      expect(findChip(buildChips(conditions, [], fields, false))?.valueParts).toEqual([
        'Urgent',
        'Review',
      ]);
    });
  });

  // No-value operators (is_null / is_not_null) carry no real value, but the
  // chip must still render three segments — the value slot is filled by a
  // visual placeholder so building and committed chips look uniform.
  describe('no-value operator placeholder', () => {
    it('renders placeholder value for is_null', () => {
      const conditions: Condition[] = [
        { type: 'condition', field: 'tag', operator: 'is_null', value: null },
      ];
      expect(findChip(buildChips(conditions, [], fields, false))?.value).toBe('—');
    });

    it('renders placeholder value for is_not_null', () => {
      const conditions: Condition[] = [
        { type: 'condition', field: 'tag', operator: 'is_not_null', value: null },
      ];
      expect(findChip(buildChips(conditions, [], fields, false))?.value).toBe('—');
    });
  });
});

describe('buildChips — paired field (AS-1160)', () => {
  const pairedField: FieldMetadata = { name: 'ctx_value', label: 'Value', type: 'string' };
  const pairedFields: FieldMetadata[] = [
    { name: 'ctx_param', label: 'Context Param', type: 'string', pairedField },
  ];

  it('emits a pair display triplet from condition.pair', () => {
    const conditions: Condition[] = [
      {
        type: 'condition',
        field: 'ctx_param',
        operator: '=',
        value: 'xxx',
        pair: { operator: '=', value: 'yyy' },
      },
    ];
    const chip = findChip(buildChips(conditions, [], pairedFields, false));
    expect(chip?.attribute).toBe('Context Param');
    expect(chip?.value).toBe('xxx');
    expect(chip?.pair).toEqual({ attribute: 'Value', operator: 'is', value: 'yyy' });
  });

  it('renders the no-value placeholder for a paired "is set"/"is not set" operator', () => {
    const conditions: Condition[] = [
      {
        type: 'condition',
        field: 'ctx_param',
        operator: '=',
        value: 'xxx',
        pair: { operator: 'is_null', value: null },
      },
    ];
    const chip = findChip(buildChips(conditions, [], pairedFields, false));
    expect(chip?.pair).toEqual({ attribute: 'Value', operator: 'is set', value: '—' });
  });

  it('omits pair when the field has no pairedField', () => {
    const plainFields: FieldMetadata[] = [
      { name: 'ctx_param', label: 'Context Param', type: 'string' },
    ];
    const conditions: Condition[] = [
      {
        type: 'condition',
        field: 'ctx_param',
        operator: '=',
        value: 'xxx',
        pair: { operator: '=', value: 'yyy' },
      },
    ];
    expect(findChip(buildChips(conditions, [], plainFields, false))?.pair).toBeUndefined();
  });
});
