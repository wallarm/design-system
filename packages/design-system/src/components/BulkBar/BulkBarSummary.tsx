import type { ComponentPropsWithoutRef, FC, ReactNode, Ref } from 'react';
import { cn } from '../../utils/cn';
import { type TestableProps, TestIdProvider, useTestId } from '../../utils/testId';

export interface BulkBarSummaryProps
  extends Omit<ComponentPropsWithoutRef<'div'>, 'children'>,
    TestableProps {
  children: ReactNode;
  ref?: Ref<HTMLDivElement>;
}

export const BulkBarSummary: FC<BulkBarSummaryProps> = ({
  children,
  className,
  ref,
  'data-testid': testIdProp,
  ...rest
}) => {
  const testId = useTestId('bulk-bar-summary', testIdProp);

  return (
    <TestIdProvider value={testId}>
      <div
        {...rest}
        ref={ref}
        data-slot='bulk-bar-summary'
        data-testid={testId}
        className={cn('flex items-center gap-16 p-8', className)}
      >
        {children}
      </div>
    </TestIdProvider>
  );
};

BulkBarSummary.displayName = 'BulkBarSummary';
