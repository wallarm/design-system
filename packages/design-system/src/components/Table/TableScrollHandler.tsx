import { type FC, useCallback } from 'react';
import { ArrowLeft, ArrowRight } from '../../icons';
import { cn } from '../../utils/cn';
import { Tooltip, TooltipContent, TooltipTrigger } from '../Tooltip';
import { tableHeaderButtonClass } from './classes';
import { useTableContext } from './TableContext';

interface TableScrollHandlerProps {
  atStart: boolean;
  atEnd: boolean;
}

const scrollButtonClass = cn(
  tableHeaderButtonClass,
  'disabled:cursor-not-allowed disabled:opacity-50',
);

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
      <Tooltip disabled={atStart}>
        <TooltipTrigger asChild>
          <button
            type='button'
            className={scrollButtonClass}
            disabled={atStart}
            onClick={handleScrollLeft}
            aria-label='Scroll left'
          >
            <ArrowLeft size='sm' />
          </button>
        </TooltipTrigger>
        <TooltipContent>Scroll left</TooltipContent>
      </Tooltip>
      <Tooltip disabled={atEnd}>
        <TooltipTrigger asChild>
          <button
            type='button'
            className={scrollButtonClass}
            disabled={atEnd}
            onClick={handleScrollRight}
            aria-label='Scroll right'
          >
            <ArrowRight size='sm' />
          </button>
        </TooltipTrigger>
        <TooltipContent>Scroll right</TooltipContent>
      </Tooltip>
    </div>
  );
};

TableScrollHandler.displayName = 'TableScrollHandler';
