import type { FC, RefObject } from 'react';
import type { ChipSegment } from '../FilterInputField/FilterInputChip';
import {
  getFieldValues,
  getValueFilterText,
  isBetweenOperator,
  isMultiSelectOperator,
} from '../lib';
import type { FieldMetadata, FilterOperator, MenuState } from '../types';
import { FilterInputDateValueMenu } from './FilterInputDateValueMenu';
import { FilterInputFieldMenu } from './FilterInputFieldMenu';
import { FilterInputOperatorMenu } from './FilterInputOperatorMenu';
import { FilterInputValueMenu } from './FilterInputValueMenu';

export interface FilterInputAutocompleteState {
  inputText: string;
  menuState: MenuState;
  selectedField: FieldMetadata | null;
  selectedOperator: FilterOperator | null;
  menuPositioning: Record<string, unknown>;
  editingMultiValues: Array<string | number | boolean>;
  editingSingleValue: string | number | boolean | undefined;
  editingDateRange: [string, string] | undefined;
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
  segmentMenuFilterText: string;
  editingSegment: ChipSegment | null;
  /** Ref for multi-select blur commit — set by value menu, called by blur handler */
  blurCommitRef: RefObject<(() => boolean) | null>;
}

export interface FilterInputMenuProps {
  fields: FieldMetadata[];
  autocomplete: FilterInputAutocompleteState;
}

export const FilterInputMenu: FC<FilterInputMenuProps> = ({ fields, autocomplete }) => {
  const {
    inputText,
    menuState,
    selectedField,
    selectedOperator,
    menuPositioning,
    editingMultiValues,
    editingSingleValue,
    editingDateRange,
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
    segmentMenuFilterText,
    editingSegment,
    blurCommitRef,
  } = autocomplete;

  // Route filter text: use menu filter text (empty until user types) when editing, otherwise main input
  const fieldFilterText = editingSegment === 'attribute' ? segmentMenuFilterText : inputText;
  // Operator: filter by typed text from main input (building) or segment input (inline editing)
  const operatorFilterText = editingSegment === 'operator' ? segmentMenuFilterText : inputText;

  const selectedFieldValues = selectedField ? getFieldValues(selectedField) : [];
  const valueFilterText = getValueFilterText(
    editingSegment,
    inputText,
    segmentMenuFilterText,
    selectedOperator,
    selectedFieldValues,
  );

  const showOperatorMenu = !!selectedField;
  const showValueMenu = !!selectedField && !!selectedOperator;
  const isDateField = selectedField?.type === 'date';
  const hasValueOptions = selectedFieldValues.length > 0;

  return (
    <>
      <FilterInputFieldMenu
        fields={fields}
        filterText={fieldFilterText}
        open={menuState === 'field'}
        onSelect={handleFieldSelect}
        onOpenChange={handleMenuClose}
        onEscape={handleMenuDiscard}
        positioning={menuPositioning}
        inputRef={inputRef}
        menuRef={menuRef}
      />

      {showOperatorMenu && (
        <FilterInputOperatorMenu
          fieldType={selectedField.type}
          operators={selectedField.operators}
          open={menuState === 'operator'}
          onSelect={handleOperatorSelect}
          onOpenChange={handleMenuClose}
          onEscape={handleMenuDiscard}
          positioning={menuPositioning}
          inputRef={inputRef}
          menuRef={menuRef}
          filterText={operatorFilterText}
        />
      )}

      {showValueMenu &&
        (isDateField ? (
          <FilterInputDateValueMenu
            open={menuState === 'value'}
            onSelect={handleValueSelect}
            onRangeSelect={handleRangeSelect}
            onOpenChange={handleMenuClose}
            onEscape={handleMenuDiscard}
            positioning={menuPositioning}
            range={isBetweenOperator(selectedOperator)}
            menuRef={menuRef}
            initialValue={editingSingleValue != null ? String(editingSingleValue) : undefined}
            initialRangeValue={editingDateRange}
            filterText={valueFilterText}
          />
        ) : (
          // Freeform fields (no predefined values) skip the dropdown — user types and presses Enter
          hasValueOptions && (
            <FilterInputValueMenu
              values={selectedFieldValues}
              open={menuState === 'value'}
              onSelect={handleValueSelect}
              onCommit={handleMultiCommit}
              onOpenChange={handleMenuClose}
              onEscape={handleMenuDiscard}
              multiSelect={isMultiSelectOperator(selectedOperator)}
              initialValues={editingMultiValues}
              highlightValue={editingSingleValue}
              positioning={menuPositioning}
              onBuildingValueChange={handleBuildingValueChange}
              inputRef={inputRef}
              menuRef={menuRef}
              filterText={valueFilterText}
              blurCommitRef={blurCommitRef}
            />
          )
        ))}
    </>
  );
};

FilterInputMenu.displayName = 'FilterInputMenu';
