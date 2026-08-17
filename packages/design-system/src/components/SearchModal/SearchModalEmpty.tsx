import type { FC, HTMLAttributes, ReactNode, Ref } from 'react';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';

export interface SearchModalEmptyProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
  children: ReactNode;
}

export const SearchModalEmpty: FC<SearchModalEmptyProps> = ({
  ref,
  children,
  className,
  ...props
}) => {
  const testId = useTestId('empty');

  return (
    <div
      {...props}
      ref={ref}
      data-slot='search-modal-empty'
      data-testid={testId}
      className={cn('pb-8', className)}
    >
      {children}
    </div>
  );
};

SearchModalEmpty.displayName = 'SearchModalEmpty';
