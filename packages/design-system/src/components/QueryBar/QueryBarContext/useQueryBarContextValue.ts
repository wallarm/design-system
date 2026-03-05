import type { RefObject } from 'react';
import { useMemo } from 'react';
import type { ChipSegment } from '../QueryBarInput/QueryBarChip';
import type { MenuState, QueryBarChipData } from '../types';
import type { BuildingChipData, QueryBarContextValue } from './types';

interface AutocompleteForContext {
  buildingChipData: BuildingChipData | null;
  inputText: string;
  menuState: MenuState;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  handleInputClick: () => void;
  handleChipClick: (chipId: string, segment: ChipSegment, anchorRect: DOMRect) => void;
  handleConnectorClick: (chipId: string) => void;
  handleChipRemove: (chipId: string) => void;
  handleClear: () => void;
}

interface UseQueryBarContextValueOptions {
  chips: QueryBarChipData[];
  autocomplete: AutocompleteForContext;
  buildingChipRef: RefObject<HTMLDivElement | null>;
  inputRef: RefObject<HTMLInputElement | null>;
  placeholder: string;
  error: boolean;
  showKeyboardHint: boolean;
}

export const useQueryBarContextValue = ({
  chips,
  autocomplete,
  buildingChipRef,
  inputRef,
  placeholder,
  error,
  showKeyboardHint,
}: UseQueryBarContextValueOptions): QueryBarContextValue =>
  useMemo(
    () => ({
      chips,
      buildingChipData: autocomplete.buildingChipData,
      buildingChipRef,
      inputText: autocomplete.inputText,
      inputRef,
      placeholder,
      error,
      showKeyboardHint,
      menuOpen: autocomplete.menuState !== 'closed',
      onInputChange: autocomplete.handleInputChange,
      onInputKeyDown: autocomplete.handleKeyDown,
      onInputClick: autocomplete.handleInputClick,
      onChipClick: autocomplete.handleChipClick,
      onConnectorClick: autocomplete.handleConnectorClick,
      onChipRemove: autocomplete.handleChipRemove,
      onClear: autocomplete.handleClear,
    }),
    [
      chips,
      autocomplete,
      buildingChipRef,
      inputRef,
      placeholder,
      error,
      showKeyboardHint,
    ],
  );
