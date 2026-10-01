import { describe, expect, it } from '@rstest/core';
import { ALL_VALUE, toAliasValue, toConsumerValue, toInternalValue } from './values';

describe('toInternalValue', () => {
  it('maps an unset single value to the «All» sentinel', () => {
    expect(toInternalValue([], { multiple: false, aliased: new Set() })).toEqual([ALL_VALUE]);
    expect(toInternalValue(['a'], { multiple: false, aliased: new Set() })).toEqual(['a']);
  });

  it('keeps an unset single value empty when the «All» row is not rendered', () => {
    expect(toInternalValue([], { multiple: false, aliased: new Set(), hasAll: false })).toEqual([]);
    expect(toInternalValue(['a'], { multiple: false, aliased: new Set(), hasAll: false })).toEqual([
      'a',
    ]);
  });

  it('doubles aliased multi values with their alias', () => {
    expect(toInternalValue(['a', 'b'], { multiple: true, aliased: new Set(['b', 'c']) })).toEqual([
      'a',
      'b',
      toAliasValue('b'),
    ]);
  });
});

describe('toConsumerValue', () => {
  it('maps the single sentinel (or nothing) to []', () => {
    const base = { multiple: false, previousInternal: ['a'], previousValue: ['a'] };
    expect(toConsumerValue([ALL_VALUE], base)).toEqual([]);
    expect(toConsumerValue([], base)).toEqual([]);
    expect(toConsumerValue(['b'], base)).toEqual(['b']);
  });

  it('ticking an alias adds its base value', () => {
    expect(
      toConsumerValue([toAliasValue('a')], {
        multiple: true,
        previousInternal: [],
        previousValue: [],
      }),
    ).toEqual(['a']);
  });

  it('unticking an alias removes its base value and the original', () => {
    const previousInternal = ['a', 'b', toAliasValue('a')];
    expect(
      toConsumerValue(['a', 'b'], { multiple: true, previousInternal, previousValue: ['a', 'b'] }),
    ).toEqual(['b']);
  });

  it('unticking the original removes the value', () => {
    const previousInternal = ['a', toAliasValue('a')];
    expect(
      toConsumerValue([toAliasValue('a')], {
        multiple: true,
        previousInternal,
        previousValue: ['a'],
      }),
    ).toEqual([]);
  });

  it('a full clear from Ark empties the value', () => {
    expect(
      toConsumerValue([], {
        multiple: true,
        previousInternal: ['a', toAliasValue('a'), 'b'],
        previousValue: ['a', 'b'],
      }),
    ).toEqual([]);
  });
});
