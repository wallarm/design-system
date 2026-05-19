import { useCallback } from 'react';
import { SEGMENT_VARIANT } from '../../../FilterInputField/FilterInputChip';
import {
  chipIdToConditionIndex,
  isOperatorAllowedForField,
  validateValueForField,
} from '../../../lib';
import type { FieldMetadata } from '../../../types';
import type { MenuFlowInternalDeps } from './types';

/**
 * Attribute-segment handlers. `handleFieldSelect` is the menu-click path,
 * `handleCustomAttributeCommit` is the keyboard-typed path — they share
 * post-cascade and shape-preservation logic via mutual delegation.
 */
export const useFieldFlow = ({
  editing,
  selectedOperator,
  fields,
  upsertCondition,
  conditionsRef,
  resetState,
  setSelectedField,
  setSelectedOperator,
  setInputText,
  setMenuState,
}: MenuFlowInternalDeps) => {
  const handleFieldSelect = useCallback(
    (field: FieldMetadata) => {
      // Editing existing chip's attribute — keep operator/value.
      if (editing.editingChipId && editing.editingSegment === SEGMENT_VARIANT.attribute) {
        const idx = chipIdToConditionIndex(editing.editingChipId);
        const condition = idx !== null ? conditionsRef.current[idx] : null;
        if (condition) {
          // Post-cascade incomplete chip (operator cleared by Backspace
          // cascade): keep inline-edit alive and transition to operator.
          if (!condition.operator) {
            upsertCondition(
              field,
              undefined,
              condition.value,
              editing.editingChipId,
              undefined,
              undefined,
              condition.dateOrigin,
            );
            setSelectedField(field);
            setSelectedOperator(null);
            // switchEditSegment resets userHasTyped so the next keystroke
            // widens the menu (matches first-edit behavior).
            editing.switchEditSegment(SEGMENT_VARIANT.operator, '');
            setMenuState('operator');
            return;
          }
          const hasValueError = validateValueForField(field, condition.value);
          upsertCondition(
            field,
            condition.operator,
            condition.value,
            editing.editingChipId,
            undefined,
            hasValueError ? SEGMENT_VARIANT.value : undefined,
            condition.dateOrigin,
          );
        }
        resetState();
        return;
      }
      // Inline-edit of building chip attribute — keep operator if still
      // allowed; value preview is untouched (validation runs at commit).
      const isBuildingEdit =
        !editing.editingChipId && editing.editingSegment === SEGMENT_VARIANT.attribute;
      if (isBuildingEdit) {
        setSelectedField(field);
        const keepOperator = selectedOperator
          ? isOperatorAllowedForField(field, selectedOperator)
          : false;
        if (!keepOperator) setSelectedOperator(null);
        editing.clearEditing();
        setMenuState(keepOperator ? 'value' : 'operator');
        return;
      }
      setSelectedField(field);
      setInputText('');
      setMenuState('operator');
    },
    [
      editing,
      selectedOperator,
      conditionsRef,
      upsertCondition,
      resetState,
      setSelectedField,
      setSelectedOperator,
      setInputText,
      setMenuState,
    ],
  );

  const handleCustomAttributeCommit = useCallback(
    (customText: string) => {
      if (!customText.trim()) return;
      const trimmed = customText.trim();

      const matchedField = fields.find(
        f =>
          f.label.toLowerCase() === trimmed.toLowerCase() ||
          f.name.toLowerCase() === trimmed.toLowerCase(),
      );

      // Building-chip inline-edit: route through handleFieldSelect to share
      // operator-preservation; unknown text is ignored (no errored chip).
      if (!editing.editingChipId) {
        if (matchedField) handleFieldSelect(matchedField);
        return;
      }

      const idx = chipIdToConditionIndex(editing.editingChipId);
      const condition = idx !== null ? conditionsRef.current[idx] : null;
      if (!condition) return;

      if (matchedField) {
        // Route through handleFieldSelect to share post-cascade logic.
        handleFieldSelect(matchedField);
        return;
      }
      // Unknown field — synthetic FieldMetadata, mark attribute as errored.
      const syntheticField: FieldMetadata = {
        name: trimmed,
        label: trimmed,
        type: 'string',
      };
      // Post-cascade incomplete chip: keep inline-edit alive after synthetic
      // commit so the user can finish building (mirrors matched-field branch).
      if (!condition.operator) {
        upsertCondition(
          syntheticField,
          undefined,
          condition.value,
          editing.editingChipId,
          undefined,
          SEGMENT_VARIANT.attribute,
          condition.dateOrigin,
        );
        setSelectedField(syntheticField);
        setSelectedOperator(null);
        editing.switchEditSegment(SEGMENT_VARIANT.operator, '');
        setMenuState('operator');
        return;
      }
      upsertCondition(
        syntheticField,
        condition.operator,
        condition.value,
        editing.editingChipId,
        undefined,
        SEGMENT_VARIANT.attribute,
        condition.dateOrigin,
      );
      resetState();
    },
    [
      editing,
      fields,
      conditionsRef,
      upsertCondition,
      resetState,
      handleFieldSelect,
      setSelectedField,
      setSelectedOperator,
      setMenuState,
    ],
  );

  return { handleFieldSelect, handleCustomAttributeCommit };
};
