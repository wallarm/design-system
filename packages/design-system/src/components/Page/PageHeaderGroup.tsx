import type { FC, HTMLAttributes, Ref } from 'react';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';

export interface PageHeaderGroupProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
}

/** Stacks `PageTitle` and `PageDescription` so they sit as one item beside `PageActions`. */
export const PageHeaderGroup: FC<PageHeaderGroupProps> = ({
  ref,
  children,
  className,
  ...props
}) => {
  const testId = useTestId('header-group');

  return (
    <div
      {...props}
      ref={ref}
      data-testid={testId}
      data-slot='page-header-group'
      className={cn('flex flex-col min-w-0', className)}
    >
      {children}
    </div>
  );
};

PageHeaderGroup.displayName = 'PageHeaderGroup';
