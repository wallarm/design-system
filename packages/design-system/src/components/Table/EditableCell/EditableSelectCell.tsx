import type { FC, HTMLAttributes, ReactNode, Ref } from 'react';
import { useMemo } from 'react';
import { Select as ArkUiSelect } from '@ark-ui/react/select';
import { cn } from '../../../utils/cn';
import { type TestableProps, useTestId } from '../../../utils/testId';
import {
  createListCollection,
  Select,
  SelectContent,
  type SelectDataItem,
  SelectOption,
  SelectOptionIndicator,
  SelectOptionText,
  SelectPositioner,
} from '../../Select';
import { editableCellPlaceholder, editableCellValue, editableCellVariants } from './classes';

type NativeProps = Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'onChange'>;

export interface EditableSelectCellProps extends NativeProps, TestableProps {
  /** Current committed value; `null` / `''` renders the placeholder. */
  value: string | null;
  /** Called with the picked value when the selection changes. */
  onCommit: (value: string) => void;
  /** Options for the dropdown. */
  items: SelectDataItem[];
  /** Read-mode rendering of the selected value (e.g. a `Badge`). */
  children?: ReactNode;
  /** Shown when nothing is selected. Defaults to `'Select…'`. */
  placeholder?: ReactNode;
  ref?: Ref<HTMLDivElement>;
}

/**
 * Inline-editable, fixed-option cell for the DataTable. The cell IS the select
 * trigger, so the read view is never swapped out — opening the menu only paints
 * the brand-orange border and drops the dropdown below (zero layout shift).
 * When nothing is selected it renders `placeholder`.
 *
 * Analytics-ready: arbitrary `data-*` / `aria-*` / `id` / event props land on
 * the trigger element, which is the real interactive node.
 */
export const EditableSelectCell: FC<EditableSelectCellProps> = ({
  value,
  onCommit,
  items,
  children,
  placeholder = 'Select…',
  className,
  ref,
  'data-testid': testIdProp,
  ...rest
}) => {
  const testId = useTestId(undefined, testIdProp);
  const collection = useMemo(() => createListCollection({ items }), [items]);
  const hasValue = value != null && value !== '';

  return (
    <Select
      collection={collection}
      value={hasValue ? [value] : []}
      data-testid={testId}
      onValueChange={details => {
        const next = details.value[0];
        if (next && next !== value) onCommit(next);
      }}
    >
      <ArkUiSelect.Control>
        <ArkUiSelect.Trigger asChild>
          <div
            {...rest}
            ref={ref}
            data-slot='editable-select-cell'
            className={cn(
              editableCellVariants({ state: 'idle' }),
              // Ark stamps data-state=open on the trigger while the menu is open.
              'data-[state=open]:border-border-strong-brand data-[state=open]:bg-bg-surface-1 data-[state=open]:hover:bg-bg-surface-1',
              className,
            )}
          >
            {hasValue ? (
              <span className={editableCellValue}>{children}</span>
            ) : (
              <span className={editableCellPlaceholder}>{placeholder}</span>
            )}
          </div>
        </ArkUiSelect.Trigger>
      </ArkUiSelect.Control>
      <SelectPositioner>
        <SelectContent>
          {items.map(item => (
            <SelectOption key={item.value} item={item}>
              <SelectOptionText>{item.label}</SelectOptionText>
              <SelectOptionIndicator />
            </SelectOption>
          ))}
        </SelectContent>
      </SelectPositioner>
    </Select>
  );
};

EditableSelectCell.displayName = 'EditableSelectCell';
