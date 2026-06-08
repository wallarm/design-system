import type { FC, ReactNode } from 'react';
import { useTestId } from '../../../utils/testId';
import { Link, type LinkProps } from '../../Link';
import { useSelectionContext } from '../useSelectionContext';

export interface SelectionBulkBarClearProps
  extends Omit<LinkProps, 'href' | 'as' | 'asChild' | 'onClick' | 'children'> {
  children?: ReactNode;
}

const DEFAULT_LABEL = 'Clear';

export const SelectionBulkBarClear: FC<SelectionBulkBarClearProps> = ({
  children,
  type = 'alt',
  size = 'md',
  'data-testid': testIdProp,
  ...rest
}) => {
  const { clear } = useSelectionContext();
  const testId = useTestId('bulk-bar-clear', testIdProp);

  return (
    <Link {...rest} data-testid={testId} type={type} size={size} onClick={clear}>
      {children ?? DEFAULT_LABEL}
    </Link>
  );
};

SelectionBulkBarClear.displayName = 'SelectionBulkBarClear';
