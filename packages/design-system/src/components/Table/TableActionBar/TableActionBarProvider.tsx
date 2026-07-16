import { type FC, type ReactNode, useMemo, useRef } from 'react';
import { Popover as ArkUiPopover } from '@ark-ui/react/popover';
import { useTableContext } from '../TableContext';
import { TableActionBarAnchorRefContext } from './TableActionBarAnchorRefContext';

interface TableActionBarProviderProps {
  children: ReactNode;
}

// Gap between the action bar and the bottom edge of the viewport.
const TABLE_ACTION_BAR_OFFSET = 32;

export const TableActionBarProvider: FC<TableActionBarProviderProps> = ({ children }) => {
  const { table, selectionEnabled } = useTableContext();
  const anchorRef = useRef<HTMLDivElement>(null);

  const selectedCount = selectionEnabled ? Object.keys(table.getState().rowSelection).length : 0;

  const positioning = useMemo<ArkUiPopover.RootProps['positioning']>(() => {
    // Pin the bar to the bottom of the viewport (not the bottom of the
    // table) by anchoring it to a zero-height line spanning the table's
    // horizontal bounds at the viewport's bottom edge. Placing it `top` of
    // that line keeps it just above the bottom edge regardless of the
    // table's scroll position or height.
    //
    // The virtual anchor object must keep a *stable identity* across calls:
    // zag-js's positioner diffs the anchor by reference and re-arms
    // `autoUpdate` whenever it changes. Returning a fresh object on every
    // call would re-arm it in a tight loop and freeze the main thread.
    // `getBoundingClientRect` still recomputes fresh values on each call, so
    // window resizing and table-width changes keep working.
    const anchor = {
      getBoundingClientRect: () => {
        const rect = anchorRef.current?.getBoundingClientRect();
        return DOMRect.fromRect({
          x: rect?.left ?? 0,
          y: window.innerHeight,
          width: rect?.width ?? 0,
          height: 0,
        });
      },
    };

    return {
      strategy: 'fixed',
      placement: 'top',
      gutter: TABLE_ACTION_BAR_OFFSET,
      flip: false,
      getAnchorElement: () => anchor,
    };
  }, []);

  const handleEscapeKeyDown = () => {
    if (selectionEnabled) table.resetRowSelection();
  };

  return (
    <TableActionBarAnchorRefContext.Provider value={anchorRef}>
      <ArkUiPopover.Root
        open={selectedCount > 0}
        closeOnInteractOutside={false}
        portalled={false}
        positioning={positioning}
        onEscapeKeyDown={handleEscapeKeyDown}
      >
        {children}
      </ArkUiPopover.Root>
    </TableActionBarAnchorRefContext.Provider>
  );
};
