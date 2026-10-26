import {
  type FC,
  type KeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { cva } from 'class-variance-authority';

import { cn } from '../../utils/cn';
import { throttle } from '../../utils/throttle';
import { useNavPanelInternalContext } from './NavPanelContext';

const resizeHandleVariants = cva(
  cn(
    'absolute top-0 right-0 bottom-0 z-1 w-12',
    'translate-x-1/2',
    'cursor-ew-resize outline-none',
    'flex items-center justify-center',

    // pseudo-element (resize bar)
    'before:content-[""]',
    'before:block',
    'before:h-full before:w-3',
    'before:rounded-full',
    'before:bg-bg-fill-brand',
    'before:transition-opacity before:duration-150',
    'focus-visible:before:opacity-100',
  ),
  {
    variants: {
      barIsVisible: {
        true: 'before:opacity-100',
        false: 'before:opacity-0',
      },
    },
  },
);

interface ResizeHandleCoordinates {
  startX: number;
  startWidth: number;
}

export const NavPanelResizeHandle: FC = () => {
  const { width, setWidth, setIsResizing, minWidth, maxWidth } = useNavPanelInternalContext();

  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const dragStateRef = useRef<ResizeHandleCoordinates>({
    startX: 0,
    startWidth: 0,
  });

  const handleMouseDown = (e: ReactMouseEvent) => {
    e.preventDefault();

    const navPanel = e.currentTarget.closest('[data-slot="nav-panel"]') as HTMLElement | null;
    if (!navPanel) return;

    dragStateRef.current = {
      startX: e.clientX,
      startWidth: navPanel.offsetWidth,
    };

    setIsDragging(true);
    setIsResizing(true);
  };

  const handleMouseMove = useMemo(
    () =>
      // oxlint-disable-next-line react/refs -- throttle only calls this handler from mouse events/timers, never during construction.
      throttle((e: MouseEvent) => {
        const { startX, startWidth } = dragStateRef.current;
        const delta = e.clientX - startX;
        const newWidth = Math.min(Math.max(startWidth + delta, minWidth), maxWidth);
        setWidth(newWidth);
      }, 16),
    [minWidth, maxWidth, setWidth],
  );

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
      handleMouseMove.cancel();
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      handleMouseMove.cancel();
    };
  }, [isDragging, handleMouseMove, setIsResizing]);

  const barIsVisible = isHovered || isDragging;

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    let next: number;
    if (event.key === 'ArrowLeft') next = width - 10;
    else if (event.key === 'ArrowRight') next = width + 10;
    else if (event.key === 'Home') next = minWidth;
    else if (event.key === 'End') next = maxWidth;
    else return;
    event.preventDefault();
    event.stopPropagation();
    setWidth(Math.min(maxWidth, Math.max(minWidth, next)));
  };

  return (
    <div
      // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- This focusable range separator resizes a pane; a thematic-break hr is not the control.
      role='separator'
      aria-label='Resize navigation panel'
      tabIndex={0}
      aria-orientation='vertical'
      aria-valuenow={width}
      aria-valuemin={minWidth}
      aria-valuemax={maxWidth}
      data-slot='nav-panel-resize-handle'
      className={cn(resizeHandleVariants({ barIsVisible }))}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseDown={handleMouseDown}
      onKeyDown={handleKeyDown}
    />
  );
};

NavPanelResizeHandle.displayName = 'NavPanelResizeHandle';
