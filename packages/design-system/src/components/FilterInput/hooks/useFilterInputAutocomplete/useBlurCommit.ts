import type { RefObject } from 'react';
import { useCallback, useLayoutEffect, useRef } from 'react';
import { SEGMENT_VARIANT } from '../../FilterInputField/FilterInputChip';
import { isBuildingComplete, isNoValueOperator } from '../../lib';
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
  /** Indirection ref breaking the useMenuFlow ↔ useBlurCommit cycle. */
  commitBuildingOnBlurRef: RefObject<() => boolean>;
  /** Same indirection for force-commit (area-click → incomplete becomes error). */
  commitBuildingForceRef: RefObject<() => boolean>;
}

/**
 * Commit an incomplete building chip on blur/menu-close instead of discarding:
 * commit typed text as custom value, or persist as an error chip so it stays
 * editable. Re-entry-guarded: refs cleared synchronously so concurrent callers
 * (multiple onOpenChange + blur in one tick) don't create duplicate chips.
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
  commitBuildingForceRef,
}: UseBlurCommitDeps) => {
  const selectedFieldRef = useRef(selectedField);
  const selectedOperatorRef = useRef(selectedOperator);
  const inputTextRef = useRef(inputText);
  useLayoutEffect(() => {
    selectedFieldRef.current = selectedField;
    selectedOperatorRef.current = selectedOperator;
    inputTextRef.current = inputText;
  });

  // Re-entry flag survives state churn the ref snapshot can't guard (e.g.
  // upsertCondition triggers re-render that rewrites refs from props before
  // this call returns). Mirrors handlingBlurRef in useFocusManagement.
  const committingRef = useRef(false);

  const commitBuildingOnBlur = useCallback((): boolean => {
    if (committingRef.current) return false;
    const field = selectedFieldRef.current;
    const operator = selectedOperatorRef.current;
    const text = inputTextRef.current.trim();
    if (!field) return false;
    if (editingChipId) return false;

    // Commit only when fully built; caller skips resetState for incomplete
    // chips (preserved in `building` state).
    const hasTypedValue = !!operator && !isNoValueOperator(operator) && text.length > 0;
    if (!isBuildingComplete(field, operator, null) && !hasTypedValue) return false;

    committingRef.current = true;
    try {
      selectedFieldRef.current = null;
      selectedOperatorRef.current = null;
      inputTextRef.current = '';

      if (hasTypedValue) {
        handleCustomValueCommit(text);
        return true;
      }

      // No-value operator: commit cleanly (chip shows value-placeholder).
      upsertCondition(field, operator!, null, undefined, effectiveInsertIndexRef.current);
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

  // Mirrored in a layout effect — keeps useMenuFlow ↔ useBlurCommit cycle
  // observable to event handlers (which run post-commit) without mutating
  // refs during render.
  useLayoutEffect(() => {
    commitBuildingOnBlurRef.current = commitBuildingOnBlur;
  }, [commitBuildingOnBlur, commitBuildingOnBlurRef]);

  /** True if a building chip is alive; tells blur/menu-close to skip resetState. */
  const hasIncompleteBuilding = useCallback(
    (): boolean => selectedFieldRef.current !== null && !editingChipId,
    [editingChipId],
  );

  /**
   * Force-commit the in-progress building chip even when incomplete. Used by
   * area clicks where the user signals "wrap this up" — missing segments
   * land as error markers so the chip stays editable in place. Distinct from
   * `commitBuildingOnBlur`, which preserves incomplete chips on true blur.
   */
  const commitBuildingForce = useCallback((): boolean => {
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

      const hasTypedValue = !!operator && !isNoValueOperator(operator) && text.length > 0;
      if (hasTypedValue) {
        handleCustomValueCommit(text);
        return true;
      }
      if (isBuildingComplete(field, operator, null)) {
        upsertCondition(field, operator!, null, undefined, effectiveInsertIndexRef.current);
        resetState();
        return true;
      }
      // Operator missing → mark operator as error; operator present but value
      // empty → mark value as error. Both render an editable error chip.
      const errorSegment = operator ? SEGMENT_VARIANT.value : SEGMENT_VARIANT.operator;
      upsertCondition(
        field,
        operator ?? undefined,
        null,
        undefined,
        effectiveInsertIndexRef.current,
        errorSegment,
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

  useLayoutEffect(() => {
    commitBuildingForceRef.current = commitBuildingForce;
  }, [commitBuildingForce, commitBuildingForceRef]);

  // commitBuildingForce is reached exclusively through commitBuildingForceRef
  // (set in the useLayoutEffect above) — handleAreaClick reads it that way to
  // break the useMenuFlow ↔ useBlurCommit dep cycle.
  return { commitBuildingOnBlur, hasIncompleteBuilding };
};
