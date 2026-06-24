import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { ValueOption } from '../FilterInputMenu/FilterInputValueMenu/FilterInputValueMenu';
import { useValueMenuDisplayValues } from '../FilterInputMenu/FilterInputValueMenu/useValueMenuDisplayValues';

const opt = (value: string): ValueOption => ({ value, label: `Label ${value}` });

const OPTS = [opt('a'), opt('b'), opt('c'), opt('d'), opt('e')];

describe('useValueMenuDisplayValues', () => {
  describe('multi-select', () => {
    it('returns filteredValues unchanged when nothing is checked', () => {
      const { result } = renderHook(() =>
        useValueMenuDisplayValues({
          values: OPTS,
          filteredValues: OPTS,
          multiSelect: true,
          checkedValues: [],
        }),
      );
      expect(result.current).toEqual(OPTS);
    });

    it('preserves original list order when checked items are in filteredValues', () => {
      // Checking 'c' and 'a' should NOT move them to the top
      const { result } = renderHook(() =>
        useValueMenuDisplayValues({
          values: OPTS,
          filteredValues: OPTS,
          multiSelect: true,
          checkedValues: ['c', 'a'],
        }),
      );
      // Order must be identical to OPTS
      expect(result.current.map(o => o.value)).toEqual(['a', 'b', 'c', 'd', 'e']);
    });

    it('prepends orphaned checked item when it is absent from filteredValues', () => {
      // 'a' was checked but has since been filtered out
      const narrowed = [opt('b'), opt('c'), opt('d')];
      const { result } = renderHook(() =>
        useValueMenuDisplayValues({
          values: OPTS,
          filteredValues: narrowed,
          multiSelect: true,
          checkedValues: ['a'],
        }),
      );
      expect(result.current.map(o => o.value)).toEqual(['a', 'b', 'c', 'd']);
    });

    it('prepends all orphaned items when none are in filteredValues', () => {
      const narrowed = [opt('c'), opt('d')];
      const { result } = renderHook(() =>
        useValueMenuDisplayValues({
          values: OPTS,
          filteredValues: narrowed,
          multiSelect: true,
          checkedValues: ['a', 'b'],
        }),
      );
      // 'a' and 'b' come first (in checkedValues order), then narrowed list
      expect(result.current.map(o => o.value)).toEqual(['a', 'b', 'c', 'd']);
    });

    it('fabricates an orphaned option when it is absent from both values and optionMemory', () => {
      const { result } = renderHook(() =>
        useValueMenuDisplayValues({
          values: [],
          filteredValues: [],
          multiSelect: true,
          checkedValues: ['ghost'],
        }),
      );
      expect(result.current).toHaveLength(1);
      expect(result.current[0]?.value).toBe('ghost');
      expect(result.current[0]?.label).toBe('ghost');
    });

    it('recalls a previously seen option from optionMemory after values narrows', async () => {
      // First render: option 'a' is in values (memory gets populated via effect)
      const { result, rerender } = renderHook(
        ({ vals, filtered }) =>
          useValueMenuDisplayValues({
            values: vals,
            filteredValues: filtered,
            multiSelect: true,
            checkedValues: ['a'],
          }),
        { initialProps: { vals: OPTS, filtered: OPTS } },
      );

      // Trigger the useEffect that populates optionMemory
      await act(async () => {
        // flush effects
      });

      // Narrow: 'a' is no longer in values or filteredValues
      rerender({ vals: [opt('b'), opt('c')], filtered: [opt('b'), opt('c')] });

      // 'a' should still appear (recalled from optionMemory) with original label
      expect(result.current[0]?.value).toBe('a');
      expect(result.current[0]?.label).toBe('Label a');
    });
  });

  describe('single-select', () => {
    it('returns filteredValues unchanged when highlightValue is undefined', () => {
      const { result } = renderHook(() =>
        useValueMenuDisplayValues({
          values: OPTS,
          filteredValues: OPTS,
          multiSelect: false,
          checkedValues: [],
          highlightValue: undefined,
        }),
      );
      expect(result.current).toEqual(OPTS);
    });

    it('pins the highlighted item at the top', () => {
      const { result } = renderHook(() =>
        useValueMenuDisplayValues({
          values: OPTS,
          filteredValues: OPTS,
          multiSelect: false,
          checkedValues: [],
          highlightValue: 'c',
        }),
      );
      expect(result.current[0]?.value).toBe('c');
      // remaining items follow in their filtered order
      expect(result.current.map(o => o.value)).toEqual(['c', 'a', 'b', 'd', 'e']);
    });

    it('fabricates a pinned option when highlightValue is absent from values', () => {
      const { result } = renderHook(() =>
        useValueMenuDisplayValues({
          values: OPTS,
          filteredValues: OPTS,
          multiSelect: false,
          checkedValues: [],
          highlightValue: 'unknown',
        }),
      );
      expect(result.current[0]?.value).toBe('unknown');
      expect(result.current[0]?.label).toBe('unknown');
    });
  });
});
