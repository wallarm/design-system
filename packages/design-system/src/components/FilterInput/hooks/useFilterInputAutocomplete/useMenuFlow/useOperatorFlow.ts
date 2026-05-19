import { useCallback } from 'react';
import { SEGMENT_VARIANT } from '../../../FilterInputField/FilterInputChip';
import {
  chipIdToConditionIndex,
  getFieldOperators,
  getOperatorFromLabel,
  isNoValueOperator,
  isOperatorAllowedForField,
  isValueShapeCompatible,
  OPERATOR_SYMBOLS,
} from '../../../lib';
import type { FilterOperator } from '../../../types';
import type { MenuFlowInternalDeps } from './types';

/**
 * Operator-segment handlers. `handleOperatorSelect` is the menu-click path,
 * `handleCustomOperatorCommit` is the keyboard-typed path — it resolves the
 * typed text to a known operator (label / raw key / symbol) and delegates.
 */
export const useOperatorFlow = ({
  editing,
  selectedField,
  selectedOperator,
  insertIndex,
  upsertCondition,
  conditionsRef,
  resetState,
  setSelectedOperator,
  setMenuState,
  setBuildingMultiValue,
  setInputText,
}: MenuFlowInternalDeps) => {
  const handleOperatorSelect = useCallback(
    (operator: FilterOperator) => {
      if (!selectedField) return;

      // Inline-edit of the building chip's operator — keep value preview
      // when the shape (multi/between/no-value) is unchanged, otherwise drop
      // it. No-value operators auto-commit on the spot (their placeholder
      // satisfies isBuildingComplete), matching the first-pass flow.
      const isBuildingEdit =
        !editing.editingChipId && editing.editingSegment === SEGMENT_VARIANT.operator;
      if (isBuildingEdit) {
        const shapeCompatible = isValueShapeCompatible(selectedOperator, operator);
        if (!shapeCompatible) setBuildingMultiValue(undefined);
        setSelectedOperator(operator);
        editing.clearEditing();
        if (isNoValueOperator(operator)) {
          // Commit the no-value chip immediately, matching first-pass flow.
          upsertCondition(selectedField, operator, null, null, insertIndex);
          resetState(true);
          return;
        }
        setMenuState('value');
        return;
      }

      if (isNoValueOperator(operator)) {
        const isEditing = !!editing.editingChipId;
        upsertCondition(
          selectedField,
          operator,
          null,
          editing.editingChipId,
          isEditing ? undefined : insertIndex,
        );
        resetState(!isEditing);
        return;
      }

      // When editing the operator of an existing chip:
      // - Complete chip (has value): commit with new operator, keep value, done.
      // - Incomplete chip (no value): update operator in place, continue to value selection.
      if (editing.editingChipId && editing.editingSegment === SEGMENT_VARIANT.operator) {
        const idx = chipIdToConditionIndex(editing.editingChipId);
        const condition = idx !== null ? conditionsRef.current[idx] : null;
        if (condition) {
          const hasValue = condition.value !== null && condition.value !== '';
          if (hasValue) {
            upsertCondition(
              selectedField,
              operator,
              condition.value,
              editing.editingChipId,
              undefined,
              undefined,
              condition.dateOrigin,
            );
            resetState();
            return;
          }
          // Incomplete — persist operator without error, user is still building
          upsertCondition(selectedField, operator, null, editing.editingChipId);
          editing.setEditingSegment(SEGMENT_VARIANT.value);
          editing.setSegmentFilterText('');
        }
      }

      setSelectedOperator(operator);
      setInputText('');
      setMenuState('value');
    },
    [
      editing,
      selectedField,
      selectedOperator,
      insertIndex,
      conditionsRef,
      upsertCondition,
      resetState,
      setSelectedOperator,
      setMenuState,
      setBuildingMultiValue,
      setInputText,
    ],
  );

  /**
   * Commit a custom typed operator (from inline segment editing) by matching
   * the text against the field's allowed operator labels, raw keys, or
   * symbols. Mirrors the main-input Enter logic in useInputHandlers, so the
   * keyboard flow is symmetric between attribute, operator, and value
   * segments. Unmatched text is ignored.
   */
  const handleCustomOperatorCommit = useCallback(
    (customText: string) => {
      if (!selectedField || !customText.trim()) return;
      const trimmed = customText.trim();
      const allowed = getFieldOperators(selectedField);
      let matched: FilterOperator | null = getOperatorFromLabel(trimmed, selectedField.type);
      if (!matched) {
        const symbolMatch = allowed.find(
          op => OPERATOR_SYMBOLS[op].toLowerCase() === trimmed.toLowerCase(),
        );
        if (symbolMatch) matched = symbolMatch;
      }
      if (!matched) {
        const rawMatch = allowed.find(op => op.toLowerCase() === trimmed.toLowerCase());
        if (rawMatch) matched = rawMatch;
      }
      if (!matched || !isOperatorAllowedForField(selectedField, matched)) return;
      handleOperatorSelect(matched);
    },
    [selectedField, handleOperatorSelect],
  );

  return { handleOperatorSelect, handleCustomOperatorCommit };
};
