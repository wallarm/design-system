import type { MutableRefObject, RefObject } from 'react';
import { useCallback } from 'react';
import { type ChipSegment, SEGMENT_VARIANT } from '../../FilterInputField/FilterInputChip';
import { chipIdToConditionIndex, SEGMENT_TO_MENU } from '../../lib';
import type {
  Condition,
  FieldMetadata,
  FilterInputChipData,
  FilterOperator,
  MenuState,
  UpsertCondition,
} from '../../types';
import { getInitialSegmentText } from './lib';

interface UseChipCascadeOptions {
  editing: {
    editingChipId: string | null;
    editingSegment: ChipSegment | null;
    startBuildingEdit: (segment: ChipSegment, currentText: string) => void;
    switchEditSegment: (segment: ChipSegment, currentText: string) => void;
  };
  chips: FilterInputChipData[];
  fields: FieldMetadata[];
  conditionsRef: MutableRefObject<Condition[]>;
  effectiveInsertIndexRef: RefObject<number>;
  selectedField: FieldMetadata | null;
  selectedOperator: FilterOperator | null;
  buildingMultiValue: string | undefined;
  upsertCondition: UpsertCondition;
  removeCondition: (chipId: string) => void;
  resetState: (continueBuilding?: boolean) => void;
  setInputText: (text: string) => void;
  setMenuState: (state: MenuState) => void;
  setSelectedOperator: (op: FilterOperator | null) => void;
  setBuildingMultiValue: (val: string | undefined) => void;
  setInsertIndex: (fn: (prev: number | null) => number | null) => void;
}

/**
 * Backspace-driven cascade for chip segments. Bundles three closely related
 * actions so consumers don't have to wire them piecemeal:
 *
 * - `switchEditSegment` — walks inline-edit one segment to the left (value
 *   → operator → attribute). The source segment's chip data is cleared so
 *   the just-emptied text does not re-render after the switch.
 * - `removeEditingChip` — drops the chip currently being edited (building
 *   reset or committed `removeCondition` + insertIndex bookkeeping).
 * - `stepBackBuildingMenu` — from the main input during building, enters
 *   inline-edit on the previous segment with its text pre-selected, mirroring
 *   the segment-click + cascade UX.
 */
export const useChipCascade = ({
  editing,
  chips,
  fields,
  conditionsRef,
  effectiveInsertIndexRef,
  selectedField,
  selectedOperator,
  buildingMultiValue,
  upsertCondition,
  removeCondition,
  resetState,
  setInputText,
  setMenuState,
  setSelectedOperator,
  setBuildingMultiValue,
  setInsertIndex,
}: UseChipCascadeOptions) => {
  // Menu is anchored to the chip (not segment) so sibling-segment cascade
  // needs no explicit reposition; ResizeObserver catches width shifts.
  const switchEditSegment = useCallback(
    (targetSegment: ChipSegment): boolean => {
      const sourceSegment = editing.editingSegment;
      if (sourceSegment === null) return false;
      const isBuildingEdit = !editing.editingChipId;

      if (isBuildingEdit) {
        if (!selectedField) return false;
        // Clear only the source segment's data (mirrors committed-chip path).
        // buildingMultiValue stays put on operator cascade; downstream
        // operator-select discards it if the new operator is incompatible.
        if (sourceSegment === SEGMENT_VARIANT.value) {
          setBuildingMultiValue(undefined);
        } else if (sourceSegment === SEGMENT_VARIANT.operator) {
          setSelectedOperator(null);
        }
        const initialText = getInitialSegmentText(
          targetSegment,
          selectedField,
          selectedOperator,
          buildingMultiValue,
        );
        editing.startBuildingEdit(targetSegment, initialText);
        setInputText('');
        setMenuState(SEGMENT_TO_MENU[targetSegment]);
        return true;
      }

      const editingId = editing.editingChipId;
      if (!editingId) return false;
      const chip = chips.find(c => c.id === editingId);
      if (!chip || chip.variant !== 'chip') return false;
      const idx = chipIdToConditionIndex(editingId);
      const condition = idx !== null ? conditionsRef.current[idx] : null;
      const field = condition ? fields.find(f => f.name === condition.field) : null;

      // Clear only the segment being left — adjacent segments preserved
      // ("what was not deleted should not be deleted"). Falls back to plain
      // switch without a field. Downstream empty-attribute check gates on
      // !operator, so orphan value cannot keep the chip alive.
      if (condition && field) {
        if (sourceSegment === SEGMENT_VARIANT.value) {
          upsertCondition(
            field,
            condition.operator,
            null,
            editingId,
            undefined,
            undefined,
            condition.dateOrigin,
          );
        } else if (sourceSegment === SEGMENT_VARIANT.operator) {
          upsertCondition(
            field,
            undefined,
            condition.value,
            editingId,
            undefined,
            undefined,
            condition.dateOrigin,
          );
        }
      }

      // Load target segment's existing text so next Backspace deletes a char
      // of it (per "gap then deletion" spec).
      const targetText =
        targetSegment === SEGMENT_VARIANT.attribute
          ? (chip.attribute ?? '')
          : targetSegment === SEGMENT_VARIANT.operator
            ? (chip.operator ?? '')
            : '';
      editing.switchEditSegment(targetSegment, targetText);
      setMenuState(SEGMENT_TO_MENU[targetSegment]);
      return true;
    },
    [
      editing,
      selectedField,
      selectedOperator,
      buildingMultiValue,
      chips,
      fields,
      conditionsRef,
      upsertCondition,
      setBuildingMultiValue,
      setSelectedOperator,
      setInputText,
      setMenuState,
    ],
  );

  const removeEditingChip = useCallback(() => {
    if (editing.editingSegment === null) return;
    const editingId = editing.editingChipId;
    if (!editingId) {
      resetState();
      return;
    }
    const chipCondIdx = chipIdToConditionIndex(editingId);
    if (chipCondIdx !== null && chipCondIdx < effectiveInsertIndexRef.current) {
      setInsertIndex(prev => (prev != null ? prev - 1 : prev));
    }
    removeCondition(editingId);
    resetState();
  }, [editing, removeCondition, resetState, effectiveInsertIndexRef, setInsertIndex]);

  const stepBackBuildingMenu = useCallback(
    (current: 'field' | 'operator' | 'value') => {
      if (!selectedField) {
        resetState();
        return;
      }
      if (current === 'value') {
        setBuildingMultiValue(undefined);
        setInputText('');
        const operatorText = getInitialSegmentText(
          SEGMENT_VARIANT.operator,
          selectedField,
          selectedOperator,
          buildingMultiValue,
        );
        editing.startBuildingEdit(SEGMENT_VARIANT.operator, operatorText);
        setMenuState('operator');
        return;
      }
      if (current === 'operator') {
        setSelectedOperator(null);
        setBuildingMultiValue(undefined);
        setInputText('');
        editing.startBuildingEdit(SEGMENT_VARIANT.attribute, selectedField.label);
        setMenuState('field');
        return;
      }
      resetState();
    },
    [
      selectedField,
      selectedOperator,
      buildingMultiValue,
      editing,
      resetState,
      setBuildingMultiValue,
      setInputText,
      setMenuState,
      setSelectedOperator,
    ],
  );

  return { switchEditSegment, removeEditingChip, stepBackBuildingMenu };
};
