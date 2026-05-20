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
 * Compose the dropdown list, pinning selected entries at the top.
 * Remembers every option ever rendered so a narrowed `values` (e.g. dynamic
 * getSuggestions) can still display the selected label/badge; fabricates a
 * plain-text option as last resort. Unselected items still respect the filter.
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
