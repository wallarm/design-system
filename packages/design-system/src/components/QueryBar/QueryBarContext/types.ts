import type { ChangeEvent, KeyboardEvent, Ref } from 'react';
import type { QueryBarChipData } from '../types';
import type { ChipSegment } from '../QueryBarInput/QueryBarChip';

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
  // Callbacks
  onInputChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onInputKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
  onInputClick: () => void;
  onChipClick: (chipId: string, segment: ChipSegment, anchorRect: DOMRect) => void;
  onConnectorClick: (chipId: string) => void;
  onChipRemove: (chipId: string) => void;
  onClear: () => void;
}
