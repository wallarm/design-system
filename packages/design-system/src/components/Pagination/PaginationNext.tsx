import type { ButtonHTMLAttributes, FC, ReactNode, Ref } from 'react';
import { Pagination as ArkPagination } from '@ark-ui/react/pagination';
import { ArrowRight } from '../../icons';
import { useTestId } from '../../utils/testId';
import { Button } from '../Button';
import { usePaginationSizeContext } from './PaginationContext';

export interface PaginationNextProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children?: ReactNode;
  ref?: Ref<HTMLButtonElement>;
}

export const PaginationNext: FC<PaginationNextProps> = ({ children, ...props }) => {
  const { size } = usePaginationSizeContext();
  const testId = useTestId('next');

  return (
    <ArkPagination.NextTrigger asChild>
      <Button
        {...props}
        variant='ghost'
        color='neutral'
        size={size}
        data-slot='pagination-next'
        data-testid={testId}
      >
        {children ?? 'Next'}
        <ArrowRight />
      </Button>
    </ArkPagination.NextTrigger>
  );
};

PaginationNext.displayName = 'PaginationNext';
