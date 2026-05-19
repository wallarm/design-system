import type { ChangeEvent, KeyboardEvent, Ref, RefObject } from 'react';
import type { ChipSegment } from '../FilterInputField/FilterInputChip';
import type { FilterInputChipData } from '../types';

export interface BuildingChipData {
  attribute: string;
  operator?: string;
  value?: string;
}

export interface FilterInputContextValue {
  // Chip data
  chips: FilterInputChipData[];
  buildingChipData: BuildingChipData | null;
  buildingChipRef: Ref<HTMLDivElement>;
  // Input
  inputText: string;
  inputRef: Ref<HTMLInputElement>;
  placeholder: string;
  // UI state
  error: boolean;
  showKeyboardHint: boolean;
  menuOpen: boolean;
  insertIndex: number;
  insertAfterConnector: boolean;
  // Callbacks
  onInputChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onInputKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
  onInputClick: () => void;
  onGapClick: (conditionIndex: number, afterConnector: boolean) => void;
  onChipClick: (chipId: string, segment: ChipSegment, anchorEl: HTMLElement) => void;
  /** Click on a segment of the *building* (in-progress) chip — re-opens the
   *  corresponding menu and enters inline-edit without committing the chip. */
  onBuildingChipClick: (segment: ChipSegment, anchorEl: HTMLElement) => void;
  /** Switch the inline-edit to a different segment within the chip currently
   *  being edited — used by Backspace-on-empty to walk back through segments. */
  onSwitchEditSegment: (targetSegment: ChipSegment) => boolean;
  /** Remove the chip currently being edited inline — used by Backspace on an
   *  empty attribute segment when operator/value are absent. */
  onRemoveEditingChip: () => void;
  onConnectorChange: (chipId: string, value: 'and' | 'or') => void;
  onChipRemove: (chipId: string) => void;
  onClear: () => void;
  // Inline segment editing
  editingChipId: string | null;
  editingSegment: ChipSegment | null;
  segmentFilterText: string;
  onSegmentFilterChange: (text: string) => void;
  onCancelSegmentEdit: () => void;
  onCustomValueCommit: (customText: string) => void;
  onCustomAttributeCommit: (customText: string) => void;
  onCustomOperatorCommit: (customText: string) => void;
  /** Ref to the currently open menu content element */
  menuRef: RefObject<HTMLDivElement | null>;
  /** Close autocomplete menu (used by connector chip to enforce single-dropdown constraint) */
  closeAutocompleteMenu: () => void;
  /** Register/unregister a chip DOM element for selection tracking */
  registerChipRef: (id: string, el: HTMLElement | null) => void;
  /** Direct ref to the attribute segment <input> — attached by Segment when editing. */
  segmentAttributeInputRef: RefObject<HTMLInputElement | null>;
  /** Direct ref to the operator segment <input> — attached by Segment when editing. */
  segmentOperatorInputRef: RefObject<HTMLInputElement | null>;
  /** Direct ref to the value segment <input> — attached by Segment when editing. */
  segmentValueInputRef: RefObject<HTMLInputElement | null>;
}
