import { describe, expect, it } from 'vitest';
import { findOptionByValue } from '../lib';
import type { FieldMetadata } from '../types';

const integerField: FieldMetadata = {
  name: 'priority',
  label: 'Priority',
  type: 'integer',
  values: [
    { value: 1, label: 'Low' },
    { value: 5, label: 'Medium' },
    { value: 10, label: 'High' },
  ],
};

const stringField: FieldMetadata = {
  name: 'tag',
  label: 'Tag',
  type: 'string',
  values: [
    { value: 'urgent', label: 'Urgent' },
    { value: 'review', label: 'Review' },
  ],
};

const noValuesField: FieldMetadata = { name: 'free', label: 'Free', type: 'string' };

describe('findOptionByValue — AS-882', () => {
  it('matches canonical-typed value (number → number)', () => {
    expect(findOptionByValue(integerField, 5)?.label).toBe('Medium');
  });

  it('matches loose-typed value (string → number)', () => {
    expect(findOptionByValue(integerField, '5')?.label).toBe('Medium');
  });

  it('matches canonical-typed string value', () => {
    expect(findOptionByValue(stringField, 'urgent')?.label).toBe('Urgent');
  });

  it('returns undefined when value is not in the option list', () => {
    expect(findOptionByValue(integerField, 999)).toBeUndefined();
    expect(findOptionByValue(stringField, 'unknown')).toBeUndefined();
  });

  it('returns undefined when field has no values allowlist', () => {
    expect(findOptionByValue(noValuesField, 'whatever')).toBeUndefined();
  });

  it('returns undefined for null / undefined value', () => {
    expect(findOptionByValue(integerField, null)).toBeUndefined();
    expect(findOptionByValue(integerField, undefined)).toBeUndefined();
  });

  it('returns undefined when field is undefined', () => {
    expect(findOptionByValue(undefined, 5)).toBeUndefined();
  });

  it('matches boolean value', () => {
    const boolField: FieldMetadata = {
      name: 'active',
      label: 'Active',
      type: 'string',
      values: [
        { value: true, label: 'Yes' },
        { value: false, label: 'No' },
      ],
    };
    expect(findOptionByValue(boolField, true)?.label).toBe('Yes');
    expect(findOptionByValue(boolField, 'true')?.label).toBe('Yes');
    expect(findOptionByValue(boolField, false)?.label).toBe('No');
  });
});
