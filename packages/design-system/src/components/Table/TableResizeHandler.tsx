import type { KeyboardEvent } from 'react';

import type { Header, RowData } from '@tanstack/react-table';
import { cva } from 'class-variance-authority';

import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';
import { type DSTableFeatures, useTableValue } from './lib';
import { useTableContext } from './TableContext';

// Focusable column separator: arrows resize by 10px; Home/End use the configured bounds.
const tableResizeHandlerVariants = cva(
  cn(
    'absolute top-3 right-0 bottom-3 isolate z-50 w-3 translate-x-2',
    'cursor-col-resize touch-none select-none',
    'opacity-0 transition-opacity',
    'hover:opacity-100 focus-visible:opacity-100 data-resizing:opacity-100',
    'before:absolute before:inset-0 before:z-1 before:rounded-2 before:bg-bg-fill-brand before:content-[""]',
    'after:absolute after:top-0 after:left-1/2 after:-translate-x-1/2 after:content-[""]',
    'after:h-[9999px] after:w-px after:border-l after:border-dashed after:border-border-strong-primary',
    'after:pointer-events-none after:opacity-0 after:transition-opacity',
    'data-resizing:after:opacity-100',
  ),
);

interface TableResizeHandlerProps<T extends RowData> {
  header: Header<DSTableFeatures, T, unknown>;
}

export const TableResizeHandler = <T extends RowData>({ header }: TableResizeHandlerProps<T>) => {
  const testId = useTestId('resize');
  const { table } = useTableContext<T>();
  const width = useTableValue(() => header.column.getSize());
  const minWidth = header.column.columnDef.minSize ?? 20;
  const maxWidth = header.column.columnDef.maxSize ?? Number.MAX_SAFE_INTEGER;
  const label =
    typeof header.column.columnDef.header === 'string'
      ? header.column.columnDef.header
      : header.column.id;

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    let next: number;
    if (event.key === 'ArrowLeft') next = width - 10;
    else if (event.key === 'ArrowRight') next = width + 10;
    else if (event.key === 'Home') next = minWidth;
    else if (event.key === 'End' && maxWidth < Number.MAX_SAFE_INTEGER) next = maxWidth;
    else return;
    event.preventDefault();
    event.stopPropagation();
    table.setColumnSizing(previous => ({
      ...previous,
      [header.column.id]: Math.min(maxWidth, Math.max(minWidth, next)),
    }));
  };
  const isResizing = useTableValue(() => header.column.getIsResizing());

  return (
    <div
      // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- An adjustable column boundary is an interactive separator, not a thematic-break hr.
      role='separator'
      aria-label={`Resize ${label} column`}
      aria-orientation='vertical'
      aria-valuenow={width}
      aria-valuemin={minWidth}
      aria-valuemax={maxWidth < Number.MAX_SAFE_INTEGER ? maxWidth : undefined}
      onKeyDown={handleKeyDown}
      onMouseDown={header.getResizeHandler()}
      onTouchStart={header.getResizeHandler()}
      className={cn(tableResizeHandlerVariants())}
      data-slot='resize-handle'
      data-testid={testId}
      data-resizing={isResizing || undefined}
      tabIndex={0}
    />
  );
};

TableResizeHandler.displayName = 'TableResizeHandler';
