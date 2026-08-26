import { createRef, type FC, type ReactNode } from 'react';
import { FilterInputProvider } from '../FilterInputContext/FilterInputProvider';
import type { FilterInputContextValue } from '../FilterInputContext/types';

const noop = () => undefined;

/**
 * A no-op FilterInput context, just enough to render standalone sub-components
 * (connector chips) in Storybook outside a live <FilterInput>. The connector
 * chip only reads `menuOpen` and `closeAutocompleteMenu`; every other field is a
 * benign default so the full context type is satisfied.
 */
const mockContextValue: FilterInputContextValue = {
  chips: [],
  buildingChipData: null,
  buildingChipRef: createRef<HTMLDivElement>(),
  inputText: '',
  inputRef: createRef<HTMLInputElement>(),
  placeholder: '',
  error: false,
  showKeyboardHint: false,
  menuOpen: false,
  insertIndex: 0,
  insertAfterConnector: false,
  onInputChange: noop,
  onInputKeyDown: noop,
  onInputClick: noop,
  onAreaClick: noop,
  onGapClick: noop,
  onChipClick: noop,
  onPairChipClick: noop,
  onBuildingChipClick: noop,
  onSwitchEditSegment: () => false,
  onRemoveEditingChip: noop,
  onConnectorChange: noop,
  onChipRemove: noop,
  onClear: noop,
  editingChipId: null,
  editingSegment: null,
  editingSide: 0,
  segmentFilterText: '',
  onSegmentFilterChange: noop,
  onCancelSegmentEdit: noop,
  onCustomValueCommit: noop,
  onCustomAttributeCommit: noop,
  onCustomOperatorCommit: noop,
  menuRef: createRef<HTMLDivElement>(),
  closeAutocompleteMenu: noop,
  registerChipRef: noop,
  segmentAttributeInputRef: createRef<HTMLInputElement>(),
  segmentOperatorInputRef: createRef<HTMLInputElement>(),
  segmentValueInputRef: createRef<HTMLInputElement>(),
};

export const MockFilterInputProvider: FC<{ children: ReactNode }> = ({ children }) => (
  <FilterInputProvider value={mockContextValue}>{children}</FilterInputProvider>
);

MockFilterInputProvider.displayName = 'MockFilterInputProvider';
