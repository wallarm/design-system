import type { ChangeEvent, KeyboardEvent, MouseEvent as ReactMouseEvent, Ref } from 'react';
import type { FilterChipData } from '../types';

export interface BuildingChipData {
  variant: 'chip';
  attribute: string;
  operator?: string;
  value?: string;
}

export interface FilterContextValue {
  // Chip data
  chips: FilterChipData[];
  buildingChipData: BuildingChipData | null;
  buildingChipRef: Ref<HTMLDivElement>;
  hasMoreChips: boolean;
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
  onChipClick: (chipId: string, e: ReactMouseEvent) => void;
  onChipRemove: (chipId: string) => void;
  onClear: () => void;
}
