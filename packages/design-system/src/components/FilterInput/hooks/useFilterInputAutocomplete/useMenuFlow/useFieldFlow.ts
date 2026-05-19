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
      // When editing an existing chip's attribute — update field, keep operator/value
      if (editing.editingChipId && editing.editingSegment === SEGMENT_VARIANT.attribute) {
        const idx = chipIdToConditionIndex(editing.editingChipId);
        const condition = idx !== null ? conditionsRef.current[idx] : null;
        if (condition) {
          // Post-cascade incomplete chip (operator was cleared by Backspace
          // cascade): keep inline-edit alive on the same chip and continue
          // building inline — transition to operator selection. Value is
          // preserved when the cascaded-from-operator path left it intact;
          // existing field-switch logic on a complete chip behaves the same
          // way (validateValueForField runs only on commit, not here).
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
            // switchEditSegment also resets userHasTyped — the user has not
            // typed anything in the new operator input yet, so the next
            // keystroke should widen the menu (matches first-edit behavior).
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
      // Inline-edit of the building chip's attribute — keep operator if the
      // new field still allows it, keep value preview untouched (validation
      // happens at commit time, not here).
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

      // Try to match the typed text to a known field
      const matchedField = fields.find(
        f =>
          f.label.toLowerCase() === trimmed.toLowerCase() ||
          f.name.toLowerCase() === trimmed.toLowerCase(),
      );

      // Inline-edit of the building chip's attribute — route through
      // handleFieldSelect so operator-preservation logic is shared. Unknown
      // text in building mode is ignored (no errored chip created).
      if (!editing.editingChipId) {
        if (matchedField) handleFieldSelect(matchedField);
        return;
      }

      const idx = chipIdToConditionIndex(editing.editingChipId);
      const condition = idx !== null ? conditionsRef.current[idx] : null;
      if (!condition) return;

      if (matchedField) {
        // Route through handleFieldSelect so post-cascade (incomplete chip)
        // logic is shared — keeps inline-edit alive and transitions to
        // operator selection when operator was previously cleared.
        handleFieldSelect(matchedField);
        return;
      }
      // Unknown field — create a synthetic FieldMetadata and mark attribute as error
      const syntheticField: FieldMetadata = {
        name: trimmed,
        label: trimmed,
        type: 'string',
      };
      // Post-cascade incomplete chip — keep inline-edit alive after the
      // synthetic commit so the user can finish building (mirrors the
      // matched-field branch above). Without this, an unknown attribute
      // typed mid-cascade would freeze the chip in an errored, operator-
      // less state with no inline path to recover.
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
