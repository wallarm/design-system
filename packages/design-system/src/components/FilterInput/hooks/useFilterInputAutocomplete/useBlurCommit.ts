import type { RefObject } from 'react';
import { useCallback, useLayoutEffect, useRef } from 'react';
import { SEGMENT_VARIANT } from '../../FilterInputField/FilterInputChip';
import { isBuildingComplete, isNoValueOperator } from '../../lib';
import type { ChipErrorSegment, FieldMetadata, FilterOperator, UpsertCondition } from '../../types';
import type { BuildingBase } from './useAutocompleteState';

interface UseBlurCommitDeps {
  selectedField: FieldMetadata | null;
  selectedOperator: FilterOperator | null;
  inputText: string;
  editingChipId: string | null;
  effectiveInsertIndexRef: RefObject<number>;
  handleCustomValueCommit: (text: string) => void;
  upsertCondition: UpsertCondition;
  resetState: () => void;
  /** Which triplet is being built: 0 = base, 1 = paired second. */
  buildingSide: 0 | 1;
  setBuildingSide: (side: 0 | 1) => void;
  /** Base triplet stashed while building a paired chip's second value. */
  buildingBase: BuildingBase | null;
  setBuildingBase: (base: BuildingBase | null) => void;
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
  buildingSide,
  setBuildingSide,
  buildingBase,
  setBuildingBase,
  commitBuildingOnBlurRef,
  commitBuildingForceRef,
}: UseBlurCommitDeps) => {
  const selectedFieldRef = useRef(selectedField);
  const selectedOperatorRef = useRef(selectedOperator);
  const inputTextRef = useRef(inputText);
  const buildingSideRef = useRef(buildingSide);
  const buildingBaseRef = useRef(buildingBase);
  useLayoutEffect(() => {
    selectedFieldRef.current = selectedField;
    selectedOperatorRef.current = selectedOperator;
    inputTextRef.current = inputText;
    buildingSideRef.current = buildingSide;
    buildingBaseRef.current = buildingBase;
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
        // Typed paired value routes through handleCustomValueCommit →
        // commitPairedSecond, which persists base + pair as one chip.
        handleCustomValueCommit(text);
        return true;
      }

      // Building the paired second triplet with no typed value: persist the
      // stashed base AND the (incomplete) pair as one chip, instead of dropping
      // the base and committing the paired field as a broken standalone chip.
      // The paired value is flagged so the chip stays editable in place.
      if (buildingSideRef.current === 1 && buildingBaseRef.current) {
        const base = buildingBaseRef.current;
        upsertCondition(
          base.field,
          base.operator,
          base.value,
          null,
          effectiveInsertIndexRef.current,
        );
        // Operator present → flag the paired value slot; operator missing → no
        // per-segment variant exists, so mark the whole pair as error.
        const pairError: ChipErrorSegment = operator ? SEGMENT_VARIANT.value : true;
        upsertCondition(
          field,
          operator ?? undefined,
          null,
          undefined,
          undefined,
          pairError,
          undefined,
          1,
        );
        setBuildingBase(null);
        setBuildingSide(0);
        resetState();
        return true;
      }

      if (isBuildingComplete(field, operator, null)) {
        upsertCondition(field, operator!, null, undefined, effectiveInsertIndexRef.current);
        resetState();
        return true;
      }
      // Operator present but value empty → flag the value segment so the
      // renderer highlights that slot. Operator missing → no per-segment
      // error variant exists (ChipErrorSegment is `boolean | 'attribute' |
      // 'value'`), so mark the whole chip as error — user can click into any
      // segment to fix.
      const errorSegment: ChipErrorSegment = operator ? SEGMENT_VARIANT.value : true;
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
    setBuildingBase,
    setBuildingSide,
  ]);

  useLayoutEffect(() => {
    commitBuildingForceRef.current = commitBuildingForce;
  }, [commitBuildingForce, commitBuildingForceRef]);

  // commitBuildingForce is reached exclusively through commitBuildingForceRef
  // (set in the useLayoutEffect above) — handleAreaClick reads it that way to
  // break the useMenuFlow ↔ useBlurCommit dep cycle.
  return { commitBuildingOnBlur, hasIncompleteBuilding };
};
