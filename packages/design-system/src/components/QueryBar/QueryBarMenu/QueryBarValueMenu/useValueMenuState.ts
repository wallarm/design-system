import type { RefObject } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useKeyboardNav } from '../../hooks';
import type { QueryBarDropdownItem } from '../../types';
import type { ValueOption } from './QueryBarValueMenu';

type ConditionValue = string | number | boolean;

interface UseValueMenuStateOptions {
  values: ValueOption[];
  open: boolean;
  multiSelect: boolean;
  initialValues: ConditionValue[];
  highlightValue?: ConditionValue;
  onSelect: (value: ConditionValue) => void;
  onCommit?: (values: ConditionValue[]) => void;
  onEscape?: () => void;
  onOpenChange?: (open: boolean) => void;
  onBuildingValueChange?: (preview: string | undefined) => void;
  inputRef?: RefObject<HTMLInputElement | null>;
}

export const useValueMenuState = ({
  values,
  open,
  multiSelect,
  initialValues,
  highlightValue,
  onSelect,
  onCommit,
  onEscape,
  onOpenChange,
  onBuildingValueChange,
  inputRef,
}: UseValueMenuStateOptions) => {
  // ── Multi-select internal state ─────────────────────────
  const [checkedValues, setCheckedValues] = useState<ConditionValue[]>(initialValues);
  const checkedValuesRef = useRef(checkedValues);

  // Only reset checked values on open transition, not on every initialValues reference change
  const prevOpenRef = useRef(false);
  useEffect(() => {
    if (open && !prevOpenRef.current) {
      setCheckedValues(initialValues);
      checkedValuesRef.current = initialValues;
    }
    prevOpenRef.current = open;
  }, [open, initialValues]);

  const toggleValue = (val: ConditionValue) => {
    setCheckedValues(prev => {
      const next = prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val];
      checkedValuesRef.current = next;
      return next;
    });
  };

  const commitChecked = () => {
    if (checkedValuesRef.current.length > 0 && onCommit) {
      onCommit(checkedValuesRef.current);
    }
  };

  // ── Flat items for keyboard nav ─────────────────────────
  const flatItems: QueryBarDropdownItem[] = useMemo(
    () => values.map(opt => ({ id: String(opt.value), label: opt.label, value: opt.value })),
    [values],
  );

  const handleItemSelect = (item: QueryBarDropdownItem) => {
    if (multiSelect) {
      toggleValue(item.value);
    } else {
      onSelect(item.value);
    }
  };

  const handleClose = () => {
    if (multiSelect) commitChecked();
    onOpenChange?.(false);
  };

  const { highlightedValue, onHighlightChange, pendingIds } = useKeyboardNav({
    items: flatItems,
    open,
    onSelect: handleItemSelect,
    onClose: onEscape ?? handleClose,
    onArrowRight: multiSelect ? () => commitChecked() : undefined,
    onPendingCommit: multiSelect ? () => commitChecked() : undefined,
    inputRef,
  });

  // ── Selected values for display ─────────────────────────
  const selectedValues = multiSelect
    ? checkedValues
    : highlightValue != null
      ? [highlightValue]
      : [];

  // ── Building value preview ──────────────────────────────
  const buildingMultiValue = multiSelect && checkedValues.length > 0
    ? checkedValues.map(v => values.find(opt => opt.value === v)?.label ?? String(v)).join(', ')
    : undefined;

  useEffect(() => {
    onBuildingValueChange?.(buildingMultiValue);
  }, [buildingMultiValue, onBuildingValueChange]);

  return {
    checkedValues,
    selectedValues,
    highlightedValue,
    onHighlightChange,
    pendingIds,
    commitChecked,
    handleItemSelect,
  };
};
