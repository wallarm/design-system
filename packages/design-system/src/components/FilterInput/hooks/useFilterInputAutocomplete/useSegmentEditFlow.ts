import { useCallback } from 'react';
import { type ChipSegment, SEGMENT_VARIANT } from '../../FilterInputField/FilterInputChip';
import { applyAcceptChar, SEGMENT_TO_MENU } from '../../lib';
import type { FieldMetadata, FilterOperator, MenuState } from '../../types';
import { getInitialSegmentText } from './lib';

interface UseSegmentEditFlowOptions {
  editing: {
    editingChipId: string | null;
    editingSegment: ChipSegment | null;
    isBuildingEdit: boolean;
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
  const { editingSegment, isBuildingEdit, setSegmentFilterText, startBuildingEdit, clearEditing } =
    editing;

  // Mirror main-input acceptChar rule for inline value-segment edits.
  const handleSegmentFilterChange = useCallback(
    (text: string) => {
      const accept = selectedField?.acceptChar;
      const next =
        editingSegment === SEGMENT_VARIANT.value && accept ? applyAcceptChar(text, accept) : text;
      setSegmentFilterText(next);
    },
    [selectedField, editingSegment, setSegmentFilterText],
  );

  // Clear ALL autocomplete state on segment-edit cancel — leaving
  // selectedField/Operator set leaks "building" state and handleInputClick
  // (gated on !selectedField) won't reopen the field menu. AS-929.
  // Exception: building-chip inline-edit must preserve selectedField/Operator/
  // value preview — user is still building.
  const cancelSegmentEdit = useCallback(() => {
    if (isBuildingEdit) {
      clearEditing();
      setMenuState('closed');
      return;
    }
    setSelectedField(null);
    setSelectedOperator(null);
    clearEditing();
    setMenuState('closed');
  }, [isBuildingEdit, clearEditing, setSelectedField, setSelectedOperator, setMenuState]);

  /**
   * Menu Escape: preserve building-chip state when inline-editing a building
   * segment; otherwise fall back to destructive resetState.
   */
  const handleMenuDiscard = useCallback(() => {
    if (isBuildingEdit) {
      clearEditing();
      setMenuState('closed');
      return;
    }
    resetState();
  }, [isBuildingEdit, clearEditing, resetState, setMenuState]);

  /**
   * Building-chip segment click: enter inline-edit and reopen its menu.
   * Compatibility checks run only on actual selection downstream.
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
      startBuildingEdit(segment, initialText);
      setInputText('');
      setMenuState(SEGMENT_TO_MENU[segment]);
    },
    [
      selectedField,
      selectedOperator,
      buildingMultiValue,
      setMenuAnchor,
      startBuildingEdit,
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
