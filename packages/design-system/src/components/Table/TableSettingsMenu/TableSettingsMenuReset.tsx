import type { ButtonHTMLAttributes, FC, MouseEvent } from 'react';
import { isEqual } from '../../../utils/isEqual';
import { type TestableProps, useTestId } from '../../../utils/testId';
import { Button } from '../../Button';
import { useTableContext } from '../TableContext';

export interface TableSettingsMenuResetProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'color' | 'type'>,
    TestableProps {}

export const TableSettingsMenuReset: FC<TableSettingsMenuResetProps> = ({
  'data-testid': testIdProp,
  onClick,
  ...rest
}) => {
  const testId = useTestId('settings-menu-reset', testIdProp);
  const {
    table,
    visibilityEnabled,
    columnDndEnabled,
    defaultColumnVisibility,
    defaultColumnOrder,
    setColumnOrder,
  } = useTableContext();

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (event.defaultPrevented) return;
    if (defaultColumnVisibility && visibilityEnabled) {
      table.setColumnVisibility(defaultColumnVisibility);
    }
    if (defaultColumnOrder && columnDndEnabled) {
      setColumnOrder(defaultColumnOrder);
    }
  };

  const { columnVisibility: currentVisibility, columnOrder: currentOrder } = table.getState();
  const effectiveOrder = currentOrder.length === 0 ? defaultColumnOrder : currentOrder;
  const visibilityMatch =
    !defaultColumnVisibility || isEqual(currentVisibility, defaultColumnVisibility);
  const orderMatch = !defaultColumnOrder || isEqual(effectiveOrder, defaultColumnOrder);
  const isDefaultState = visibilityMatch && orderMatch;

  return (
    <Button
      {...rest}
      type='button'
      data-testid={testId}
      variant='ghost'
      color='neutral'
      size='small'
      onClick={handleClick}
      disabled={isDefaultState}
      fullWidth
    >
      Reset to default
    </Button>
  );
};

TableSettingsMenuReset.displayName = 'TableSettingsMenuReset';
