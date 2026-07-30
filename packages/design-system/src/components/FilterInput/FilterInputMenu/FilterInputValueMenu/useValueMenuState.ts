import type { RefObject } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ValueMenuSection } from '../../lib';
import type { FilterInputDropdownItem } from '../../types';
import { useKeyboardNav } from '../hooks/useKeyboardNav';
import type { ValueOption } from './FilterInputValueMenu';
import { toGroupItemId } from './ValueMenuGroupHeader';

type ConditionValue = string | number | boolean;

/**
 * Payload marking a keyboard-nav entry as a group header rather than a value.
 * Carries the members so select routing needs no lookup back into sections.
 */
interface GroupNavPayload {
  kind: 'value-group';
  label: string;
  members: ConditionValue[];
}

const isGroupNavItem = (value: unknown): value is GroupNavPayload =>
  typeof value === 'object' && value !== null && (value as GroupNavPayload).kind === 'value-group';

interface UseValueMenuStateOptions {
  values: ValueOption[];
  /** Rendered sections, in visual order — drives keyboard-nav ordering. */
  sections: Array<ValueMenuSection<ValueOption>>;
  /** Whether group headers participate in selection and keyboard nav. */
  groupSelectable: boolean;
  open: boolean;
  multiSelect: boolean;
  initialValues: ConditionValue[];
  highlightValue?: ConditionValue;
  onSelect: (value: ConditionValue) => void;
  onCommit?: (values: ConditionValue[]) => void;
  /**
   * A group header selected while the operator is single-select. The parent
   * switches to the matching multi-select operator and commits the members in
   * one step — the menu can't change an operator itself.
   */
  onSelectGroup?: (values: ConditionValue[]) => void;
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
  sections,
  groupSelectable,
  open,
  multiSelect,
  initialValues,
  highlightValue,
  onSelect,
  onCommit,
  onSelectGroup,
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

  // Reset checkedValues only when the editing context changes (initialValues
  // serial changes). Resetting on every open false→true transition would wipe
  // user-entered toggles in a building session — Ark UI's outside-click during
  // a click on the FilterInput area calls `onOpenChange(false)` even when
  // combobox focus retention keeps the menu effectively open, and the next
  // re-open would discard the in-progress multi-select.
  const prevSerializedRef = useRef<string | null>(null);
  useEffect(() => {
    const serialized = initialValues.map(String).sort().join('\0');
    if (serialized === prevSerializedRef.current) return;
    prevSerializedRef.current = serialized;
    setCheckedValues(initialValues);
  }, [initialValues]);

  const toggleValue = (val: ConditionValue) => {
    setCheckedValues(prev => {
      // Loose match — checkedValues may be stringified after parser round-trip
      // (e.g. "1" from paste vs canonical 1); strict .includes would dupe.
      const key = String(val);
      const exists = prev.some(v => String(v) === key);
      return exists ? prev.filter(v => String(v) !== key) : [...prev, val];
    });
  };

  /**
   * Select-all / clear-all over a group's members. `members` is already narrowed
   * to the *visible* rows by the caller, so selecting a searched-down group never
   * silently checks values the user can't see.
   */
  const toggleGroup = (members: ConditionValue[]) => {
    setCheckedValues(prev => {
      const memberKeys = new Set(members.map(String));
      const allChecked = members.every(m => prev.some(v => String(v) === String(m)));
      if (allChecked) return prev.filter(v => !memberKeys.has(String(v)));
      const missing = members.filter(m => !prev.some(v => String(v) === String(m)));
      return [...prev, ...missing];
    });
  };

  const onCommitRef = useRef(onCommit);
  onCommitRef.current = onCommit;

  // Re-entry guard: blurCommitRef is read by both handleAreaClick and
  // handleBlur in the same event sequence. Cleanup that nulls the ref runs in
  // the next commit phase, so a back-to-back read in the current tick would
  // re-commit the same checked values. Mirror the discipline in useBlurCommit.
  const committingRef = useRef(false);

  const commitChecked = useCallback((): boolean => {
    if (committingRef.current) return false;
    if (checkedValuesRef.current.length === 0 || !onCommitRef.current) return false;
    committingRef.current = true;
    try {
      onCommitRef.current(checkedValuesRef.current);
      return true;
    } finally {
      committingRef.current = false;
    }
  }, []);

  // Register blur/area-click commit while the value menu is mounted in
  // multi-select mode. NOT gated on `open`: Ark UI's outside-click during a
  // click on the FilterInput area flips `open` to false before our onClick
  // handler runs, and a gated ref would already be null by the time
  // handleAreaClick reads it — the in-progress multi-select would silently
  // fall through to the force-commit branch and lose the checked values.
  // `commitChecked` guards on `checkedValuesRef.current.length > 0` so leaving
  // the ref armed while closed never commits an empty set.
  useEffect(() => {
    if (!blurCommitRef) return;
    if (multiSelect) {
      blurCommitRef.current = commitChecked;
    } else {
      blurCommitRef.current = null;
    }
    return () => {
      blurCommitRef.current = null;
    };
  }, [multiSelect, blurCommitRef, commitChecked]);

  // Keyboard-nav order follows the rendered sections top-to-bottom, so a
  // selectable group header is navigated to just before its own members.
  const flatItems: FilterInputDropdownItem[] = useMemo(() => {
    const items: FilterInputDropdownItem[] = [];
    for (const section of sections) {
      if (section.label && groupSelectable) {
        items.push({
          id: toGroupItemId(section.label),
          label: section.label,
          value: {
            kind: 'value-group',
            label: section.label,
            members: section.values.map(opt => opt.value),
          } satisfies GroupNavPayload,
        });
      }
      for (const opt of section.values) {
        items.push({ id: String(opt.value), label: opt.label, value: opt.value });
      }
    }
    return items;
  }, [sections, groupSelectable]);

  const handleItemSelect = (item: FilterInputDropdownItem) => {
    if (isGroupNavItem(item.value)) {
      const { members } = item.value;
      if (members.length === 0) return;
      if (multiSelect) {
        toggleGroup(members);
        onItemToggle?.();
      } else {
        // Single-select can't hold a group: hand off so the parent switches to
        // the matching multi-select operator and commits in one step.
        onSelectGroup?.(members);
      }
      return;
    }
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
