import { type FC, type ReactNode, useEffect, useRef } from 'react';
import { useTestId } from '../../../utils/testId';
import { ScrollArea, ScrollAreaScrollbar, ScrollAreaViewport } from '../../ScrollArea';
import { useInfiniteScroll, useShiftWheelHorizontalScroll } from '../hooks';
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
    containerRef,
    headerScrollRef,
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
    const scrollEl = containerRef.current;
    if (!scrollEl) return;

    const onScroll = () => {
      rootRef.current?.toggleAttribute('data-scrolled', scrollEl.scrollLeft > 0);
      // The header lives outside the horizontal scroller (see below), so it
      // follows the body by mirroring its scrollLeft.
      if (headerScrollRef.current) headerScrollRef.current.scrollLeft = scrollEl.scrollLeft;
    };

    scrollEl.addEventListener('scroll', onScroll, { passive: true });
    return () => scrollEl.removeEventListener('scroll', onScroll);
  }, [containerRef, headerScrollRef]);

  useShiftWheelHorizontalScroll(containerRef);

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
        {/*
          Sticky header. It must sit outside the horizontal scroll viewport:
          any overflow other than `visible` makes that viewport the sticky
          containing block, and the viewport itself scrolls away with the
          window, so a header inside it never snaps. The settings slot is
          absolutely positioned, so it rides along with the sticky shell.
        */}
        <div className='sticky top-0 z-30'>
          <div ref={headerScrollRef} className='overflow-hidden'>
            <table className={tableStyles} style={{ width: tableWidth }} aria-hidden>
              <TableColGroup tableWidth={tableWidth} />
              <TableHead />
            </table>
          </div>
          {showSettings && <TableSettingsMenuSlot hasConsumerMenu={hasConsumerSettingsMenu} />}
        </div>
        <ScrollAreaViewport
          ref={containerRef}
          data-table-scroll-container
          style={{ overflowX: 'auto', overflowY: 'hidden' }}
        >
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
    </div>
  );
};

TableInnerWindow.displayName = 'TableInnerWindow';
