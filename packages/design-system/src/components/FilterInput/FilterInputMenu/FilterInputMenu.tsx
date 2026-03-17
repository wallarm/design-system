import type { FC, RefObject } from 'react';
import type { ChipSegment } from '../FilterInputField/FilterInputChip';
import { getFieldValues, isBetweenOperator, isMultiSelectOperator } from '../lib';
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
  // Operator: filter by typed text when building a new chip (not inline editing)
  const operatorFilterText = !editingSegment ? inputText : '';

  const selectedFieldValues = selectedField ? getFieldValues(selectedField) : [];

  // For multi-select, filter by the text after the last comma —
  // but only if that token is NOT already a known selected value (otherwise show all).
  const valueFilterText = (() => {
    if (editingSegment !== 'value') return inputText;
    if (!isMultiSelectOperator(selectedOperator)) return segmentMenuFilterText;
    const lastToken = segmentMenuFilterText.split(',').pop()?.trim() ?? '';
    if (!lastToken) return '';
    // If the last token matches a field value label/value, it's a completed selection — don't filter
    if (selectedFieldValues.length > 0) {
      const isKnownValue = selectedFieldValues.some(
        v =>
          v.label.toLowerCase() === lastToken.toLowerCase() ||
          String(v.value).toLowerCase() === lastToken.toLowerCase(),
      );
      if (isKnownValue) return '';
    }
    return lastToken;
  })();

  return (
    <>
      <FilterInputFieldMenu
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
        <FilterInputOperatorMenu
          fieldType={selectedField.type}
          operators={selectedField.operators}
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
          <FilterInputDateValueMenu
            open={menuState === 'value'}
            onSelect={handleValueSelect}
            onRangeSelect={handleRangeSelect}
            onOpenChange={() => handleMenuClose()}
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
          selectedFieldValues.length > 0 && (
            <FilterInputValueMenu
              values={selectedFieldValues}
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
              blurCommitRef={blurCommitRef}
            />
          )
        ))}
    </>
  );
};

FilterInputMenu.displayName = 'FilterInputMenu';
