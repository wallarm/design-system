import { type FC, type ReactNode, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { cn } from '../../utils/cn';
import {
  ScrollArea,
  ScrollAreaCorner,
  ScrollAreaScrollbar,
  ScrollAreaViewport,
} from '../ScrollArea';
import { tableContainerVariants } from './classes';
import { TableActionBarAnchor, TableActionBarProvider } from './TableActionBar';
import { TableBody } from './TableBody';
import { TableColGroup } from './TableColGroup';
import { useTableContext } from './TableContext';
import { TableHead } from './TableHead';
import { TableSettingsMenu } from './TableSettingsMenu';

interface TableInnerProps {
  isEmpty: boolean;
  virtualized: boolean;
  showSettings: boolean;
  ariaLabel?: string;
  children?: ReactNode;
}

export const TableInner: FC<TableInnerProps> = ({
  isEmpty,
  virtualized,
  showSettings,
  ariaLabel,
  children,
}) => {
  const { containerRef, table } = useTableContext();
  const scrollRootRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    setContainerWidth(el.clientWidth);

    const ro = new ResizeObserver(([entry]) => {
      if (entry) {
        setContainerWidth(entry.contentRect.width);
      }
    });

    ro.observe(el);
    return () => ro.disconnect();
  }, [containerRef]);

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
    <TableActionBarProvider>
      <TableActionBarAnchor>
        <ScrollArea
          ref={scrollRootRef}
          className={cn('group/scroll', tableContainerVariants({ virtualized }))}
        >
          <ScrollAreaViewport ref={containerRef} data-table-scroll-container tabIndex={-1}>
            <table
              className={cn('table-fixed border-separate border-spacing-0')}
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
      </TableActionBarAnchor>
    </TableActionBarProvider>
  );
};

TableInner.displayName = 'TableInner';
