import { useCallback } from 'react';
import { type ChipSegment, SEGMENT_VARIANT } from '../../FilterInputField/FilterInputChip';
import { applyAcceptChar, SEGMENT_TO_MENU } from '../../lib';
import type { FieldMetadata, FilterOperator, MenuState } from '../../types';
import { getInitialSegmentText } from './lib';

interface UseSegmentEditFlowOptions {
  editing: {
    editingChipId: string | null;
    editingSegment: ChipSegment | null;
    setSegmentFilterText: (text: string) => void;
    startBuildingEdit: (segment: ChipSegment, currentText: string) => void;
    clearEditing: () => void;
  };
  selectedField: FieldMetadata | null;
  selectedOperator: FilterOperator | null;
  buildingMultiValue: string | undefined;
  resetState: (continueBuilding?: boolean) => void;
  setSelectedField: (f: FieldMetadata | null) => void;
  setSelectedOperator: (op: FilterOperator | null) => void;
  setInputText: (text: string) => void;
  setMenuState: (state: MenuState) => void;
  setMenuAnchor: (el: HTMLElement | null) => void;
}

/**
 * Cross-cutting inline-segment handlers that don't fit any single segment flow:
 * - `handleSegmentFilterChange` — apply field-level acceptChar to value-segment text
 * - `cancelSegmentEdit` — full state reset on blur-cancel of a committed-chip edit;
 *   preserves selectedField/Operator when bailing out of a building-chip edit (AS-929)
 * - `handleMenuDiscard` — Escape from a menu (preserve building state, reset otherwise)
 * - `handleBuildingChipClick` — enter inline-edit on a building-chip segment
 */
export const useSegmentEditFlow = ({
  editing,
  selectedField,
  selectedOperator,
  buildingMultiValue,
  resetState,
  setSelectedField,
  setSelectedOperator,
  setInputText,
  setMenuState,
  setMenuAnchor,
}: UseSegmentEditFlowOptions) => {
  // Mirror the main-input acceptChar rule when editing a value segment so both
  // entry paths (building input + inline segment edit) apply the same filter.
  const handleSegmentFilterChange = useCallback(
    (text: string) => {
      const accept = selectedField?.acceptChar;
      const next =
        editing.editingSegment === SEGMENT_VARIANT.value && accept
          ? applyAcceptChar(text, accept)
          : text;
      editing.setSegmentFilterText(next);
    },
    [selectedField, editing],
  );

  // Cancel segment edit must clear ALL autocomplete state, not just the
  // segment-level state. Leaving `selectedField` / `selectedOperator` /
  // `editingChipId` set after a blur-cancel leaks "building" state into the
  // main input: handleInputClick gates on `!selectedField` and would refuse
  // to reopen the field menu when the user clicks back into the input. AS-929.
  //
  // EXCEPTION: when cancelling an inline-edit on the *building* chip
  // (`editingChipId === null` while a segment is being edited), we must
  // preserve `selectedField` / `selectedOperator` / value preview — the user
  // is still building and just bailed out of changing one segment.
  const cancelSegmentEdit = useCallback(() => {
    const isBuildingEdit = !editing.editingChipId && editing.editingSegment !== null;
    if (isBuildingEdit) {
      editing.clearEditing();
      setMenuState('closed');
      return;
    }
    setSelectedField(null);
    setSelectedOperator(null);
    editing.clearEditing();
    setMenuState('closed');
  }, [editing, setSelectedField, setSelectedOperator, setMenuState]);

  /**
   * Escape from a menu: when the user is inline-editing a *building* chip
   * segment, preserve `selectedField`/`selectedOperator`/value preview so the
   * chip survives. In any other case fall back to the existing destructive
   * `resetState` behavior (matches committed-chip editing UX).
   */
  const handleMenuDiscard = useCallback(() => {
    const isBuildingEdit = !editing.editingChipId && editing.editingSegment !== null;
    if (isBuildingEdit) {
      editing.clearEditing();
      setMenuState('closed');
      return;
    }
    resetState();
  }, [editing, resetState, setMenuState]);

  /**
   * Click on a segment of the *building* chip — enter inline-edit on that
   * segment and reopen the corresponding menu. Existing downstream state
   * (operator, value preview) is preserved here; compatibility checks run
   * only when the user actually picks a new value via handleFieldSelect /
   * handleOperatorSelect.
   */
  const handleBuildingChipClick = useCallback(
    (segment: ChipSegment, anchorEl: HTMLElement) => {
      if (!selectedField) return;
      setMenuAnchor(anchorEl);
      const initialText = getInitialSegmentText(
        segment,
        selectedField,
        selectedOperator,
        buildingMultiValue,
      );
      editing.startBuildingEdit(segment, initialText);
      setInputText('');
      setMenuState(SEGMENT_TO_MENU[segment]);
    },
    [
      selectedField,
      selectedOperator,
      buildingMultiValue,
      setMenuAnchor,
      editing,
      setInputText,
      setMenuState,
    ],
  );

  return {
    handleSegmentFilterChange,
    cancelSegmentEdit,
    handleMenuDiscard,
    handleBuildingChipClick,
  };
};
