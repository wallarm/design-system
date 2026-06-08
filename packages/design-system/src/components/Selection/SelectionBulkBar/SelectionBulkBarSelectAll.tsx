import type { FC, ReactNode } from 'react';
import { useTestId } from '../../../utils/testId';
import { Link, type LinkProps } from '../../Link';
import { useSelectionContext } from '../useSelectionContext';

export interface SelectionBulkBarSelectAllProps
  extends Omit<LinkProps, 'href' | 'as' | 'asChild' | 'onClick' | 'disabled' | 'children'> {
  children?: ReactNode;
}

const DEFAULT_LABEL = 'Select all';

export const SelectionBulkBarSelectAll: FC<SelectionBulkBarSelectAllProps> = ({
  children,
  type,
  size = 'md',
  'data-testid': testIdProp,
  ...rest
}) => {
  const { isAllSelected, selectAll } = useSelectionContext();
  const testId = useTestId('bulk-bar-select-all', testIdProp);

  return (
    <Link
      {...rest}
      data-testid={testId}
      type={type ?? (isAllSelected ? 'muted' : 'alt')}
      size={size}
      onClick={selectAll}
      disabled={isAllSelected}
    >
      {children ?? DEFAULT_LABEL}
    </Link>
  );
};

SelectionBulkBarSelectAll.displayName = 'SelectionBulkBarSelectAll';
