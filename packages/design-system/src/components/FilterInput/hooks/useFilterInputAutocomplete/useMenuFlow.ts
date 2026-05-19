import type { RefObject } from 'react';
import { useCallback, useRef } from 'react';
import { type ChipSegment, SEGMENT_VARIANT } from '../../FilterInputField/FilterInputChip';
import {
  chipIdToConditionIndex,
  getFieldOperators,
  getOperatorFromLabel,
  isBetweenOperator,
  isMultiSelectOperator,
  isNoValueOperator,
  isOperatorAllowedForField,
  isValueShapeCompatible,
  OPERATOR_SYMBOLS,
  validateValueForField,
} from '../../lib';
import type {
  Condition,
  FieldMetadata,
  FilterOperator,
  MenuState,
  UpsertCondition,
} from '../../types';
import {
  resolveDateRangeValue,
  resolveDateValue,
  resolveMultiValues,
  resolveSingleValue,
} from './lib';

interface MenuFlowDeps {
  editing: {
    editingChipId: string | null;
    editingSegment: string | null;
    setEditingSegment: (segment: ChipSegment | null) => void;
    setSegmentFilterText: (text: string) => void;
    resetSegmentTyping: () => void;
    /** Switch inline-edit to another segment of the same committed chip,
     *  loading its text and resetting the user-typed flag in one step. */
    switchEditSegment: (segment: ChipSegment, currentText: string) => void;
    /** Exit inline-edit and the building-edit marker. Called when switching
     *  filter/operator in the building chip lands on the next menu. */
    clearEditing: () => void;
  };
  selectedField: FieldMetadata | null;
  selectedOperator: FilterOperator | null;
  fields: FieldMetadata[];
  inputRef: RefObject<HTMLInputElement | null>;
  insertIndex: number;
  upsertCondition: UpsertCondition;
  conditions: Condition[];
  resetState: (continueBuilding?: boolean) => void;
  /** Try to commit the building chip on menu close. Returns true if committed. */
  commitBuildingOnBlur: () => boolean;
  dateRange: { selectValue: (val: string) => string[] | null };
  setSelectedField: (f: FieldMetadata | null) => void;
  setSelectedOperator: (op: FilterOperator | null) => void;
  setInputText: (text: string) => void;
  setMenuState: (state: MenuState) => void;
  setBuildingMultiValue: (val: string | undefined) => void;
}

export const useMenuFlow = ({
  editing,
  selectedField,
  selectedOperator,
  fields,
  inputRef,
  insertIndex,
  upsertCondition,
  conditions,
  resetState,
  commitBuildingOnBlur,
  dateRange,
  setSelectedField,
  setSelectedOperator,
  setInputText,
  setMenuState,
  setBuildingMultiValue,
}: MenuFlowDeps) => {
  // Ref keeps conditions fresh for callbacks without adding to dependency arrays
  const conditionsRef = useRef(conditions);
  conditionsRef.current = conditions;

  // Ignore Ark UI close when focus is on our input or a segment inline-edit input.
  // Otherwise: try to commit the building chip if it's fully built; if not
  // built, preserve the in-progress state instead of wiping it via resetState.
  // Either way (committed or preserved), keep React's menuState aligned with
  // the now-closed menu so the controlled `open` prop doesn't drift.
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
      upsertCondition,
      resetState,
      setSelectedField,
      setSelectedOperator,
      setInputText,
      setMenuState,
    ],
  );

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
      upsertCondition,
      resetState,
      setSelectedOperator,
      setMenuState,
      setBuildingMultiValue,
      setInputText,
    ],
  );

  /** Single-select value (including date presets, between date collection) */
  const handleValueSelect = useCallback(
    (val: string | number | boolean) => {
      if (!selectedField || !selectedOperator) return;

      if (isBetweenOperator(selectedOperator) && selectedField.type === 'date') {
        const result = dateRange.selectValue(String(val));
        if (!result) return;
        upsertCondition(selectedField, selectedOperator, result, editing.editingChipId);
        resetState(!editing.editingChipId);
        return;
      }

      const isEditing = !!editing.editingChipId;
      upsertCondition(
        selectedField,
        selectedOperator,
        val,
        editing.editingChipId,
        isEditing ? undefined : insertIndex,
      );
      resetState(!isEditing);
    },
    [selectedField, selectedOperator, editing, dateRange, insertIndex, upsertCondition, resetState],
  );

  /** Multi-select commit: receives final array from FilterInputValueMenu */
  const handleMultiCommit = useCallback(
    (values: Array<string | number | boolean>) => {
      if (!selectedField || !selectedOperator || values.length === 0) return;
      const isEditing = !!editing.editingChipId;
      upsertCondition(
        selectedField,
        selectedOperator,
        values,
        editing.editingChipId,
        isEditing ? undefined : insertIndex,
      );
      resetState(!isEditing);
    },
    [selectedField, selectedOperator, editing, insertIndex, upsertCondition, resetState],
  );

  /** Building value preview from FilterInputValueMenu multi-select */
  const handleBuildingValueChange = useCallback(
    (preview: string | undefined) => {
      setBuildingMultiValue(preview);
    },
    [setBuildingMultiValue],
  );

  /** Fires only on explicit multi-select toggle (not on mount). Resets the
   *  *dropdown filter source* so the menu shows all options + already-checked
   *  items for the next selection, without wiping what the user sees.
   *  - Building mode: clear the main input (nothing is rendered from it).
   *  - Segment-edit mode: reset the typing flag only. The displayed segment
   *    text (the original chip value being edited) stays visible on the chip
   *    so there's no flicker to an empty string between clicks. */
  const handleMultiSelectToggle = useCallback(() => {
    if (editing.editingSegment === SEGMENT_VARIANT.value) {
      editing.resetSegmentTyping();
    } else {
      setInputText('');
    }
  }, [editing, setInputText]);

  /** Range select (between + calendar) */
  const handleRangeSelect = useCallback(
    (from: string, to: string) => {
      if (!selectedField || !selectedOperator) return;
      const isEditing = !!editing.editingChipId;
      upsertCondition(
        selectedField,
        selectedOperator,
        [from, to],
        editing.editingChipId,
        isEditing ? undefined : insertIndex,
      );
      resetState(!isEditing);
    },
    [selectedField, selectedOperator, editing, insertIndex, upsertCondition, resetState],
  );

  /** Commit a custom typed value (from inline segment editing or freeform input) */
  const handleCustomValueCommit = useCallback(
    (customText: string) => {
      if (!selectedField || !selectedOperator || !customText.trim()) return;
      const trimmed = customText.trim();
      const isEditing = !!editing.editingChipId;

      if (isMultiSelectOperator(selectedOperator)) {
        const { resolved, error } = resolveMultiValues(selectedField, trimmed);
        upsertCondition(
          selectedField,
          selectedOperator,
          resolved,
          editing.editingChipId,
          isEditing ? undefined : insertIndex,
          error ? SEGMENT_VARIANT.value : undefined,
        );
      } else if (selectedField.type === 'date') {
        // Handle "between" date ranges: parse "Mar 5, 2026 – Mar 15, 2026" → ["2026-03-05", "2026-03-15"]
        if (isBetweenOperator(selectedOperator)) {
          const rangeValue = resolveDateRangeValue(trimmed);
          upsertCondition(
            selectedField,
            selectedOperator,
            rangeValue ?? trimmed,
            editing.editingChipId,
            isEditing ? undefined : insertIndex,
            rangeValue ? undefined : SEGMENT_VARIANT.value,
            'absolute',
          );
        } else {
          const { error, dateOrigin } = resolveDateValue(
            trimmed,
            editing.editingChipId,
            conditionsRef.current,
          );
          upsertCondition(
            selectedField,
            selectedOperator,
            trimmed,
            editing.editingChipId,
            isEditing ? undefined : insertIndex,
            error ? SEGMENT_VARIANT.value : undefined,
            dateOrigin,
          );
        }
      } else {
        const { resolved, error } = resolveSingleValue(selectedField, trimmed);
        upsertCondition(
          selectedField,
          selectedOperator,
          resolved,
          editing.editingChipId,
          isEditing ? undefined : insertIndex,
          error ? SEGMENT_VARIANT.value : undefined,
        );
      }
      resetState(!isEditing);
    },
    [selectedField, selectedOperator, editing, insertIndex, upsertCondition, resetState],
  );

  /** Commit a custom typed attribute (from inline segment editing) */
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
      upsertCondition,
      resetState,
      handleFieldSelect,
      setSelectedField,
      setSelectedOperator,
      setMenuState,
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
