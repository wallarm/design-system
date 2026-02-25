import { type FC, type ReactNode, useCallback, useEffect, useRef } from 'react';
import { ScrollArea, ScrollAreaScrollbar, ScrollAreaViewport } from '../../ScrollArea';
import { useEndReached } from '../hooks';
import { useContainerWidth } from '../lib';
import { TableBody } from '../TableBody';
import { TableColGroup } from '../TableColGroup';
import { useTableContext } from '../TableContext';
import { TableHead } from '../TableHead';
import { TableSettingsMenu } from '../TableSettingsMenu';

interface TableInnerWindowProps {
  isEmpty: boolean;
  showSettings: boolean;
  ariaLabel?: string;
  children?: ReactNode;
}

export const TableInnerWindow: FC<TableInnerWindowProps> = ({
  isEmpty,
  showSettings,
  ariaLabel,
  children,
}) => {
  const { table, isLoading, onEndReached, onEndReachedThreshold } = useTableContext();
  const rootRef = useRef<HTMLDivElement>(null);
  const headerScrollRef = useRef<HTMLDivElement>(null);
  const bodyScrollRef = useRef<HTMLDivElement>(null);
  const isSyncing = useRef(false);
  const containerWidth = useContainerWidth(rootRef);

  useEndReached({
    mode: 'window',
    onEndReached,
    threshold: onEndReachedThreshold,
  });

  // Sync horizontal scroll between header and body
  const syncScroll = useCallback((source: HTMLDivElement, target: HTMLDivElement) => {
    if (isSyncing.current) return;
    isSyncing.current = true;
    target.scrollLeft = source.scrollLeft;
    isSyncing.current = false;
  }, []);

  useEffect(() => {
    const header = headerScrollRef.current;
    const body = bodyScrollRef.current;
    if (!header || !body) return;

    const onBodyScroll = () => {
      syncScroll(body, header);
      rootRef.current?.toggleAttribute('data-scrolled', body.scrollLeft > 0);
    };
    const onHeaderScroll = () => syncScroll(header, body);

    body.addEventListener('scroll', onBodyScroll, { passive: true });
    header.addEventListener('scroll', onHeaderScroll, { passive: true });

    return () => {
      body.removeEventListener('scroll', onBodyScroll);
      header.removeEventListener('scroll', onHeaderScroll);
    };
  }, [syncScroll]);

  useEffect(() => {
    if (!isLoading || isEmpty || onEndReached) return;
    window.scrollTo({ top: document.documentElement.scrollHeight });
  }, [isLoading, isEmpty, onEndReached]);

  const totalSize = table.getTotalSize();
  const tableWidth = Math.max(containerWidth, totalSize);

  const tableStyles = 'table-fixed border-separate border-spacing-0';

  return (
    <>
      <div ref={rootRef} className='group/scroll outline-none'>
        {/* Sticky header — own border/rounding so it looks correct when detached */}
        <div className='sticky top-0 z-30 relative'>
          <div
            ref={headerScrollRef}
            className='overflow-hidden rounded-t-12 border border-b-0 border-border-primary-light'
          >
            <table className={tableStyles} style={{ width: tableWidth }} aria-hidden>
              <TableColGroup tableWidth={tableWidth} />
              <TableHead />
            </table>
          </div>
          {showSettings && <TableSettingsMenu />}
        </div>

        {/* Scrollable body — ScrollArea for styled horizontal scrollbar */}
        <ScrollArea className='group/scroll rounded-b-12 border border-t-0 border-border-primary-light'>
          <ScrollAreaViewport
            ref={bodyScrollRef}
            data-table-scroll-container
            style={{ overflowX: 'auto', overflowY: 'hidden' }}
          >
            <table className={tableStyles} style={{ width: tableWidth }} aria-label={ariaLabel}>
              <TableColGroup tableWidth={tableWidth} />
              {!isEmpty && <TableBody />}
            </table>
            {children}
          </ScrollAreaViewport>
          <ScrollAreaScrollbar orientation='horizontal' />
        </ScrollArea>
      </div>
    </>
  );
};

TableInnerWindow.displayName = 'TableInnerWindow';
