import type { ButtonHTMLAttributes, FC, ReactNode, Ref } from 'react';
import { Pagination as ArkPagination } from '@ark-ui/react/pagination';
import { ArrowLeft } from '../../icons';
import { useTestId } from '../../utils/testId';
import { Button } from '../Button';
import { usePaginationSizeContext } from './PaginationContext';

export interface PaginationPreviousProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children?: ReactNode;
  ref?: Ref<HTMLButtonElement>;
}

export const PaginationPrevious: FC<PaginationPreviousProps> = ({ children, ...props }) => {
  const { size } = usePaginationSizeContext();
  const testId = useTestId('previous');

  return (
    <ArkPagination.PrevTrigger asChild>
      <Button
        {...props}
        variant='ghost'
        color='neutral'
        size={size}
        data-slot='pagination-previous'
        data-testid={testId}
      >
        <ArrowLeft />
        {children ?? 'Previous'}
      </Button>
    </ArkPagination.PrevTrigger>
  );
};

PaginationPrevious.displayName = 'PaginationPrevious';
