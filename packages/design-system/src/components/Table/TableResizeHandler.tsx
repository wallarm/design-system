import type { Header } from '@tanstack/react-table';
import { cva } from 'class-variance-authority';
import { cn } from '../../utils/cn';

const tableResizeHandlerVariants = cva(
  cn(
    'absolute z-50 top-3 bottom-3 right-0 rounded-2 w-3 translate-x-2 isolate',
    'cursor-col-resize select-none touch-none',
    'bg-bg-fill-brand opacity-0 transition-all',
    'hover:opacity-100 data-resizing:opacity-100',
  ),
);

interface TableResizeHandlerProps<T> {
  header: Header<T, unknown>;
}

export const TableResizeHandler = <T,>({ header }: TableResizeHandlerProps<T>) => (
  <div
    onMouseDown={header.getResizeHandler()}
    onTouchStart={header.getResizeHandler()}
    className={cn(tableResizeHandlerVariants())}
    data-resizing={header.column.getIsResizing() || undefined}
    tabIndex={-1}
  />
);

TableResizeHandler.displayName = 'TableResizeHandler';
