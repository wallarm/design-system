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
  handleConnectorChange: (chipId: string, value: 'and' | 'or') => void;
  handleChipRemove: (chipId: string) => void;
  handleClear: () => void;
  handleGapClick: (conditionIndex: number, afterConnector: boolean) => void;
  insertIndex: number;
  insertAfterConnector: boolean;
  // Inline segment editing
  editingChipId: string | null;
  editingSegment: ChipSegment | null;
  segmentFilterText: string;
  handleSegmentFilterChange: (text: string) => void;
  cancelSegmentEdit: () => void;
  handleCustomValueCommit: (customText: string) => void;
  handleCustomAttributeCommit: (customText: string) => void;
  menuRef: RefObject<HTMLDivElement | null>;
  closeAutocompleteMenu: () => void;
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
      insertIndex: autocomplete.insertIndex,
      insertAfterConnector: autocomplete.insertAfterConnector,
      onInputChange: autocomplete.handleInputChange,
      onGapClick: autocomplete.handleGapClick,
      onInputKeyDown: autocomplete.handleKeyDown,
      onInputClick: autocomplete.handleInputClick,
      onChipClick: autocomplete.handleChipClick,
      onConnectorChange: autocomplete.handleConnectorChange,
      onChipRemove: autocomplete.handleChipRemove,
      onClear: autocomplete.handleClear,
      editingChipId: autocomplete.editingChipId,
      editingSegment: autocomplete.editingSegment,
      segmentFilterText: autocomplete.segmentFilterText,
      onSegmentFilterChange: autocomplete.handleSegmentFilterChange,
      onCancelSegmentEdit: autocomplete.cancelSegmentEdit,
      onCustomValueCommit: autocomplete.handleCustomValueCommit,
      onCustomAttributeCommit: autocomplete.handleCustomAttributeCommit,
      menuRef: autocomplete.menuRef,
      closeAutocompleteMenu: autocomplete.closeAutocompleteMenu,
    }),
    [
      chips,
      autocomplete.buildingChipData,
      autocomplete.inputText,
      autocomplete.menuState,
      autocomplete.insertIndex,
      autocomplete.insertAfterConnector,
      autocomplete.handleInputChange,
      autocomplete.handleGapClick,
      autocomplete.handleKeyDown,
      autocomplete.handleInputClick,
      autocomplete.handleChipClick,
      autocomplete.handleConnectorChange,
      autocomplete.handleChipRemove,
      autocomplete.handleClear,
      autocomplete.editingChipId,
      autocomplete.editingSegment,
      autocomplete.segmentFilterText,
      autocomplete.handleSegmentFilterChange,
      autocomplete.cancelSegmentEdit,
      autocomplete.handleCustomValueCommit,
      autocomplete.handleCustomAttributeCommit,
      autocomplete.menuRef,
      autocomplete.closeAutocompleteMenu,
      buildingChipRef,
      inputRef,
      placeholder,
      error,
      showKeyboardHint,
    ],
  );
