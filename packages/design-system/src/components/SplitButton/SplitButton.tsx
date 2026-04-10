import type { ComponentPropsWithRef, FC, ReactNode } from 'react';
import { cn } from '../../utils/cn';
import { type TestableProps, TestIdProvider } from '../../utils/testId';
import { splitButtonVariants } from './classes';

export interface SplitButtonProps extends ComponentPropsWithRef<'div'>, TestableProps {
  children: ReactNode;
}

export const SplitButton: FC<SplitButtonProps> = ({
  'data-testid': testId,
  className,
  children,
  ref,
  ...props
}) => (
  <TestIdProvider value={testId}>
    <div
      {...props}
      ref={ref}
      role='group'
      data-slot='split-button'
      data-testid={testId}
      className={cn(splitButtonVariants(), className)}
    >
      {children}
    </div>
  </TestIdProvider>
);

SplitButton.displayName = 'SplitButton';
