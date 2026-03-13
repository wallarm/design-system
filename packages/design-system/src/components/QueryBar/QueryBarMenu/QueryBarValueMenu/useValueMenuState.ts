import type { RefObject } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { QueryBarDropdownItem } from '../../types';
import { useKeyboardNav } from '../useKeyboardNav';
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
  menuRef?: RefObject<HTMLDivElement | null>;
  /** Ref to register blur commit function — called by blur handler before state reset. Returns true if committed. */
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
  inputRef,
  menuRef,
  blurCommitRef,
}: UseValueMenuStateOptions) => {
  // ── Multi-select internal state ─────────────────────────
  const [checkedValues, setCheckedValues] = useState<ConditionValue[]>(initialValues);
  // Single source of truth: ref is always synced declaratively from state
  const checkedValuesRef = useRef(checkedValues);
  checkedValuesRef.current = checkedValues;

  // Reset checked values on open transition
  const prevOpenRef = useRef(false);
  const initialValuesRef = useRef(initialValues);
  initialValuesRef.current = initialValues;
  useEffect(() => {
    if (open && !prevOpenRef.current) {
      setCheckedValues(initialValuesRef.current);
    }
    prevOpenRef.current = open;
  }, [open]);

  // Sync checked values when initialValues change while menu is already open
  // (e.g., user edits segment text to remove a value — dropdown should uncheck it)
  const serializedInitial = initialValues.map(String).sort().join('\0');
  useEffect(() => {
    if (open && prevOpenRef.current) {
      setCheckedValues(initialValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serializedInitial]);

  const toggleValue = (val: ConditionValue) => {
    setCheckedValues(prev => (prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]));
  };

  const onCommitRef = useRef(onCommit);
  onCommitRef.current = onCommit;

  const commitChecked = (): boolean => {
    if (checkedValuesRef.current.length > 0 && onCommitRef.current) {
      onCommitRef.current(checkedValuesRef.current);
      return true;
    }
    return false;
  };

  // Register blur commit function so the blur handler can commit before resetting state
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, multiSelect, blurCommitRef]);

  // ── Flat items for keyboard nav ─────────────────────────
  const flatItems: QueryBarDropdownItem[] = useMemo(
    () => values.map(opt => ({ id: String(opt.value), label: opt.label, value: opt.value })),
    [values],
  );

  const handleItemSelect = (item: QueryBarDropdownItem) => {
    if (multiSelect) {
      toggleValue(item.value as ConditionValue);
    } else {
      onSelect(item.value as ConditionValue);
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
    menuRef,
  });

  // ── Selected values for display ─────────────────────────
  const selectedValues = multiSelect
    ? checkedValues
    : highlightValue != null
      ? [highlightValue]
      : [];

  // ── Building value preview ──────────────────────────────
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
    commitChecked,
    handleItemSelect,
  };
};
