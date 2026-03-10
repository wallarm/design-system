import type { ChangeEvent, KeyboardEvent, Ref, RefObject } from 'react';
import type { ChipSegment } from '../QueryBarInput/QueryBarChip';
import type { QueryBarChipData } from '../types';

export interface BuildingChipData {
  attribute: string;
  operator?: string;
  value?: string;
}

export interface QueryBarContextValue {
  // Chip data
  chips: QueryBarChipData[];
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
  onChipClick: (chipId: string, segment: ChipSegment, anchorRect: DOMRect) => void;
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
  /** Ref to the currently open menu content element */
  menuRef: RefObject<HTMLDivElement | null>;
}
