import type { ButtonHTMLAttributes, FC, MouseEvent } from 'react';
import { isEqual } from '../../../utils/isEqual';
import { type TestableProps, useTestId } from '../../../utils/testId';
import { Button } from '../../Button';
import { useTableContext } from '../TableContext';
import {
  resolveVisibilityDraft,
  useTableSettingsMenuContentContext,
} from './TableSettingsMenuContentContext';

export interface TableSettingsMenuResetProps
  extends
    Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'color' | 'type'>,
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
    deferColumnVisibility,
  } = useTableContext();
  const { visibilityDraft, setVisibilityDraft } = useTableSettingsMenuContentContext();

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (event.defaultPrevented) return;
    if (defaultColumnVisibility && visibilityEnabled) {
      if (deferColumnVisibility) setVisibilityDraft({ fromDefault: true, toggles: {} });
      else table.setColumnVisibility(defaultColumnVisibility);
    }
    if (defaultColumnOrder && columnDndEnabled) {
      setColumnOrder(defaultColumnOrder);
    }
  };

  const { columnVisibility: currentVisibility, columnOrder: currentOrder } = table.state;
  const effectiveOrder = currentOrder.length === 0 ? defaultColumnOrder : currentOrder;
  // Judged on what the close would write, so the button agrees with the menu
  // without deferral (an empty draft resolves to the current visibility).
  const visibilityMatch =
    !defaultColumnVisibility ||
    isEqual(
      resolveVisibilityDraft(visibilityDraft, currentVisibility, defaultColumnVisibility),
      defaultColumnVisibility,
    );
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
