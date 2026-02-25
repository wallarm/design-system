import { type FC, type ReactNode, useEffect, useRef } from 'react';
import { cn } from '../../../utils/cn';
import {
  ScrollArea,
  ScrollAreaCorner,
  ScrollAreaScrollbar,
  ScrollAreaViewport,
} from '../../ScrollArea';
import { tableContainerVariants } from '../classes';
import { useEndReached } from '../hooks';
import { useContainerWidth } from '../lib';
import { TableBody } from '../TableBody';
import { TableColGroup } from '../TableColGroup';
import { useTableContext } from '../TableContext';
import { TableHead } from '../TableHead';
import { TableSettingsMenu } from '../TableSettingsMenu';

interface TableInnerContainerProps {
  isEmpty: boolean;
  virtualized?: 'container';
  showSettings: boolean;
  ariaLabel?: string;
  children?: ReactNode;
}

export const TableInnerContainer: FC<TableInnerContainerProps> = ({
  isEmpty,
  virtualized,
  showSettings,
  ariaLabel,
  children,
}) => {
  const { containerRef, table, isLoading, onEndReached, onEndReachedThreshold } = useTableContext();
  const scrollRootRef = useRef<HTMLDivElement>(null);
  const containerWidth = useContainerWidth(containerRef);

  useEndReached({
    mode: 'container',
    scrollRef: containerRef,
    onEndReached,
    threshold: onEndReachedThreshold,
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
      {showSettings && <TableSettingsMenu />}
    </>
  );
};

TableInnerContainer.displayName = 'TableInnerContainer';
