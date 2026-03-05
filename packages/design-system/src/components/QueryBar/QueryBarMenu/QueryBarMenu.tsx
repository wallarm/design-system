import type { FC, RefObject } from 'react';
import { QueryBarDateValueMenu } from './QueryBarDateValueMenu';
import { isBetweenOperator, isMultiSelectOperator } from '../lib';
import type { FieldMetadata, FilterOperator, MenuState } from '../types';
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
  handleFieldSelect: (field: FieldMetadata) => void;
  handleOperatorSelect: (operator: FilterOperator) => void;
  handleValueSelect: (val: string | number | boolean) => void;
  handleMultiCommit: (values: Array<string | number | boolean>) => void;
  handleRangeSelect: (from: string, to: string) => void;
  handleMenuClose: () => void;
  handleMenuDiscard: () => void;
  handleBuildingValueChange: (preview: string | undefined) => void;
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
    handleFieldSelect,
    handleOperatorSelect,
    handleValueSelect,
    handleMultiCommit,
    handleRangeSelect,
    handleMenuClose,
    handleMenuDiscard,
    handleBuildingValueChange,
  } = autocomplete;

  return (
    <>
      <QueryBarFieldMenu
        fields={fields}
        filterText={inputText}
        open={menuState === 'field'}
        onSelect={handleFieldSelect}
        onOpenChange={() => handleMenuClose()}
        onEscape={handleMenuDiscard}
        positioning={menuPositioning}
        inputRef={inputRef}
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
        />
      )}

      {selectedField && selectedOperator && (
        selectedField.type === 'date' ? (
          <QueryBarDateValueMenu
            open={menuState === 'value'}
            onSelect={handleValueSelect}
            onRangeSelect={handleRangeSelect}
            onOpenChange={() => handleMenuClose()}
            onEscape={handleMenuDiscard}
            positioning={menuPositioning}
            initialCalendar={editingDateIsAbsolute}
            range={isBetweenOperator(selectedOperator)}
            betweenLabel={
              isBetweenOperator(selectedOperator) ? 'Select date range' : undefined
            }
            inputRef={inputRef}
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
          />
        )
      )}
    </>
  );
};

QueryBarMenu.displayName = 'QueryBarMenu';
