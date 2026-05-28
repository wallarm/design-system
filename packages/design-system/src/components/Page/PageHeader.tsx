import type { FC, HTMLAttributes, Ref } from 'react';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';

export interface PageHeaderProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
}

export const PageHeader: FC<PageHeaderProps> = ({ ref, children, className, ...props }) => {
  const testId = useTestId('header');

  return (
    <div
      {...props}
      ref={ref}
      data-testid={testId}
      data-slot='page-header'
      className={cn('flex items-center justify-between px-24 py-16 gap-16', className)}
    >
      {children}
    </div>
  );
};

PageHeader.displayName = 'PageHeader';
