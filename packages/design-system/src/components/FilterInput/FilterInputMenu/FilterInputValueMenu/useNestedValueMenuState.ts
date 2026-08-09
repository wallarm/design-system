import type { RefObject } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CheckboxCheckedState } from '@ark-ui/react/checkbox';
import { collapseValueOptions, collectLeaves } from '../../lib';
import type { ValueMenuRow, ValueMenuSection } from '../../lib/buildValueMenuSections';
import type { FieldValueOption, FilterInputDropdownItem } from '../../types';
import { useKeyboardNav } from '../hooks/useKeyboardNav';

type ConditionValue = string | number | boolean;

/** Sentinel id for the submenu's "Select all / Unselect all" toggle row. */
export const SELECT_ALL_ID = '__filter_value_select_all__';

interface UseNestedValueMenuStateOptions {
  /** Filtered, ordered top-level sections. */
  sections: ValueMenuSection[];
  /** Full (unfiltered) value tree — used for leaf-label resolution / preview. */
  allValues: FieldValueOption[];
  open: boolean;
  multiSelect: boolean;
  initialValues: ConditionValue[];
  onSelect: (value: ConditionValue) => void;
  onCommit?: (values: ConditionValue[]) => void;
  onEscape?: () => void;
  onOpenChange?: (open: boolean) => void;
  onBuildingValueChange?: (preview: string | undefined) => void;
  onItemToggle?: () => void;
  inputRef?: RefObject<HTMLInputElement | null>;
  menuRef?: RefObject<HTMLDivElement | null>;
  submenuRef?: RefObject<HTMLDivElement | null>;
  blurCommitRef?: RefObject<(() => boolean) | null>;
}

const leafKeys = (option: FieldValueOption): string[] =>
  collectLeaves(option.children).map(leaf => String(leaf.value));

/**
 * Selection + two-level keyboard navigation for the **nested** value menu
 * (sections + a right-side submenu of leaf sub-values). Selection state is a
 * single flat array of committed **leaf** values — group rows are never stored;
 * toggling one is a bulk shortcut for its descendant leaves.
 *
 * Only one level listens for keys at a time: the two `useKeyboardNav` instances
 * are gated on `open` so the top-level listener detaches while the submenu is
 * open and vice-versa (no double navigation).
 */
export const useNestedValueMenuState = ({
  sections,
  allValues,
  open,
  multiSelect,
  initialValues,
  onSelect,
  onCommit,
  onEscape,
  onOpenChange,
  onBuildingValueChange,
  onItemToggle,
  inputRef,
  menuRef,
  submenuRef,
  blurCommitRef,
}: UseNestedValueMenuStateOptions) => {
  const [checkedValues, setCheckedValues] = useState<ConditionValue[]>(initialValues);
  const checkedValuesRef = useRef(checkedValues);
  checkedValuesRef.current = checkedValues;

  const [openParentId, setOpenParentId] = useState<string | null>(null);

  const checkedSet = useMemo(() => new Set(checkedValues.map(String)), [checkedValues]);

  // Reset checked values only when the editing context changes (mirrors the
  // flat useValueMenuState discipline — see its comment for the Ark
  // outside-click rationale).
  const prevSerializedRef = useRef<string | null>(null);
  useEffect(() => {
    const serialized = initialValues.map(String).sort().join('\0');
    if (serialized === prevSerializedRef.current) return;
    prevSerializedRef.current = serialized;
    setCheckedValues(initialValues);
  }, [initialValues]);

  // Close any open submenu when the whole menu closes.
  const prevOpenRef = useRef(open);
  useEffect(() => {
    if (!open && prevOpenRef.current) setOpenParentId(null);
    prevOpenRef.current = open;
  }, [open]);

  const topRows = useMemo(() => sections.flatMap(section => section.rows), [sections]);
  const topRowsRef = useRef(topRows);
  topRowsRef.current = topRows;

  const openParentRow = useMemo(
    () => topRows.find(row => row.id === openParentId && row.isGroup && !row.isSelectAll),
    [topRows, openParentId],
  );

  // Direct children of the open parent become the submenu rows.
  const submenuRows = useMemo<ValueMenuRow[]>(() => {
    if (!openParentRow) return [];
    return (openParentRow.option.children ?? []).map(child => ({
      id:
        'value' in child && child.value != null
          ? `leaf:${String(child.value)}`
          : `group:${child.label}`,
      option: child,
      isGroup: Array.isArray(child.children),
    }));
  }, [openParentRow]);

  const toggleValue = useCallback((value: ConditionValue) => {
    setCheckedValues(prev => {
      const key = String(value);
      return prev.some(v => String(v) === key)
        ? prev.filter(v => String(v) !== key)
        : [...prev, value];
    });
  }, []);

  /** Bulk add/remove a set of leaf values (used for group rows + Select all). */
  const toggleMany = useCallback((values: ConditionValue[], on: boolean) => {
    if (values.length === 0) return;
    setCheckedValues(prev => {
      const keys = new Set(values.map(String));
      const without = prev.filter(v => !keys.has(String(v)));
      return on ? [...without, ...values] : without;
    });
  }, []);

  // ---- commit plumbing (mirrors flat useValueMenuState) ---------------------
  const onCommitRef = useRef(onCommit);
  onCommitRef.current = onCommit;
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

  useEffect(() => {
    if (!blurCommitRef) return;
    blurCommitRef.current = multiSelect ? commitChecked : null;
    return () => {
      blurCommitRef.current = null;
    };
  }, [multiSelect, blurCommitRef, commitChecked]);

  // ---- check-state helpers --------------------------------------------------
  const isLeafChecked = useCallback(
    (value: ConditionValue) => checkedSet.has(String(value)),
    [checkedSet],
  );

  const getRowCheckState = useCallback(
    (row: ValueMenuRow): CheckboxCheckedState => {
      if (!row.isGroup) return isLeafChecked(row.option.value as ConditionValue);
      const keys = leafKeys(row.option);
      const present = keys.filter(key => checkedSet.has(key)).length;
      if (present === 0) return false;
      if (present === keys.length) return true;
      return 'indeterminate';
    },
    [checkedSet, isLeafChecked],
  );

  const allLeavesChecked = useCallback(
    (option: FieldValueOption): boolean => {
      const keys = leafKeys(option);
      return keys.length > 0 && keys.every(key => checkedSet.has(key));
    },
    [checkedSet],
  );

  // ---- submenu open/close with hover-intent ---------------------------------
  // A short close delay lets the pointer cross the gap between the parent row
  // and the detached submenu panel (or back) without the panel vanishing.
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancelClose = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);
  const scheduleClose = useCallback(() => {
    cancelClose();
    closeTimerRef.current = setTimeout(() => {
      closeTimerRef.current = null;
      setOpenParentId(null);
    }, 250);
  }, [cancelClose]);
  const openParent = useCallback(
    (id: string) => {
      cancelClose();
      setOpenParentId(id);
    },
    [cancelClose],
  );
  const closeParent = useCallback(() => {
    cancelClose();
    setOpenParentId(null);
  }, [cancelClose]);
  useEffect(() => () => cancelClose(), [cancelClose]);

  // ---- safe triangle --------------------------------------------------------
  // While a submenu is open, a diagonal move from the parent row toward the
  // panel briefly crosses sibling rows — whose leave/enter would otherwise close
  // it. Track the pointer and, when it heads into the wedge between the last
  // position and the submenu's two near corners, cancel the pending close so the
  // panel survives the traversal (grace delay handles the rest).
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const handleMainMouseMove = useCallback(
    (event: { clientX: number; clientY: number }) => {
      const prev = lastPointRef.current;
      const point = { x: event.clientX, y: event.clientY };
      lastPointRef.current = point;
      if (openParentId == null || !prev) return;
      const sub = submenuRef?.current?.getBoundingClientRect();
      if (!sub) return;
      // Submenu sits to the right: the wedge is bounded by its near (left) edge
      // and its top/bottom corners, fanning out to the previous pointer spot.
      const headingRight = point.x >= prev.x;
      const insideBand = point.y >= sub.top - 12 && point.y <= sub.bottom + 12;
      if (headingRight && insideBand && point.x <= sub.left) cancelClose();
    },
    [openParentId, submenuRef, cancelClose],
  );

  // ---- selection handlers ---------------------------------------------------

  const toggleGroup = useCallback(
    (option: FieldValueOption) => {
      const leaves = collectLeaves(option.children).map(l => l.value as ConditionValue);
      toggleMany(leaves, !allLeavesChecked(option));
      onItemToggle?.();
    },
    [toggleMany, allLeavesChecked, onItemToggle],
  );

  const selectRow = useCallback(
    (row: ValueMenuRow, fromSubmenu: boolean) => {
      if (row.isGroup) {
        // The "All {group}" row is bulk-toggle only — never a submenu trigger.
        if (multiSelect || row.isSelectAll) toggleGroup(row.option);
        else if (!fromSubmenu) openParent(row.id);
        return;
      }
      const value = row.option.value as ConditionValue;
      if (multiSelect) {
        toggleValue(value);
        onItemToggle?.();
      } else {
        onSelect(value);
      }
    },
    [multiSelect, toggleGroup, openParent, toggleValue, onItemToggle, onSelect],
  );

  const handleClose = useCallback(() => {
    if (multiSelect) commitChecked();
    onOpenChange?.(false);
  }, [multiSelect, commitChecked, onOpenChange]);

  // ---- top-level keyboard nav ----------------------------------------------
  const topNavItems: FilterInputDropdownItem[] = useMemo(
    () => topRows.map(row => ({ id: row.id, label: row.option.label, value: row.option.value })),
    [topRows],
  );

  const topHighlightRef = useRef('');

  const handleTopSelect = useCallback(
    (item: FilterInputDropdownItem) => {
      const row = topRowsRef.current.find(r => r.id === item.id);
      if (row) selectRow(row, false);
    },
    [selectRow],
  );

  const handleTopArrowRight = useCallback(() => {
    const row = topRowsRef.current.find(r => r.id === topHighlightRef.current);
    // Only a real parent category opens a submenu; the "All {group}" row doesn't.
    if (row?.isGroup && !row.isSelectAll) openParent(row.id);
    else if (multiSelect) commitChecked();
  }, [openParent, multiSelect, commitChecked]);

  const top = useKeyboardNav({
    items: topNavItems,
    open: open && openParentId == null,
    onSelect: handleTopSelect,
    onClose: onEscape ?? handleClose,
    onArrowRight: handleTopArrowRight,
    onPendingCommit: multiSelect ? commitChecked : undefined,
    inputRef,
    menuRef,
  });
  topHighlightRef.current = top.highlightedValue;

  // ---- submenu keyboard nav -------------------------------------------------
  const submenuNavItems: FilterInputDropdownItem[] = useMemo(() => {
    if (!openParentRow) return [];
    const leafItems = submenuRows.map(row => ({
      id: row.id,
      label: row.option.label,
      value: row.option.value,
    }));
    // The "All {group}" row only exists in multi-select (see NestedValueMenu),
    // so keyboard nav must not target it in single-select.
    return multiSelect
      ? [{ id: SELECT_ALL_ID, label: 'Select all', value: SELECT_ALL_ID }, ...leafItems]
      : leafItems;
  }, [openParentRow, submenuRows, multiSelect]);

  const handleSubmenuSelect = useCallback(
    (item: FilterInputDropdownItem) => {
      if (!openParentRow) return;
      if (item.id === SELECT_ALL_ID) {
        toggleGroup(openParentRow.option);
        return;
      }
      const row = submenuRows.find(r => r.id === item.id);
      if (row) selectRow(row, true);
    },
    [openParentRow, submenuRows, toggleGroup, selectRow],
  );

  const submenu = useKeyboardNav({
    items: submenuNavItems,
    open: open && openParentId != null,
    onSelect: handleSubmenuSelect,
    onClose: closeParent,
    onArrowLeft: closeParent,
    onPendingCommit: multiSelect ? commitChecked : undefined,
    inputRef,
    menuRef: submenuRef,
  });

  // ---- building preview ------------------------------------------------------
  const labelByValue = useMemo(() => {
    const map = new Map<string, string>();
    for (const leaf of collectLeaves(allValues)) map.set(String(leaf.value), leaf.label);
    return map;
  }, [allValues]);

  // Mirror the committed-chip collapse (fully-selected group → its label,
  // partial → its leaves) so the building preview reads identically while the
  // user is still toggling values, not only once the filter is applied.
  const buildingMultiValue =
    multiSelect && checkedValues.length > 0
      ? collapseValueOptions(allValues, checkedValues)
          .map(token =>
            token.kind === 'group'
              ? token.label
              : (labelByValue.get(String(token.value)) ?? String(token.value)),
          )
          .join(', ')
      : undefined;

  useEffect(() => {
    onBuildingValueChange?.(buildingMultiValue);
  }, [buildingMultiValue, onBuildingValueChange]);

  return {
    checkedValues,
    openParentId,
    openParent,
    closeParent,
    cancelClose,
    scheduleClose,
    handleMainMouseMove,
    openParentRow,
    submenuRows,
    // selection
    selectRow,
    toggleGroup,
    isLeafChecked,
    getRowCheckState,
    allLeavesChecked,
    commitChecked,
    // top nav
    topHighlightedValue: top.highlightedValue,
    onTopHighlightChange: top.onHighlightChange,
    topPendingIds: top.pendingIds,
    registerTopItem: top.registerItem,
    // submenu nav
    submenuHighlightedValue: submenu.highlightedValue,
    onSubmenuHighlightChange: submenu.onHighlightChange,
    submenuPendingIds: submenu.pendingIds,
    registerSubmenuItem: submenu.registerItem,
  };
};
