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
 * Compose the dropdown list.
 *
 * Single-select: pins the selected entry at the top so it is immediately
 * visible even when the list is long.
 *
 * Multi-select: keeps the original `filteredValues` order so selecting an
 * item does not cause the list to jump. Only checked items that are absent
 * from `filteredValues` (e.g. after `values` narrowed via dynamic
 * getSuggestions) are prepended at the top so they remain accessible.
 *
 * Remembers every option ever rendered so a narrowed `values` can still
 * display the selected label/badge; fabricates a plain-text option as last
 * resort.
 */
export const useValueMenuDisplayValues = ({
  values,
  filteredValues,
  multiSelect,
  checkedValues,
  highlightValue,
}: UseValueMenuDisplayValuesOptions): ValueOption[] => {
  // Stash every option seen so we can still render it (with badge/label)
  // after `values` narrows. Write via effect for strict-mode safety — the
  // one-render lag is invisible because a freshly-seen option is already in
  // `values` for the render that first uses it.
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

    if (multiSelect) {
      // Preserve original list order. Only prepend checked items that are
      // absent from filteredValues (values narrowed after selection).
      const filteredSet = new Set(filteredValues.map(v => String(v.value)));
      const orphaned = selectedList
        .filter(v => !filteredSet.has(String(v)))
        .map(v => {
          const key = String(v);
          return (
            values.find(opt => String(opt.value) === key) ??
            optionMemoryRef.current.get(key) ??
            ({ value: v, label: key } as ValueOption)
          );
        });
      return orphaned.length > 0 ? [...orphaned, ...filteredValues] : filteredValues;
    }

    // Single-select: pin the selected item at the top.
    const selectedSet = new Set(selectedList.map(String));
    const selectedItems = selectedList.map(v => {
      const key = String(v);
      const match = values.find(opt => String(opt.value) === key);
      if (match) return match;
      const remembered = optionMemoryRef.current.get(key);
      if (remembered) return remembered;
      return { value: v, label: key } as ValueOption;
    });
    const restFiltered = filteredValues.filter(v => !selectedSet.has(String(v.value)));
    return [...selectedItems, ...restFiltered];
  }, [filteredValues, values, multiSelect, checkedValues, highlightValue]);
};
