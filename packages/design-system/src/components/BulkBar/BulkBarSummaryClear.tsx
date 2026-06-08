import type { ButtonHTMLAttributes, FC, ReactNode, Ref } from 'react';
import { cn } from '../../utils/cn';
import { type TestableProps, useTestId } from '../../utils/testId';
import { linkVariants } from '../Link';

export interface BulkBarSummaryClearProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'color' | 'type'>,
    TestableProps {
  children?: ReactNode;
  ref?: Ref<HTMLButtonElement>;
}

const DEFAULT_LABEL = 'Clear';

export const BulkBarSummaryClear: FC<BulkBarSummaryClearProps> = ({
  children,
  disabled = false,
  className,
  'data-testid': testIdProp,
  ref,
  ...rest
}) => {
  const testId = useTestId('clear', testIdProp);

  return (
    <button
      {...rest}
      type='button'
      ref={ref}
      disabled={disabled}
      data-slot='bulk-bar-summary-clear'
      data-testid={testId}
      className={cn(
        linkVariants({ type: 'alt', size: 'md', weight: 'regular', disabled }),
        'whitespace-nowrap',
        className,
      )}
    >
      {children ?? DEFAULT_LABEL}
    </button>
  );
};

BulkBarSummaryClear.displayName = 'BulkBarSummaryClear';
