import type { RefObject } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { FilterInputDropdownItem } from '../../types';
import { useKeyboardNav } from '../hooks/useKeyboardNav';
import type { ValueOption } from './FilterInputValueMenu';

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
  /** Fires only on user-initiated toggles in multi-select (unlike
   *  onBuildingValueChange which also fires on mount). */
  onItemToggle?: () => void;
  inputRef?: RefObject<HTMLInputElement | null>;
  menuRef?: RefObject<HTMLDivElement | null>;
  /** Register blur commit fn — called by blur handler before state reset. */
  blurCommitRef?: RefObject<(() => boolean) | null>;
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
  onItemToggle,
  inputRef,
  menuRef,
  blurCommitRef,
}: UseValueMenuStateOptions) => {
  const [checkedValues, setCheckedValues] = useState<ConditionValue[]>(initialValues);
  const checkedValuesRef = useRef(checkedValues);
  checkedValuesRef.current = checkedValues;

  // Reset checked values on open transition.
  const prevOpenRef = useRef(false);
  const initialValuesRef = useRef(initialValues);
  initialValuesRef.current = initialValues;
  useEffect(() => {
    if (open && !prevOpenRef.current) {
      setCheckedValues(initialValuesRef.current);
    }
    prevOpenRef.current = open;
  }, [open]);

  // Sync checked values when initialValues change while menu stays open
  // (e.g., user edits segment text to remove a value).
  const prevSerializedRef = useRef('');
  useEffect(() => {
    const serialized = initialValues.map(String).sort().join('\0');
    if (serialized === prevSerializedRef.current) return;
    prevSerializedRef.current = serialized;
    if (open && prevOpenRef.current) {
      setCheckedValues(initialValues);
    }
  }, [initialValues, open]);

  const toggleValue = (val: ConditionValue) => {
    setCheckedValues(prev => {
      // Loose match — checkedValues may be stringified after parser round-trip
      // (e.g. "1" from paste vs canonical 1); strict .includes would dupe.
      const key = String(val);
      const exists = prev.some(v => String(v) === key);
      return exists ? prev.filter(v => String(v) !== key) : [...prev, val];
    });
  };

  const onCommitRef = useRef(onCommit);
  onCommitRef.current = onCommit;

  const commitChecked = useCallback((): boolean => {
    if (checkedValuesRef.current.length > 0 && onCommitRef.current) {
      onCommitRef.current(checkedValuesRef.current);
      return true;
    }
    return false;
  }, []);

  // Register blur commit so the blur handler can commit before state reset.
  useEffect(() => {
    if (!blurCommitRef) return;
    if (open && multiSelect) {
      blurCommitRef.current = commitChecked;
    } else {
      blurCommitRef.current = null;
    }
    return () => {
      blurCommitRef.current = null;
    };
  }, [open, multiSelect, blurCommitRef, commitChecked]);

  const flatItems: FilterInputDropdownItem[] = useMemo(
    () => values.map(opt => ({ id: String(opt.value), label: opt.label, value: opt.value })),
    [values],
  );

  const handleItemSelect = (item: FilterInputDropdownItem) => {
    if (multiSelect) {
      toggleValue(item.value as ConditionValue);
      onItemToggle?.();
    } else {
      onSelect(item.value as ConditionValue);
    }
  };

  const handleClose = () => {
    if (multiSelect) commitChecked();
    onOpenChange?.(false);
  };

  const { highlightedValue, onHighlightChange, pendingIds, registerItem } = useKeyboardNav({
    items: flatItems,
    open,
    onSelect: handleItemSelect,
    onClose: onEscape ?? handleClose,
    onArrowRight: multiSelect ? () => commitChecked() : undefined,
    onPendingCommit: multiSelect ? () => commitChecked() : undefined,
    inputRef,
    menuRef,
  });

  const selectedValues = multiSelect
    ? checkedValues
    : highlightValue != null
      ? [highlightValue]
      : [];

  const buildingMultiValue =
    multiSelect && checkedValues.length > 0
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
    registerItem,
    commitChecked,
    handleItemSelect,
  };
};
