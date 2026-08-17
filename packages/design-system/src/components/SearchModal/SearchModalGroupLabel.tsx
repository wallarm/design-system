import type { FC, HTMLAttributes, ReactNode, Ref } from 'react';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';
import { searchModalGroupLabelVariants } from './classes';

export interface SearchModalGroupLabelProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
  children: ReactNode;
}

export const SearchModalGroupLabel: FC<SearchModalGroupLabelProps> = ({
  ref,
  children,
  className,
  ...props
}) => {
  const testId = useTestId('group-label');

  return (
    <div
      {...props}
      ref={ref}
      data-slot='search-modal-group-label'
      data-testid={testId}
      className={cn(searchModalGroupLabelVariants(), className)}
    >
      {children}
    </div>
  );
};

SearchModalGroupLabel.displayName = 'SearchModalGroupLabel';
