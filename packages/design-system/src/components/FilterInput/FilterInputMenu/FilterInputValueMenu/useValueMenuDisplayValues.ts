import { useEffect, useMemo, useRef } from 'react';
import type { ValueOption } from './FilterInputValueMenu';

type ConditionValue = string | number | boolean;

interface UseValueMenuDisplayValuesOptions {
  /** Raw option list coming from the parent (e.g. `getSuggestions` output). */
  values: ValueOption[];
  /** Filtered / sorted view of `values` used for normal rendering. */
  filteredValues: ValueOption[];
  multiSelect: boolean;
  /** Currently checked values when `multiSelect` is true. */
  checkedValues: ConditionValue[];
  /** Currently highlighted value when `multiSelect` is false. */
  highlightValue?: ConditionValue;
}

/**
 * Compose the final dropdown list shown to the user.
 *
 * The parent helper (`values`) is free to change shape between renders — for
 * instance a dynamic `getSuggestions` may narrow its result after a selection
 * is made. This hook keeps the user's currently-selected entries pinned at
 * the top of the list with a stable presentation:
 *
 *  1. Every option the menu has ever rendered is remembered in a `Map` keyed
 *     by value. When a selected entry is no longer in the current `values`,
 *     the remembered option (with its original label/badge) is used.
 *  2. If nothing has been seen for that value either, a plain-text option is
 *     fabricated so the user can still see and toggle it.
 *  3. Unchecked items come from `filteredValues` (already filter-sorted) so
 *     the search query still applies to them.
 */
export const useValueMenuDisplayValues = ({
  values,
  filteredValues,
  multiSelect,
  checkedValues,
  highlightValue,
}: UseValueMenuDisplayValuesOptions): ValueOption[] => {
  // Stash every option we have ever rendered so we can still present it
  // (with its badge/label) after the parent's `values` list narrows away
  // from it. Writing via effect keeps render strict-mode / concurrent safe —
  // the one-render lag is invisible because a freshly-seen option is always
  // already present in `values` for the same render that first uses it.
  const optionMemoryRef = useRef<Map<string, ValueOption>>(new Map());
  useEffect(() => {
    for (const opt of values) {
      optionMemoryRef.current.set(String(opt.value), opt);
    }
  }, [values]);

  return useMemo(() => {
    const selectedList: ConditionValue[] = multiSelect
      ? checkedValues
      : highlightValue != null
        ? [highlightValue]
        : [];
    if (selectedList.length === 0) return filteredValues;

    const selectedSet = new Set(selectedList.map(String));
    const selectedItems = selectedList.map(v => {
      const key = String(v);
      const match = values.find(opt => String(opt.value) === key);
      if (match) return match;
      const remembered = optionMemoryRef.current.get(key);
      if (remembered) return remembered;
      return { value: v, label: key };
    });
    const restFiltered = filteredValues.filter(v => !selectedSet.has(String(v.value)));
    return [...selectedItems, ...restFiltered];
  }, [filteredValues, values, multiSelect, checkedValues, highlightValue]);
};
