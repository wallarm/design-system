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
  /** Fires whenever the user explicitly toggles an item in multi-select mode
   *  (click or keyboard). Distinct from onBuildingValueChange, which also fires
   *  on mount with the initial preview — use this when you need to react only
   *  to actual user-initiated toggles. */
  onItemToggle?: () => void;
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
  onItemToggle,
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
      // Loose match — checkedValues may contain stringified copies after a parser
      // round-trip (e.g. "1" from clipboard paste vs the option's canonical 1).
      // Strict `.includes` would miss the match and add a duplicate instead of toggling off.
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
  }, [open, multiSelect, blurCommitRef, commitChecked]);

  // ── Flat items for keyboard nav ─────────────────────────
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
    registerItem,
    commitChecked,
    handleItemSelect,
  };
};
