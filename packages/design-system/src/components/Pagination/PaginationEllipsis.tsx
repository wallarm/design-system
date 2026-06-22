import type { FC, HTMLAttributes, Ref } from 'react';
import { Pagination as ArkPagination } from '@ark-ui/react/pagination';
import { Ellipsis } from '../../icons';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';
import { paginationEllipsisVariants } from './classes';
import { usePaginationSizeContext } from './PaginationContext';

export interface PaginationEllipsisProps extends HTMLAttributes<HTMLDivElement> {
  /** Index of this ellipsis within the pages array (required by Ark). */
  index: number;
  ref?: Ref<HTMLDivElement>;
}

export const PaginationEllipsis: FC<PaginationEllipsisProps> = ({
  index,
  className,
  ref,
  ...props
}) => {
  const { size } = usePaginationSizeContext();
  const testId = useTestId('ellipsis');

  return (
    <ArkPagination.Ellipsis
      {...props}
      ref={ref}
      index={index}
      aria-hidden
      className={cn(paginationEllipsisVariants({ size }), className)}
      data-slot='pagination-ellipsis'
      data-testid={testId}
    >
      <Ellipsis size='md' />
    </ArkPagination.Ellipsis>
  );
};

PaginationEllipsis.displayName = 'PaginationEllipsis';
