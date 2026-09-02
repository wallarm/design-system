import { type FC, type ReactNode, useEffect, useRef } from 'react';
import { useTestId } from '../../../utils/testId';
import { ScrollArea, ScrollAreaScrollbar, ScrollAreaViewport } from '../../ScrollArea';
import { useInfiniteScroll } from '../hooks';
import { useContainerWidth } from '../lib';
import { StickyGroupParent } from '../StickyGroupParent';
import { TableBody } from '../TableBody';
import { TableColGroup } from '../TableColGroup';
import { useTableContext } from '../TableContext';
import { TableHead } from '../TableHead';
import { TableSettingsMenuSlot } from '../TableSettingsMenu';

interface TableInnerWindowProps {
  isEmpty: boolean;
  showSettings: boolean;
  hasConsumerSettingsMenu: boolean;
  ariaLabel?: string;
  children?: ReactNode;
}

export const TableInnerWindow: FC<TableInnerWindowProps> = ({
  isEmpty,
  showSettings,
  hasConsumerSettingsMenu,
  ariaLabel,
  children,
}) => {
  const {
    table,
    virtualizerRef,
    tbodyRef,
    hasSubRowGrouping,
    onEndReached,
    onEndReachedThreshold,
    onStartReached,
    onStartReachedThreshold,
    initialScrollToRowId,
    isLoadingPrevious,
  } = useTableContext();
  const testId = useTestId('window');
  const rootRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const containerWidth = useContainerWidth(rootRef);

  useInfiniteScroll({
    mode: 'window',
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
    const scrollEl = scrollRef.current;
    if (!scrollEl) return;

    const onScroll = () => {
      rootRef.current?.toggleAttribute('data-scrolled', scrollEl.scrollLeft > 0);
    };

    scrollEl.addEventListener('scroll', onScroll, { passive: true });
    return () => scrollEl.removeEventListener('scroll', onScroll);
  }, []);

  const totalSize = table.getTotalSize();
  const tableWidth = Math.max(containerWidth, totalSize);

  const hasTextDescription = table
    .getAllLeafColumns()
    .some(col => col.columnDef.meta?.description?.type === 'text');
  const headerHeight = hasTextDescription ? 48 : 32;

  const tableStyles = 'table-fixed border-separate border-spacing-0';

  return (
    <div ref={rootRef} data-testid={testId} className='group/scroll relative outline-none'>
      <ScrollArea className='group/scroll rounded-12 border border-border-primary-light'>
        <ScrollAreaViewport
          ref={scrollRef}
          data-table-scroll-container
          style={{ overflowX: 'auto', overflowY: 'hidden' }}
        >
          {/* Sticky header */}
          <div className='sticky top-0 z-30'>
            <table className={tableStyles} style={{ width: tableWidth }} aria-hidden>
              <TableColGroup tableWidth={tableWidth} />
              <TableHead />
            </table>
          </div>
          {hasSubRowGrouping && (
            <StickyGroupParent tableWidth={tableWidth} headerHeight={headerHeight} />
          )}

          {/* Body */}
          <table className={tableStyles} style={{ width: tableWidth }} aria-label={ariaLabel}>
            <TableColGroup tableWidth={tableWidth} />
            {!isEmpty && <TableBody />}
          </table>
          {children}
        </ScrollAreaViewport>
        <ScrollAreaScrollbar orientation='horizontal' />
      </ScrollArea>
      {showSettings && <TableSettingsMenuSlot hasConsumerMenu={hasConsumerSettingsMenu} />}
    </div>
  );
};

TableInnerWindow.displayName = 'TableInnerWindow';
