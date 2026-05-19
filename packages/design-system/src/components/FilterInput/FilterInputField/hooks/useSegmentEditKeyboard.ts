import type { FocusEvent, KeyboardEvent, RefObject } from 'react';
import { useCallback } from 'react';
import type { BuildingChipData } from '../../FilterInputContext/types';
import { isMenuRelated } from '../../lib';
import type { FilterInputChipData } from '../../types';
import { type ChipSegment, SEGMENT_VARIANT } from '../FilterInputChip';

interface UseSegmentEditKeyboardOptions {
  editingChipId: string | null;
  editingSegment: ChipSegment | null;
  segmentFilterText: string;
  chips: FilterInputChipData[];
  buildingChipData: BuildingChipData | null;
  menuRef: RefObject<HTMLDivElement | null>;
  onCancelSegmentEdit: () => void;
  onCustomValueCommit: (text: string) => void;
  onCustomAttributeCommit: (text: string) => void;
  onCustomOperatorCommit: (text: string) => void;
  onSwitchEditSegment: (target: ChipSegment) => boolean;
  onRemoveEditingChip: () => void;
}

/**
 * Keyboard handlers for a chip segment's inline-edit input:
 *
 * - Escape cancels.
 * - Backspace on an empty input walks the cascade (value → operator →
 *   attribute) and, if the attribute is empty with no operator/value left,
 *   removes the chip.
 * - Enter commits the typed text via the segment-specific commit callback.
 * - ArrowDown is intercepted (preventDefault) but focus stays on the input —
 *   highlight navigation runs through useKeyboardNav's window-capture listener.
 *
 * Returns the keydown + blur handlers fed to `EditingProvider` so every
 * segment input dispatches through the same logic.
 */
export const useSegmentEditKeyboard = ({
  editingChipId,
  editingSegment,
  segmentFilterText,
  chips,
  buildingChipData,
  menuRef,
  onCancelSegmentEdit,
  onCustomValueCommit,
  onCustomAttributeCommit,
  onCustomOperatorCommit,
  onSwitchEditSegment,
  onRemoveEditingChip,
}: UseSegmentEditKeyboardOptions) => {
  const handleSegmentEditKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancelSegmentEdit();
        return;
      }
      if (e.key === 'Backspace' && segmentFilterText === '') {
        // Empty-segment Backspace: walk back through chip segments. On the
        // attribute when operator+value are absent — remove the chip entirely.
        // Otherwise move inline-edit to the previous segment (cursor lands at
        // the end of its text on the next render); the user's next keystroke
        // edits that segment normally.
        if (editingSegment === SEGMENT_VARIANT.attribute) {
          const chipForEdit = editingChipId
            ? chips.find(c => c.id === editingChipId && c.variant === 'chip')
            : null;
          const operator = chipForEdit?.operator ?? buildingChipData?.operator ?? '';
          // No operator means the chip is invalid no matter what value it
          // carries — a value-only orphan can be left behind by an operator-
          // segment cascade that preserves value. Gate removal on operator
          // alone so the cascade can complete through an empty attribute.
          if (!operator) {
            e.preventDefault();
            onRemoveEditingChip();
          }
          return;
        }
        if (editingSegment === SEGMENT_VARIANT.operator) {
          e.preventDefault();
          onSwitchEditSegment(SEGMENT_VARIANT.attribute);
          return;
        }
        if (editingSegment === SEGMENT_VARIANT.value) {
          e.preventDefault();
          onSwitchEditSegment(SEGMENT_VARIANT.operator);
          return;
        }
      }
      if (e.key === 'Enter' && !e.defaultPrevented) {
        if (editingSegment === SEGMENT_VARIANT.value) {
          e.preventDefault();
          onCustomValueCommit(segmentFilterText);
          return;
        }
        if (editingSegment === SEGMENT_VARIANT.attribute) {
          e.preventDefault();
          onCustomAttributeCommit(segmentFilterText);
          return;
        }
        if (editingSegment === SEGMENT_VARIANT.operator) {
          e.preventDefault();
          onCustomOperatorCommit(segmentFilterText);
          return;
        }
      }
      if (e.key === 'ArrowDown') {
        // For list menus, useKeyboardNav's window-capture handler stops the
        // event before it reaches this React handler — focus stays on the
        // segment input (combobox). For menus without useKeyboardNav (date
        // picker), focus moves into the menu so its internal nav works.
        e.preventDefault();
        menuRef.current?.focus();
      }
    },
    [
      onCancelSegmentEdit,
      editingSegment,
      segmentFilterText,
      onCustomValueCommit,
      onCustomAttributeCommit,
      onCustomOperatorCommit,
      onSwitchEditSegment,
      onRemoveEditingChip,
      editingChipId,
      chips,
      buildingChipData,
      menuRef,
    ],
  );

  const handleSegmentEditBlur = useCallback(
    (e: FocusEvent<HTMLInputElement>) => {
      if (!isMenuRelated(e.relatedTarget as HTMLElement | null)) onCancelSegmentEdit();
    },
    [onCancelSegmentEdit],
  );

  return { handleSegmentEditKeyDown, handleSegmentEditBlur };
};
