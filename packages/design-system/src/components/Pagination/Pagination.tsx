import type { FC, ReactNode, Ref } from 'react';
import { Pagination as ArkPagination } from '@ark-ui/react/pagination';
import { cn } from '../../utils/cn';
import { type TestableProps, TestIdProvider } from '../../utils/testId';
import { paginationVariants } from './classes';
import { PAGINATION_ROOT_LABEL } from './constants';
import { PaginationSizeProvider } from './PaginationContext';
import type {
  PaginationAlign,
  PaginationPageChangeDetails,
  PaginationPageSizeChangeDetails,
  PaginationSize,
} from './types';

export interface PaginationProps extends TestableProps {
  /** Total number of data items (Ark `count`). */
  count?: number;
  /** Controlled current page (1-based). */
  page?: number;
  /** Uncontrolled initial page. @default 1 */
  defaultPage?: number;
  /** Controlled items-per-page. */
  pageSize?: number;
  /** Uncontrolled initial items-per-page. @default 10 */
  defaultPageSize?: number;
  /** Pages shown beside the active page. @default 1 */
  siblingCount?: number;
  /** Pages shown at the start/end. @default 1 */
  boundaryCount?: number;
  onPageChange?: (details: PaginationPageChangeDetails) => void;
  onPageSizeChange?: (details: PaginationPageSizeChangeDetails) => void;
  /** Trigger element type. @default 'button' */
  type?: 'button' | 'link';
  getPageUrl?: (details: PaginationPageChangeDetails) => string;
  /** Visual size. @default 'medium' */
  size?: PaginationSize;
  /** Horizontal alignment of the row. @default 'left' */
  align?: PaginationAlign;
  'aria-label'?: string;
  className?: string;
  children?: ReactNode;
  ref?: Ref<HTMLElement>;
}

export const Pagination: FC<PaginationProps> = ({
  size = 'medium',
  align = 'left',
  className,
  children,
  ref,
  'data-testid': testId,
  'aria-label': ariaLabel = PAGINATION_ROOT_LABEL,
  ...arkProps
}) => (
  <PaginationSizeProvider size={size}>
    <TestIdProvider value={testId}>
      <ArkPagination.Root
        {...arkProps}
        ref={ref}
        translations={{ rootLabel: ariaLabel }}
        className={cn(paginationVariants({ align }), className)}
        data-slot='pagination'
        data-testid={testId}
      >
        {children}
      </ArkPagination.Root>
    </TestIdProvider>
  </PaginationSizeProvider>
);

Pagination.displayName = 'Pagination';
