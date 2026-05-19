import { useCallback, useRef } from 'react';
import type { MenuFlowDeps } from './types';
import { useFieldFlow } from './useFieldFlow';
import { useOperatorFlow } from './useOperatorFlow';
import { useValueFlow } from './useValueFlow';

/**
 * Aggregates the segment-specific flow hooks (`useFieldFlow`,
 * `useOperatorFlow`, `useValueFlow`) and adds the cross-cutting
 * `handleMenuClose` handler. Sub-hooks share a single fresh-conditions ref so
 * none of them re-create callbacks on every keystroke that mutates conditions.
 */
export const useMenuFlow = (deps: MenuFlowDeps) => {
  const {
    editing,
    selectedField,
    inputRef,
    conditions,
    resetState,
    commitBuildingOnBlur,
    setMenuState,
  } = deps;

  // Fresh conditions for callbacks without padding dependency arrays.
  const conditionsRef = useRef(conditions);
  conditionsRef.current = conditions;

  const internalDeps = { ...deps, conditionsRef };

  const { handleFieldSelect, handleCustomAttributeCommit } = useFieldFlow(internalDeps);
  const { handleOperatorSelect, handleCustomOperatorCommit } = useOperatorFlow(internalDeps);
  const {
    handleValueSelect,
    handleMultiCommit,
    handleBuildingValueChange,
    handleMultiSelectToggle,
    handleRangeSelect,
    handleCustomValueCommit,
  } = useValueFlow(internalDeps);

  // Ignore Ark UI close while focus is on our input/segment. Otherwise commit
  // a fully-built building chip or preserve it; keep menuState aligned so the
  // controlled `open` prop doesn't drift.
  const handleMenuClose = useCallback(() => {
    if (document.activeElement === inputRef.current) return;
    if ((document.activeElement as HTMLElement)?.closest?.('[data-slot^="segment-"]')) return;
    if (commitBuildingOnBlur()) return;
    const hasIncompleteBuilding = selectedField !== null && !editing.editingChipId;
    if (hasIncompleteBuilding) {
      setMenuState('closed');
      return;
    }
    resetState();
  }, [
    commitBuildingOnBlur,
    resetState,
    inputRef,
    selectedField,
    editing.editingChipId,
    setMenuState,
  ]);

  return {
    handleMenuClose,
    handleFieldSelect,
    handleOperatorSelect,
    handleValueSelect,
    handleMultiCommit,
    handleBuildingValueChange,
    handleMultiSelectToggle,
    handleRangeSelect,
    handleCustomValueCommit,
    handleCustomOperatorCommit,
    handleCustomAttributeCommit,
  };
};
