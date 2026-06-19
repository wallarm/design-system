import type { FC, ReactNode, Ref } from 'react';
import { Pagination as ArkPagination } from '@ark-ui/react/pagination';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';
import { PaginationEllipsis } from './PaginationEllipsis';
import { PaginationItem } from './PaginationItem';
import type { PaginationPage } from './types';

export interface PaginationListProps {
  className?: string;
  /** Optional override for rendering each page entry. */
  children?: (page: PaginationPage, index: number) => ReactNode;
  ref?: Ref<HTMLUListElement>;
}

export const PaginationList: FC<PaginationListProps> = ({ className, children, ref }) => {
  const testId = useTestId('list');

  return (
    <ArkPagination.Context>
      {api => (
        <ul
          ref={ref}
          className={cn('flex items-center gap-2', className)}
          data-slot='pagination-list'
          data-testid={testId}
        >
          {api.pages.map((page, index) => (
            <li key={page.type === 'page' ? `page-${page.value}` : `ellipsis-${index}`}>
              {children ? (
                children(page, index)
              ) : page.type === 'page' ? (
                <PaginationItem value={page.value}>{page.value}</PaginationItem>
              ) : (
                <PaginationEllipsis index={index} />
              )}
            </li>
          ))}
        </ul>
      )}
    </ArkPagination.Context>
  );
};

PaginationList.displayName = 'PaginationList';
