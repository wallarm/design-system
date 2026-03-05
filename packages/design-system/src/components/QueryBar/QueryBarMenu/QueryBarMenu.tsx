import type { FC } from 'react';
import { QueryBarDateValueMenu } from './QueryBarDateValueMenu';
import { isBetweenOperator, isMultiSelectOperator } from '../lib';
import type { FieldMetadata, FilterOperator, MenuState } from '../types';
import { QueryBarFieldMenu } from './QueryBarFieldMenu';
import { QueryBarOperatorMenu } from './QueryBarOperatorMenu';
import { QueryBarValueMenu } from './QueryBarValueMenu';

export interface QueryBarMenuProps {
  fields: FieldMetadata[];
  menuState: MenuState;
  selectedField: FieldMetadata | null;
  selectedOperator: FilterOperator | null;
  menuPositioning: Record<string, unknown>;
  editingMultiValues: Array<string | number | boolean>;
  editingSingleValue: string | number | boolean | undefined;
  editingDateIsAbsolute: boolean;
  onFieldSelect: (field: FieldMetadata) => void;
  onOperatorSelect: (operator: FilterOperator) => void;
  onValueSelect: (val: string | number | boolean) => void;
  onMultiCommit: (values: Array<string | number | boolean>) => void;
  onRangeSelect: (from: string, to: string) => void;
  onMenuClose: () => void;
  onMenuDiscard: () => void;
  onBuildingValueChange: (preview: string | undefined) => void;
}

export const QueryBarMenu: FC<QueryBarMenuProps> = ({
  fields,
  menuState,
  selectedField,
  selectedOperator,
  menuPositioning,
  editingMultiValues,
  editingSingleValue,
  editingDateIsAbsolute,
  onFieldSelect,
  onOperatorSelect,
  onValueSelect,
  onMultiCommit,
  onRangeSelect,
  onMenuClose,
  onMenuDiscard,
  onBuildingValueChange,
}) => (
  <>
    <QueryBarFieldMenu
      fields={fields}
      open={menuState === 'field'}
      onSelect={onFieldSelect}
      onOpenChange={() => onMenuClose()}
      onEscape={onMenuDiscard}
      positioning={menuPositioning}
    />

    {selectedField && (
      <QueryBarOperatorMenu
        fieldType={selectedField.type}
        open={menuState === 'operator'}
        onSelect={onOperatorSelect}
        onOpenChange={() => onMenuClose()}
        onEscape={onMenuDiscard}
        positioning={menuPositioning}
      />
    )}

    {selectedField && selectedOperator && (
      selectedField.type === 'date' ? (
        <QueryBarDateValueMenu
          open={menuState === 'value'}
          onSelect={onValueSelect}
          onRangeSelect={onRangeSelect}
          onOpenChange={() => onMenuClose()}
          onEscape={onMenuDiscard}
          positioning={menuPositioning}
          initialCalendar={editingDateIsAbsolute}
          range={isBetweenOperator(selectedOperator)}
          betweenLabel={
            isBetweenOperator(selectedOperator) ? 'Select date range' : undefined
          }
        />
      ) : (
        <QueryBarValueMenu
          values={selectedField.values || []}
          open={menuState === 'value'}
          onSelect={onValueSelect}
          onCommit={onMultiCommit}
          onOpenChange={() => onMenuClose()}
          onEscape={onMenuDiscard}
          multiSelect={isMultiSelectOperator(selectedOperator)}
          initialValues={editingMultiValues}
          highlightValue={editingSingleValue}
          positioning={menuPositioning}
          onBuildingValueChange={onBuildingValueChange}
        />
      )
    )}
  </>
);

QueryBarMenu.displayName = 'QueryBarMenu';
