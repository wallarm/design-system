import type { ChangeEvent, KeyboardEvent, MouseEvent as ReactMouseEvent, Ref } from 'react';
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
  // Callbacks
  onInputChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onInputKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
  onInputClick: () => void;
  onChipClick: (chipId: string, e: ReactMouseEvent) => void;
  onChipRemove: (chipId: string) => void;
  onClear: () => void;
}
