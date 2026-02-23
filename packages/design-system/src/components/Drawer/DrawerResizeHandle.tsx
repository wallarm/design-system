import {
  type FC,
  type MouseEvent as ReactMouseEvent,
  type Ref,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { cva } from 'class-variance-authority';
import { throttle } from 'lodash-es';
import { cn } from '../../utils/cn';
import { Tooltip, TooltipContent, TooltipTrigger } from '../Tooltip';
import { useDrawerContext } from './DrawerContext';

const drawerResizeHandleVariants = cva(
  cn(
    'absolute left-0 top-0 bottom-0 z-1',
    '-translate-x-1/2',
    'w-12 py-12',
    'outline-none cursor-col-resize',
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

interface DrawerResizeHandleCoordinates {
  startX: number;
  startWidth: number;
}

export interface DrawerResizeHandleProps {
  ref?: Ref<HTMLButtonElement>;
}

export const DrawerResizeHandle: FC<DrawerResizeHandleProps> = ({ ref }) => {
  const { setWidth, setIsResizing, minWidth, maxWidth } = useDrawerContext();

  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const dragStateRef = useRef<DrawerResizeHandleCoordinates>({
    startX: 0,
    startWidth: 0,
  });

  const handleMouseEnter = () => setIsHovered(true);

  const handleMouseLeave = () => setIsHovered(false);

  const handleMouseDown = (e: ReactMouseEvent) => {
    e.preventDefault();

    // Get the actual drawer content element width
    const drawerContent = e.currentTarget.closest('[role="dialog"]') as HTMLElement;

    if (!drawerContent) return;

    const currentWidth = drawerContent.offsetWidth;

    dragStateRef.current = {
      startX: e.clientX,
      startWidth: currentWidth,
    };

    setIsDragging(true);
    setIsResizing(true);
  };

  // Throttled mouse move handler - memoized to prevent recreation
  const handleMouseMove = useMemo(
    () =>
      throttle((e: MouseEvent) => {
        const { startX, startWidth } = dragStateRef.current;
        // Moving left increases width, moving right decreases
        const delta = startX - e.clientX;
        const newWidth = Math.min(Math.max(startWidth + delta, minWidth), maxWidth);
        setWidth(newWidth); // Always set as number (pixels) after resize starts
      }, 16), // ~60fps
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
    <Tooltip positioning={{ placement: 'left' }} open={isHovered && !isDragging}>
      <TooltipTrigger
        ref={ref}
        className={cn(drawerResizeHandleVariants({ barIsVisible }))}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseDown={handleMouseDown}
      />

      <TooltipContent>Drag to resize</TooltipContent>
    </Tooltip>
  );
};

DrawerResizeHandle.displayName = 'DrawerResizeHandle';
