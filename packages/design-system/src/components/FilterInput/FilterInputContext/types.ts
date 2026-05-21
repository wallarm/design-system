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
  /** Click on the FilterInput's empty area (not the inline input). Commits an
   *  in-progress multi-select chip before falling back to onInputClick logic. */
  onAreaClick: () => void;
  onGapClick: (conditionIndex: number, afterConnector: boolean) => void;
  onChipClick: (chipId: string, segment: ChipSegment, anchorEl: HTMLElement) => void;
  /** Click on a building-chip segment — reopens its menu and enters inline-edit. */
  onBuildingChipClick: (segment: ChipSegment, anchorEl: HTMLElement) => void;
  /** Move inline-edit to another segment of the edited chip (Backspace cascade). */
  onSwitchEditSegment: (targetSegment: ChipSegment) => boolean;
  /** Remove the inline-edited chip — Backspace on empty attribute w/o op/value. */
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
  /** Close autocomplete menu (connector chip enforces single-dropdown). */
  closeAutocompleteMenu: () => void;
  /** Register/unregister a chip DOM element for selection tracking. */
  registerChipRef: (id: string, el: HTMLElement | null) => void;
  /** Attribute segment input ref — set by Segment when editing. */
  segmentAttributeInputRef: RefObject<HTMLInputElement | null>;
  /** Operator segment input ref — set by Segment when editing. */
  segmentOperatorInputRef: RefObject<HTMLInputElement | null>;
  /** Value segment input ref — set by Segment when editing. */
  segmentValueInputRef: RefObject<HTMLInputElement | null>;
}
