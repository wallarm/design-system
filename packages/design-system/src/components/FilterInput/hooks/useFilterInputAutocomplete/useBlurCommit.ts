import type { RefObject } from 'react';
import { useCallback, useRef } from 'react';
import type { FieldMetadata, FilterOperator, UpsertCondition } from '../../types';

interface UseBlurCommitDeps {
  selectedField: FieldMetadata | null;
  selectedOperator: FilterOperator | null;
  inputText: string;
  editingChipId: string | null;
  effectiveInsertIndexRef: RefObject<number>;
  handleCustomValueCommit: (text: string) => void;
  upsertCondition: UpsertCondition;
  resetState: () => void;
  /**
   * Indirection ref consumed by useMenuFlow to break the circular dependency
   * useMenuFlow ↔ useBlurCommit. The hook writes the latest commit fn here
   * each render; useMenuFlow calls through it via `() => ref.current()`.
   */
  commitBuildingOnBlurRef: RefObject<() => boolean>;
}

/**
 * Commit logic for an incomplete "building" chip on blur or menu close.
 *
 * Instead of discarding the in-progress chip when the user blurs or the menu
 * closes, this either commits the typed text as a custom value (when there's an
 * operator + text) or persists it as an error chip (so it remains visible and
 * editable). Uses fresh refs to avoid stale closures.
 *
 * Re-entry guard: snapshots and clears the refs synchronously so concurrent
 * callers (two `onOpenChange(false)` from Ark UI menus during a state transition,
 * plus a blur in the same tick) short-circuit on re-entry instead of creating
 * duplicate error chips.
 */
export const useBlurCommit = ({
  selectedField,
  selectedOperator,
  inputText,
  editingChipId,
  effectiveInsertIndexRef,
  handleCustomValueCommit,
  upsertCondition,
  resetState,
  commitBuildingOnBlurRef,
}: UseBlurCommitDeps) => {
  const selectedFieldRef = useRef(selectedField);
  selectedFieldRef.current = selectedField;
  const selectedOperatorRef = useRef(selectedOperator);
  selectedOperatorRef.current = selectedOperator;
  const inputTextRef = useRef(inputText);
  inputTextRef.current = inputText;

  // Dedicated re-entry flag — survives any state-churn that the ref-clearing
  // snapshot below cannot guard against (e.g. a synchronous re-render kicked
  // by upsertCondition that writes selectedFieldRef.current back from props
  // before this call returns). Mirrors handlingBlurRef in useFocusManagement.
  const committingRef = useRef(false);

  const commitBuildingOnBlur = useCallback((): boolean => {
    if (committingRef.current) return false;
    const field = selectedFieldRef.current;
    const operator = selectedOperatorRef.current;
    const text = inputTextRef.current.trim();
    if (!field) return false;
    if (editingChipId) return false;

    committingRef.current = true;
    try {
      selectedFieldRef.current = null;
      selectedOperatorRef.current = null;
      inputTextRef.current = '';

      if (operator && text) {
        handleCustomValueCommit(text);
        return true;
      }

      upsertCondition(
        field,
        operator ?? undefined,
        null,
        undefined,
        effectiveInsertIndexRef.current,
        true,
      );
      resetState();
      return true;
    } finally {
      committingRef.current = false;
    }
  }, [
    editingChipId,
    handleCustomValueCommit,
    upsertCondition,
    resetState,
    effectiveInsertIndexRef,
  ]);

  commitBuildingOnBlurRef.current = commitBuildingOnBlur;

  return commitBuildingOnBlur;
};
