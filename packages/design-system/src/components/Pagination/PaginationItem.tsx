import type { ButtonHTMLAttributes, FC, Ref } from 'react';
import { Pagination as ArkPagination } from '@ark-ui/react/pagination';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';
import { paginationItemVariants } from './classes';
import { usePaginationSizeContext } from './PaginationContext';

export interface PaginationItemProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** 1-based page number. */
  value: number;
  ref?: Ref<HTMLButtonElement>;
}

export const PaginationItem: FC<PaginationItemProps> = ({ value, className, ref, ...props }) => {
  const { size } = usePaginationSizeContext();
  const testId = useTestId('item');

  return (
    <ArkPagination.Item
      {...props}
      ref={ref}
      type='page'
      value={value}
      className={cn(paginationItemVariants({ size }), className)}
      data-slot='pagination-item'
      data-testid={testId}
    />
  );
};

PaginationItem.displayName = 'PaginationItem';
