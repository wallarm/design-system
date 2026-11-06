import type { FC, HTMLAttributes, ReactNode, Ref } from 'react';
import { cn } from '../../utils/cn';
import { mergeRefs } from '../../utils/mergeRefs';
import { useTestId } from '../../utils/testId';
import { searchModalBodyVariants } from './classes';
import { useSearchModalContext } from './SearchModalContext';

export interface SearchModalBodyProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
  children: ReactNode;
}

export const SearchModalBody: FC<SearchModalBodyProps> = ({
  ref,
  children,
  className,
  ...props
}) => {
  const testId = useTestId('body');
  const { listRef } = useSearchModalContext();

  return (
    <div
      {...props}
      ref={mergeRefs(listRef, ref)}
      data-slot='search-modal-body'
      data-testid={testId}
      role='listbox'
      className={cn(searchModalBodyVariants(), className)}
    >
      {children}
    </div>
  );
};

SearchModalBody.displayName = 'SearchModalBody';
