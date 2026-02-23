import { type FC, useCallback } from 'react';
import { ArrowLeft, ArrowRight } from '../../icons';
import { Button } from '../Button';
import { useTableContext } from './TableContext';

interface TableScrollHandlerProps {
  atStart: boolean;
  atEnd: boolean;
}

export const TableScrollHandler: FC<TableScrollHandlerProps> = ({ atStart, atEnd }) => {
  const ctx = useTableContext();

  const { allLeafColumns, containerRef } = ctx;

  // Visible non-pinned area width — computed at click time for accuracy
  const getScrollPageSize = useCallback(() => {
    const pinnedLeftWidth = allLeafColumns
      .filter(c => c.getIsPinned() === 'left')
      .reduce((sum, c) => sum + c.getSize(), 0);

    return Math.max((containerRef.current?.clientWidth ?? 0) - pinnedLeftWidth, 0);
  }, [allLeafColumns, containerRef]);

  const handleScrollLeft = useCallback(() => {
    containerRef.current?.scrollBy({ left: -getScrollPageSize(), behavior: 'smooth' });
  }, [containerRef, getScrollPageSize]);

  const handleScrollRight = useCallback(() => {
    containerRef.current?.scrollBy({ left: getScrollPageSize(), behavior: 'smooth' });
  }, [containerRef, getScrollPageSize]);

  return (
    <div className='shrink-0 ml-auto flex items-center gap-4'>
      <Button
        variant='ghost'
        color='neutral'
        size='small'
        disabled={atStart}
        onClick={handleScrollLeft}
        aria-label='Scroll left'
      >
        <ArrowLeft />
      </Button>
      <Button
        variant='ghost'
        color='neutral'
        size='small'
        disabled={atEnd}
        onClick={handleScrollRight}
        aria-label='Scroll right'
      >
        <ArrowRight />
      </Button>
    </div>
  );
};

TableScrollHandler.displayName = 'TableScrollHandler';
