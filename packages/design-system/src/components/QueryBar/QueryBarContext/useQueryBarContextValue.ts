import type { ChangeEvent, KeyboardEvent, RefObject } from 'react';
import { useMemo } from 'react';
import type { ChipSegment } from '../QueryBarInput/QueryBarChip';
import type { MenuState, QueryBarChipData } from '../types';
import type { BuildingChipData, QueryBarContextValue } from './types';

interface UseQueryBarContextValueOptions {
  chips: QueryBarChipData[];
  buildingChipData: BuildingChipData | null;
  buildingChipRef: RefObject<HTMLDivElement | null>;
  inputText: string;
  inputRef: RefObject<HTMLInputElement | null>;
  placeholder: string;
  error: boolean;
  showKeyboardHint: boolean;
  menuState: MenuState;
  onInputChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onInputKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
  onInputClick: () => void;
  onChipClick: (chipId: string, segment: ChipSegment, anchorRect: DOMRect) => void;
  onConnectorClick: (chipId: string) => void;
  onChipRemove: (chipId: string) => void;
  onClear: () => void;
}

export const useQueryBarContextValue = ({
  chips,
  buildingChipData,
  buildingChipRef,
  inputText,
  inputRef,
  placeholder,
  error,
  showKeyboardHint,
  menuState,
  onInputChange,
  onInputKeyDown,
  onInputClick,
  onChipClick,
  onConnectorClick,
  onChipRemove,
  onClear,
}: UseQueryBarContextValueOptions): QueryBarContextValue =>
  useMemo(
    () => ({
      chips,
      buildingChipData,
      buildingChipRef,
      inputText,
      inputRef,
      placeholder,
      error,
      showKeyboardHint,
      menuOpen: menuState !== 'closed',
      onInputChange,
      onInputKeyDown,
      onInputClick,
      onChipClick,
      onConnectorClick,
      onChipRemove,
      onClear,
    }),
    [
      chips,
      buildingChipData,
      inputText,
      placeholder,
      error,
      showKeyboardHint,
      menuState,
      onInputChange,
      onInputKeyDown,
      onInputClick,
      onChipClick,
      onConnectorClick,
      onChipRemove,
      onClear,
    ],
  );
