import { type FC, type RefObject, useMemo } from 'react';
import { type ChipSegment, SEGMENT_VARIANT } from '../FilterInputField/FilterInputChip';
import {
  getCurrentValueTokenText,
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
  handleMultiSelectToggle: () => void;
  // Inline segment editing
  segmentFilterText: string;
  segmentMenuFilterText: string;
  editingSegment: ChipSegment | null;
  /** Multi-select blur commit; set by value menu, called by blur handler. */
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
    handleMultiSelectToggle,
    segmentMenuFilterText,
    editingSegment,
    blurCommitRef,
  } = autocomplete;

  // Route filter text: segment input when editing, main input otherwise.
  const fieldFilterText =
    editingSegment === SEGMENT_VARIANT.attribute ? segmentMenuFilterText : inputText;
  const operatorFilterText =
    editingSegment === SEGMENT_VARIANT.operator ? segmentMenuFilterText : inputText;

  // Active token: for multi-select operators, strips prior comma-committed
  // values so getSuggestions and dropdown filter see only the in-progress one.
  const currentTokenText = getCurrentValueTokenText(
    editingSegment,
    inputText,
    segmentMenuFilterText,
    selectedOperator,
  );

  // Pass committed chip values to getSuggestions so value-styling helpers
  // (e.g. status-code badges) stay branded even when suggestions narrow.
  const selectedContext = useMemo(
    () => ({
      selectedValues: [
        ...editingMultiValues,
        ...(editingSingleValue != null ? [editingSingleValue] : []),
      ],
    }),
    [editingMultiValues, editingSingleValue],
  );
  const selectedFieldValues = selectedField
    ? getFieldValues(selectedField, currentTokenText, selectedContext)
    : [];
  const valueFilterText = getValueFilterText(
    currentTokenText,
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
          // Freeform fields (no options) skip the dropdown — Enter to commit.
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
              onItemToggle={handleMultiSelectToggle}
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
