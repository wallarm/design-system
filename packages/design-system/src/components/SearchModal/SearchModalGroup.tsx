import type { FC, HTMLAttributes, ReactNode, Ref } from 'react';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';

export interface SearchModalGroupProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
  children: ReactNode;
}

export const SearchModalGroup: FC<SearchModalGroupProps> = ({
  ref,
  children,
  className,
  ...props
}) => {
  const testId = useTestId('group');

  return (
    <div
      {...props}
      ref={ref}
      data-slot='search-modal-group'
      data-testid={testId}
      role='group'
      className={cn('[&:not(:first-child)]:mt-4', className)}
    >
      {children}
    </div>
  );
};

SearchModalGroup.displayName = 'SearchModalGroup';
