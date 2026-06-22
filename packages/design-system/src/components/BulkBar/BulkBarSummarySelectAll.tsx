import type { ButtonHTMLAttributes, FC, ReactNode, Ref } from 'react';
import { cn } from '../../utils/cn';
import { type TestableProps, useTestId } from '../../utils/testId';
import { linkVariants } from '../Link';

export interface BulkBarSummarySelectAllProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'color' | 'type'>,
    TestableProps {
  children?: ReactNode;
  ref?: Ref<HTMLButtonElement>;
}

const DEFAULT_LABEL = 'Select all';

export const BulkBarSummarySelectAll: FC<BulkBarSummarySelectAllProps> = ({
  children,
  disabled = false,
  className,
  'data-testid': testIdProp,
  ref,
  ...rest
}) => {
  const testId = useTestId('select-all', testIdProp);

  return (
    <button
      {...rest}
      type='button'
      ref={ref}
      disabled={disabled}
      data-slot='bulk-bar-summary-select-all'
      data-testid={testId}
      className={cn(
        linkVariants({ type: disabled ? 'muted' : 'alt', size: 'md', weight: 'regular', disabled }),
        'whitespace-nowrap',
        className,
      )}
    >
      {children ?? DEFAULT_LABEL}
    </button>
  );
};

BulkBarSummarySelectAll.displayName = 'BulkBarSummarySelectAll';
