import {
  type FC,
  type MouseEvent as ReactMouseEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { cva } from 'class-variance-authority';
import { throttle } from 'lodash-es';
import { cn } from '../../utils/cn';
import { useNavPanelInternalContext } from './NavPanelContext';

const resizeHandleVariants = cva(
  cn(
    'absolute right-0 top-0 bottom-0 z-1 w-12',
    'translate-x-1/2',
    'outline-none cursor-ew-resize',
    'flex items-center justify-center',

    // pseudo-element (resize bar)
    'before:content-[""]',
    'before:block',
    'before:w-3 before:h-full',
    'before:rounded-full',
    'before:bg-bg-fill-brand',
    'before:transition-opacity before:duration-150',
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

  return (
    <div
      role='separator'
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
    />
  );
};

NavPanelResizeHandle.displayName = 'NavPanelResizeHandle';
