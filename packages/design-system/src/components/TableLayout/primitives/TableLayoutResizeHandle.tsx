import { type ComponentPropsWithRef, forwardRef, type PointerEvent, useRef, useState } from 'react';
import { cn } from '../../../utils/cn';
import { tableLayoutResizeHandle } from '../classes';
import { useTableLayoutContext } from '../TableLayoutContext';

export interface TableLayoutResizeHandleProps
  extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
  columnId: string;
}

const clamp = (value: number, min?: number, max?: number): number => {
  let v = value;
  if (min !== undefined) v = Math.max(min, v);
  if (max !== undefined) v = Math.min(max, v);
  return v;
};

export const TableLayoutResizeHandle = forwardRef<HTMLDivElement, TableLayoutResizeHandleProps>(
  ({ className, columnId, onPointerDown, ...rest }, ref) => {
    const { getColumn, setColumnSize, resizeMode } = useTableLayoutContext();
    const [resizing, setResizing] = useState(false);
    const start = useRef<{ x: number; width: number }>({ x: 0, width: 0 });

    const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
      onPointerDown?.(event);
      if (event.defaultPrevented || !setColumnSize) return;
      const resolved = getColumn(columnId);
      start.current = {
        x: event.clientX,
        width: resolved?.width ?? event.currentTarget.parentElement?.offsetWidth ?? 0,
      };
      setResizing(true);
      event.currentTarget.setPointerCapture(event.pointerId);

      const widthAt = (clientX: number): number =>
        clamp(
          start.current.width + (clientX - start.current.x),
          resolved?.minWidth,
          resolved?.maxWidth,
        );
      const onMove = (e: globalThis.PointerEvent) => {
        if (resizeMode === 'onChange') setColumnSize(columnId, widthAt(e.clientX));
      };
      const onUp = (e: globalThis.PointerEvent) => {
        if (resizeMode === 'onEnd') setColumnSize(columnId, widthAt(e.clientX));
        setResizing(false);
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
      };
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
    };

    return (
      <div
        ref={ref}
        role='separator'
        tabIndex={0}
        aria-orientation='vertical'
        aria-valuenow={0}
        data-slot='resize-handle'
        data-resizing={resizing || undefined}
        className={cn(tableLayoutResizeHandle, className)}
        onPointerDown={handlePointerDown}
        {...rest}
      />
    );
  },
);
TableLayoutResizeHandle.displayName = 'TableLayoutResizeHandle';
