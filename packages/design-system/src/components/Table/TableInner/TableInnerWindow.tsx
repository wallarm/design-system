import { type FC, type ReactNode, useEffect, useRef } from 'react';
import { useTestId } from '../../../utils/testId';
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
  const { table, onEndReached, onEndReachedThreshold } = useTableContext();
  const testId = useTestId('window');
  const rootRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const containerWidth = useContainerWidth(rootRef);

  useEndReached({
    mode: 'window',
    onEndReached,
    threshold: onEndReachedThreshold,
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

          {/* Body */}
          <table className={tableStyles} style={{ width: tableWidth }} aria-label={ariaLabel}>
            <TableColGroup tableWidth={tableWidth} />
            {!isEmpty && <TableBody />}
          </table>
          {children}
        </ScrollAreaViewport>
        <ScrollAreaScrollbar orientation='horizontal' />
      </ScrollArea>
      {showSettings && <TableSettingsMenu />}
    </div>
  );
};

TableInnerWindow.displayName = 'TableInnerWindow';
