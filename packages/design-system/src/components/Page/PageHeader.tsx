import type { FC, HTMLAttributes, Ref } from 'react';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';

export interface PageHeaderProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
  sticky?: boolean;
}

export const PageHeader: FC<PageHeaderProps> = ({ ref, sticky, children, className, ...props }) => {
  const testId = useTestId('header');

  return (
    <div
      {...props}
      ref={ref}
      data-testid={testId}
      data-slot='page-header'
      className={cn(
        'flex items-center px-24 py-8 gap-12',
        sticky && 'sticky top-0 z-10 bg-bg-surface-2',
        className,
      )}
    >
      {children}
    </div>
  );
};

PageHeader.displayName = 'PageHeader';
