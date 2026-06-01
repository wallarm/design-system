import type { FC, HTMLAttributes, ReactNode, Ref } from 'react';
import { cn } from '../../utils/cn';
import { type TestableProps, TestIdProvider } from '../../utils/testId';

export interface TopHeaderProps extends HTMLAttributes<HTMLDivElement>, TestableProps {
  ref?: Ref<HTMLDivElement>;
  children?: ReactNode;
}

export const TopHeader: FC<TopHeaderProps> = ({
  ref,
  className,
  children,
  'data-testid': testId,
  ...props
}) => {
  return (
    <TestIdProvider value={testId}>
      <div
        {...props}
        ref={ref}
        data-slot='top-header'
        data-testid={testId}
        className={cn('flex items-center justify-between pl-7 pr-12 py-6', className)}
      >
        {children}
      </div>
    </TestIdProvider>
  );
};

TopHeader.displayName = 'TopHeader';
