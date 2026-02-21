import type { Header } from '@tanstack/react-table';
import { cva } from 'class-variance-authority';
import { cn } from '../../utils/cn';

const tableResizeHandlerVariants = cva(
  cn(
    'absolute z-50 top-3 bottom-3 right-0 rounded-2 w-3 translate-x-2',
    'cursor-col-resize select-none touch-none',
    'hover:bg-bg-fill-brand transition-colors',
  ),
  {
    variants: {
      isResizing: {
        true: 'bg-bg-fill-brand',
      },
    },
  },
);

interface TableResizeHandlerProps<T> {
  header: Header<T, unknown>;
}

export const TableResizeHandler = <T,>({ header }: TableResizeHandlerProps<T>) => (
  <div
    onMouseDown={header.getResizeHandler()}
    onTouchStart={header.getResizeHandler()}
    className={cn(tableResizeHandlerVariants({ isResizing: header.column.getIsResizing() }))}
  />
);

TableResizeHandler.displayName = 'TableResizeHandler';
