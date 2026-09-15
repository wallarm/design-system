import type { FC } from 'react';
import { cn } from '../../utils/cn';
import { TableScrollHandler } from './TableScrollHandler';
import { useTableScrollHandlerContext } from './TableScrollHandlerContext';

/**
 * Internal anchor for the horizontal scroll controls. Registers its DOM node so
 * a consumer-rendered `<TableScrollHandler>` (declared in `Table` children) can
 * portal into it, and renders the default controls when the consumer did not
 * supply one. Mounted in the master column header, gated by overflow.
 */
export const TableScrollHandlerSlot: FC = () => {
  const { setAnchorNode, hasConsumerScrollHandler } = useTableScrollHandlerContext();

  return (
    <>
      {/* h-16 keeps the 24px controls from growing the 32px header row: they
          overflow into the cell padding instead. */}
      <div ref={setAnchorNode} className={cn('shrink-0 ml-auto flex items-center gap-4 h-16')} />
      {!hasConsumerScrollHandler && <TableScrollHandler />}
    </>
  );
};

TableScrollHandlerSlot.displayName = 'TableScrollHandlerSlot';
