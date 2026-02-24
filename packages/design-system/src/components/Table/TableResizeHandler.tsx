import type { Header } from '@tanstack/react-table';
import { cva } from 'class-variance-authority';
import { cn } from '../../utils/cn';

const tableResizeHandlerVariants = cva(
  cn(
    'absolute z-50 top-3 bottom-3 right-0 w-3 translate-x-2 isolate',
    'cursor-col-resize select-none touch-none',
    'opacity-0 transition-opacity',
    'hover:opacity-100 data-resizing:opacity-100',
    'before:content-[""] before:absolute before:inset-0 before:z-1 before:rounded-2 before:bg-bg-fill-brand',
    'after:content-[""] after:absolute after:top-0 after:left-1/2 after:-translate-x-1/2',
    'after:w-px after:h-[9999px] after:border-l after:border-dashed after:border-border-strong-primary',
    'after:pointer-events-none after:opacity-0 after:transition-opacity',
    'data-resizing:after:opacity-100',
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
