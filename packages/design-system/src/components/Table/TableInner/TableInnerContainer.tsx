import { type FC, type ReactNode, useEffect, useRef } from 'react';
import { cn } from '../../../utils/cn';
import { useTestId } from '../../../utils/testId';
import {
  ScrollArea,
  ScrollAreaCorner,
  ScrollAreaScrollbar,
  ScrollAreaViewport,
} from '../../ScrollArea';
import { tableContainerVariants } from '../classes';
import { useInfiniteScroll } from '../hooks';
import { useContainerWidth } from '../lib';
import { TableBody } from '../TableBody';
import { TableColGroup } from '../TableColGroup';
import { useTableContext } from '../TableContext';
import { TableHead } from '../TableHead';
import { TableSettingsMenuSlot } from '../TableSettingsMenu';

interface TableInnerContainerProps {
  isEmpty: boolean;
  virtualized?: 'container';
  showSettings: boolean;
  hasConsumerSettingsMenu: boolean;
  ariaLabel?: string;
  children?: ReactNode;
}

export const TableInnerContainer: FC<TableInnerContainerProps> = ({
  isEmpty,
  virtualized,
  showSettings,
  hasConsumerSettingsMenu,
  ariaLabel,
  children,
}) => {
  const {
    containerRef,
    table,
    virtualizerRef,
    tbodyRef,
    onEndReached,
    onEndReachedThreshold,
    onStartReached,
    onStartReachedThreshold,
    initialScrollToRowId,
    isLoadingPrevious,
  } = useTableContext();
  const testId = useTestId('container');
  const scrollRootRef = useRef<HTMLDivElement>(null);
  const containerWidth = useContainerWidth(containerRef);

  useInfiniteScroll({
    mode: 'container',
    scrollRef: containerRef,
    table,
    virtualizerRef,
    tbodyRef,
    onEndReached,
    onEndReachedThreshold,
    onStartReached,
    onStartReachedThreshold,
    initialScrollToRowId,
    isLoadingPrevious,
  });

  useEffect(() => {
    const viewport = containerRef.current;
    const root = scrollRootRef.current;
    if (!viewport || !root) return;

    const handleScroll = () => {
      root.toggleAttribute('data-scrolled', viewport.scrollLeft > 0);
    };

    handleScroll();
    viewport.addEventListener('scroll', handleScroll, { passive: true });
    return () => viewport.removeEventListener('scroll', handleScroll);
  }, [containerRef]);

  const totalSize = table.getTotalSize();
  const tableWidth = Math.max(containerWidth, totalSize);

  return (
    <>
      <ScrollArea
        ref={scrollRootRef}
        data-testid={testId}
        className={cn('group/scroll', tableContainerVariants({ virtualized }))}
      >
        <ScrollAreaViewport ref={containerRef} data-table-scroll-container tabIndex={-1}>
          <table
            className='table-fixed border-separate border-spacing-0 overflow-clip'
            style={{ width: tableWidth }}
            aria-label={ariaLabel}
          >
            <TableColGroup tableWidth={tableWidth} />
            <TableHead />
            {!isEmpty && <TableBody />}
          </table>
          {children}
        </ScrollAreaViewport>
        <ScrollAreaScrollbar orientation='horizontal' />
        <ScrollAreaScrollbar orientation='vertical' />
        <ScrollAreaCorner />
      </ScrollArea>
      {showSettings && <TableSettingsMenuSlot hasConsumerMenu={hasConsumerSettingsMenu} />}
    </>
  );
};

TableInnerContainer.displayName = 'TableInnerContainer';
