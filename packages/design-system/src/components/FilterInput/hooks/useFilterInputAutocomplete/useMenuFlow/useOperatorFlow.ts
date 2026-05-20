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
  const {
    editingChipId,
    editingSegment,
    isBuildingEdit,
    setEditingSegment,
    setSegmentFilterText,
    clearEditing,
  } = editing;

  const handleOperatorSelect = useCallback(
    (operator: FilterOperator) => {
      if (!selectedField) return;

      // Inline-edit of building chip operator: keep value preview if shape
      // (multi/between/no-value) unchanged; no-value operators auto-commit.
      if (isBuildingEdit && editingSegment === SEGMENT_VARIANT.operator) {
        const shapeCompatible = isValueShapeCompatible(selectedOperator, operator);
        if (!shapeCompatible) setBuildingMultiValue(undefined);
        setSelectedOperator(operator);
        clearEditing();
        if (isNoValueOperator(operator)) {
          upsertCondition(selectedField, operator, null, null, insertIndex);
          resetState(true);
          return;
        }
        setMenuState('value');
        return;
      }

      if (isNoValueOperator(operator)) {
        const isEditing = !!editingChipId;
        upsertCondition(
          selectedField,
          operator,
          null,
          editingChipId,
          isEditing ? undefined : insertIndex,
        );
        resetState(!isEditing);
        return;
      }

      // Editing operator of existing chip: complete chip commits with new
      // operator+value; incomplete persists operator and moves to value.
      if (editingChipId && editingSegment === SEGMENT_VARIANT.operator) {
        const idx = chipIdToConditionIndex(editingChipId);
        const condition = idx !== null ? conditionsRef.current[idx] : null;
        if (condition) {
          const hasValue = condition.value !== null && condition.value !== '';
          if (hasValue) {
            upsertCondition(
              selectedField,
              operator,
              condition.value,
              editingChipId,
              undefined,
              undefined,
              condition.dateOrigin,
            );
            resetState();
            return;
          }
          // Incomplete — persist operator without error.
          upsertCondition(selectedField, operator, null, editingChipId);
          setEditingSegment(SEGMENT_VARIANT.value);
          setSegmentFilterText('');
        }
      }

      setSelectedOperator(operator);
      setInputText('');
      setMenuState('value');
    },
    [
      editingChipId,
      editingSegment,
      isBuildingEdit,
      setEditingSegment,
      setSegmentFilterText,
      clearEditing,
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
   * Commit a typed operator from inline segment editing by matching against
   * the field's labels, raw keys, or symbols. Unmatched text is ignored.
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
