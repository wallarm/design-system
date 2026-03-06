import type { FC, RefObject } from 'react';
import { isBetweenOperator, isMultiSelectOperator } from '../lib';
import type { ChipSegment } from '../QueryBarInput/QueryBarChip';
import type { FieldMetadata, FilterOperator, MenuState } from '../types';
import { QueryBarDateValueMenu } from './QueryBarDateValueMenu';
import { QueryBarFieldMenu } from './QueryBarFieldMenu';
import { QueryBarOperatorMenu } from './QueryBarOperatorMenu';
import { QueryBarValueMenu } from './QueryBarValueMenu';

export interface QueryBarAutocompleteState {
  inputText: string;
  menuState: MenuState;
  selectedField: FieldMetadata | null;
  selectedOperator: FilterOperator | null;
  menuPositioning: Record<string, unknown>;
  editingMultiValues: Array<string | number | boolean>;
  editingSingleValue: string | number | boolean | undefined;
  editingDateIsAbsolute: boolean;
  inputRef: RefObject<HTMLInputElement | null>;
  menuRef: RefObject<HTMLDivElement | null>;
  handleFieldSelect: (field: FieldMetadata) => void;
  handleOperatorSelect: (operator: FilterOperator) => void;
  handleValueSelect: (val: string | number | boolean) => void;
  handleMultiCommit: (values: Array<string | number | boolean>) => void;
  handleRangeSelect: (from: string, to: string) => void;
  handleMenuClose: () => void;
  handleMenuDiscard: () => void;
  handleBuildingValueChange: (preview: string | undefined) => void;
  // Inline segment editing
  segmentFilterText: string;
  editingSegment: ChipSegment | null;
}

export interface QueryBarMenuProps {
  fields: FieldMetadata[];
  autocomplete: QueryBarAutocompleteState;
}

export const QueryBarMenu: FC<QueryBarMenuProps> = ({ fields, autocomplete }) => {
  const {
    inputText,
    menuState,
    selectedField,
    selectedOperator,
    menuPositioning,
    editingMultiValues,
    editingSingleValue,
    editingDateIsAbsolute,
    inputRef,
    menuRef,
    handleFieldSelect,
    handleOperatorSelect,
    handleValueSelect,
    handleMultiCommit,
    handleRangeSelect,
    handleMenuClose,
    handleMenuDiscard,
    handleBuildingValueChange,
    segmentFilterText,
    editingSegment,
  } = autocomplete;

  // Route filter text: use segment inline text when editing, otherwise main input
  const fieldFilterText = editingSegment === 'attribute' ? segmentFilterText : inputText;
  const operatorFilterText = editingSegment === 'operator' ? segmentFilterText : '';
  // For multi-select, filter by text after the last comma
  const valueFilterText =
    editingSegment === 'value'
      ? isMultiSelectOperator(selectedOperator)
        ? (segmentFilterText.split(',').pop()?.trim() ?? '')
        : segmentFilterText
      : '';

  return (
    <>
      <QueryBarFieldMenu
        fields={fields}
        filterText={fieldFilterText}
        open={menuState === 'field'}
        onSelect={handleFieldSelect}
        onOpenChange={() => handleMenuClose()}
        onEscape={handleMenuDiscard}
        positioning={menuPositioning}
        inputRef={inputRef}
        menuRef={menuRef}
      />

      {selectedField && (
        <QueryBarOperatorMenu
          fieldType={selectedField.type}
          open={menuState === 'operator'}
          onSelect={handleOperatorSelect}
          onOpenChange={() => handleMenuClose()}
          onEscape={handleMenuDiscard}
          positioning={menuPositioning}
          inputRef={inputRef}
          menuRef={menuRef}
          filterText={operatorFilterText}
        />
      )}

      {selectedField &&
        selectedOperator &&
        (selectedField.type === 'date' ? (
          <QueryBarDateValueMenu
            open={menuState === 'value'}
            onSelect={handleValueSelect}
            onRangeSelect={handleRangeSelect}
            onOpenChange={() => handleMenuClose()}
            onEscape={handleMenuDiscard}
            positioning={menuPositioning}
            initialCalendar={editingDateIsAbsolute}
            range={isBetweenOperator(selectedOperator)}
            betweenLabel={isBetweenOperator(selectedOperator) ? 'Select date range' : undefined}
            inputRef={inputRef}
            menuRef={menuRef}
            filterText={valueFilterText}
            initialValue={editingSingleValue != null ? String(editingSingleValue) : undefined}
          />
        ) : (
          <QueryBarValueMenu
            values={selectedField.values || []}
            open={menuState === 'value'}
            onSelect={handleValueSelect}
            onCommit={handleMultiCommit}
            onOpenChange={() => handleMenuClose()}
            onEscape={handleMenuDiscard}
            multiSelect={isMultiSelectOperator(selectedOperator)}
            initialValues={editingMultiValues}
            highlightValue={editingSingleValue}
            positioning={menuPositioning}
            onBuildingValueChange={handleBuildingValueChange}
            inputRef={inputRef}
            menuRef={menuRef}
            filterText={valueFilterText}
          />
        ))}
    </>
  );
};

QueryBarMenu.displayName = 'QueryBarMenu';
